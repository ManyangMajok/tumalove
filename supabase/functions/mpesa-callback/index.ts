import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// --- HELPER FUNCTIONS (PRESERVED) ---

// 1. Convert M-Pesa time (YYYYMMDDHHmmss) to ISO (YYYY-MM-DDTHH:mm:ssZ)
const formatMpesaDate = (mpesaTime: any) => {
  if (!mpesaTime) return new Date().toISOString()
  const t = mpesaTime.toString()
  const year = t.substring(0, 4)
  const month = t.substring(4, 6)
  const day = t.substring(6, 8)
  const hour = t.substring(8, 10)
  const minute = t.substring(10, 12)
  const second = t.substring(12, 14)
  return new Date(`${year}-${month}-${day}T${hour}:${minute}:${second}Z`).toISOString()
}

// 2. Normalize phone numbers for comparison
const normalizePhone = (phone: any) => {
  if (!phone) return ''
  let p = phone.toString().replace(/\s+/g, '').replace('+', '')
  if (p.startsWith('0')) {
    p = '254' + p.substring(1)
  }
  return p
}

// --- MAIN HANDLER ---

serve(async (req) => {
  try {
    const payload = await req.json()
    const { Body } = payload
    const { stkCallback } = Body
    
    console.log("M-Pesa Callback Received:", JSON.stringify(payload, null, 2))

    // 1. ADMIN CLIENT
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const checkoutRequestID = stkCallback.CheckoutRequestID
    const resultCode = stkCallback.ResultCode

    // =========================================================
    // 2. FAILURE CASE (PRESERVED)
    // =========================================================
    if (resultCode !== 0) {
      console.log(`Payment Failed - Code: ${resultCode}, Desc: ${stkCallback.ResultDesc}`)
      
      const { data: existing } = await supabaseAdmin
        .from('transactions')
        .select('*')
        .eq('checkout_request_id', checkoutRequestID)
        .single()
      
      if (existing) {
        if (existing.status === 'FAILED') {
           return new Response(JSON.stringify({ status: "already_failed" }), { status: 200 })
        }

        await supabaseAdmin
          .from('transactions')
          .update({
            mpesa_code: 'FAILED',
            status: 'FAILED',
            supporter_message: `Failed: ${stkCallback.ResultDesc}`,
            updated_at: new Date().toISOString(),
            metadata: {
              ...existing.metadata,
              failure_reason: stkCallback.ResultDesc,
              failure_code: resultCode,
              callback_received: new Date().toISOString()
            }
          })
          .eq('checkout_request_id', checkoutRequestID)
        
        // Log the failure for analytics
        await supabaseAdmin
          .from('security_audit_log')
          .insert({
            event_type: 'payment_failed',
            user_id: existing.auth_user_id,
            details: {
              checkout_id: checkoutRequestID,
              reason: stkCallback.ResultDesc,
              code: resultCode,
              amount: existing.amount
            },
            severity: 'low'
          })
      }
      
      return new Response(JSON.stringify({ 
        status: "failure_logged",
        checkout_id: checkoutRequestID
      }), { status: 200 })
    }

    // =========================================================
    // 3. SUCCESS CASE
    // =========================================================
    const metaItems = stkCallback.CallbackMetadata?.Item || []
    const getMeta = (name: string) => {
      const item = metaItems.find((i: any) => i.Name === name)
      return item ? item.Value : null
    }

    const mpesaReceipt = getMeta('MpesaReceiptNumber')
    const phoneNumber = getMeta('PhoneNumber')
    const amount = getMeta('Amount')
    const transactionDate = getMeta('TransactionDate')

    if (!mpesaReceipt) {
      throw new Error("Missing M-Pesa receipt number in callback")
    }

    const { data: transaction, error: fetchError } = await supabaseAdmin
      .from('transactions')
      .select('*')
      .eq('checkout_request_id', checkoutRequestID)
      .single()

    if (fetchError || !transaction) {
      console.error("Transaction not found:", checkoutRequestID)
      return new Response(JSON.stringify({ 
        error: "Transaction not found",
        checkout_id: checkoutRequestID
      }), { status: 404 })
    }

    if (transaction.status === 'COMPLETED') {
      console.log(`Transaction ${checkoutRequestID} already processed. Skipping.`)
      return new Response(JSON.stringify({ 
        status: "already_processed", 
        receipt: transaction.mpesa_code 
      }), { status: 200 })
    }

    // =========================================================
    // 4. FRAUD DETECTION (PRESERVED)
    // =========================================================
    const isSuspicious = 
      Number(transaction.amount) !== Number(amount) ||
      normalizePhone(transaction.phone_number) !== normalizePhone(phoneNumber)
    
    if (isSuspicious) {
      console.warn("⚠️ SUSPICIOUS CALLBACK DETECTED:", {
        checkoutId: checkoutRequestID,
        originalAmount: transaction.amount,
        callbackAmount: amount
      })
      
      // Mark for manual review (NO LEDGER UPDATE)
      await supabaseAdmin
        .from('transactions')
        .update({
           status: 'REVIEW',
           is_suspicious: true,
           metadata: {
              ...transaction.metadata,
              marked_for_review: true,
              callback_mismatch: { original: transaction.amount, callback: amount }
           }
        })
        .eq('id', transaction.id)

      await supabaseAdmin
        .from('security_audit_log')
        .insert({
          event_type: 'callback_mismatch',
          user_id: transaction.auth_user_id,
          details: {
            checkout_id: checkoutRequestID,
            original_amount: transaction.amount,
            callback_amount: amount
          },
          severity: 'high'
        })

      return new Response(JSON.stringify({ status: "flagged_for_review" }), { status: 200 })
    }

    // =========================================================
    // 5. ATOMIC LEDGER UPDATE (THE NEW UPGRADE)
    // =========================================================
    // This executes the RPC we wrote to safely credit the balance and ledger
    
    const { data: rpcData, error: rpcError } = await supabaseAdmin.rpc('process_payment_callback', {
        p_checkout_id: checkoutRequestID,
        p_receipt_number: mpesaReceipt,
        p_amount: amount,
        p_phone: phoneNumber?.toString()
    })

    if (rpcError) {
        console.error("RPC Ledger Error:", rpcError)
        throw new Error("Ledger update failed: " + rpcError.message)
    }

    // =========================================================
    // 6. METADATA UPDATE (PRESERVED FUNCTIONALITY)
    // =========================================================
    // The RPC handled the money, but we still want to save the raw callback JSON
    // for debugging/auditing purposes.
    
    const formattedDate = formatMpesaDate(transactionDate)
    
    await supabaseAdmin
      .from('transactions')
      .update({
        metadata: {
          ...transaction.metadata,
          callback_data: {
            receipt_number: mpesaReceipt,
            transaction_date: formattedDate,
            full_callback: payload
          },
          completed_at: new Date().toISOString()
        }
      })
      .eq('id', transaction.id)

    // =========================================================
    // 7. AUDIT LOG (PRESERVED)
    // =========================================================
    await supabaseAdmin
      .from('security_audit_log')
      .insert({
        event_type: 'payment_completed',
        user_id: transaction.auth_user_id,
        details: {
          checkout_id: checkoutRequestID,
          receipt: mpesaReceipt,
          amount: amount,
          creator_id: transaction.creator_id,
          ledger_updated: true
        },
        severity: 'low'
      })

    return new Response(JSON.stringify({ 
      status: "success",
      receipt_number: mpesaReceipt,
      amount: amount
    }), { status: 200 })

  } catch (error: any) {
    console.error("Callback processing error:", error)
    
    // Log critical error
    try {
      const supabaseAdmin = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      )
      
      await supabaseAdmin
        .from('security_audit_log')
        .insert({
          event_type: 'callback_processing_error',
          details: {
            error: error.message,
            stack: error.stack,
            timestamp: new Date().toISOString()
          },
          severity: 'critical'
        })
    } catch (logError) {
      console.error("Failed to log callback error:", logError)
    }
    
    return new Response(JSON.stringify({ 
      error: "Callback processing failed",
      timestamp: new Date().toISOString()
    }), { status: 500 })
  }
})