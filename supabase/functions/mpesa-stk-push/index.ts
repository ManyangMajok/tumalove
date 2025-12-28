import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // 1. Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // 2. Setup Supabase Client (Service Role required for DB writes)
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // 3. Parse Request
    const { phoneNumber, amount, accountReference, creatorId, message, supporterName } = await req.json()

    if (!phoneNumber || !amount || !creatorId) {
      throw new Error('Missing required fields')
    }

    console.log(`Initiating payment for ${phoneNumber}, Amount: ${amount}, Name: ${supporterName}`)

    // 4. Generate M-Pesa Auth Token
    const consumerKey = Deno.env.get('MPESA_CONSUMER_KEY')
    const consumerSecret = Deno.env.get('MPESA_CONSUMER_SECRET')
    const passkey = Deno.env.get('MPESA_PASSKEY')
    const shortcode = Deno.env.get('MPESA_SHORTCODE') // Paybill or Till
    
    // Default callback URL
    const callbackUrl = Deno.env.get('MPESA_CALLBACK_URL') || `${Deno.env.get('SUPABASE_URL')}/functions/v1/mpesa-callback`

    const auth = btoa(`${consumerKey}:${consumerSecret}`)
    const authResp = await fetch('https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials', {
      headers: { Authorization: `Basic ${auth}` }
    })
    const { access_token } = await authResp.json()

    // 5. Prepare STK Push Payload
    const date = new Date()
    const timestamp = date.getFullYear() +
      ("0" + (date.getMonth() + 1)).slice(-2) +
      ("0" + date.getDate()).slice(-2) +
      ("0" + date.getHours()).slice(-2) +
      ("0" + date.getMinutes()).slice(-2) +
      ("0" + date.getSeconds()).slice(-2)

    const password = btoa(`${shortcode}${passkey}${timestamp}`)

    const stkPayload = {
      BusinessShortCode: shortcode,
      Password: password,
      Timestamp: timestamp,
      TransactionType: "CustomerPayBillOnline",
      Amount: Math.floor(amount),
      PartyA: phoneNumber,
      PartyB: shortcode,
      PhoneNumber: phoneNumber,
      CallBackURL: callbackUrl,
      AccountReference: accountReference || "Tumalove",
      TransactionDesc: "Tip Payment"
    }

    // 6. Send Request to Safaricom
    const mpesaResp = await fetch('https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${access_token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(stkPayload)
    })

    const mpesaData = await mpesaResp.json()
    console.log('M-Pesa Response:', mpesaData)

    if (mpesaData.ResponseCode !== "0") {
      throw new Error(mpesaData.errorMessage || 'M-Pesa request failed')
    }

    // ---------------------------------------------------------
    // 💰 REVENUE LOGIC: CALCULATE 5% FEE
    // ---------------------------------------------------------
    const COMMISSION_RATE = 0.05; // 5%
    const platformFee = Math.floor(amount * COMMISSION_RATE); // Round down to integer
    const netAmount = amount - platformFee; // This is what the creator gets

    // 7. CRITICAL STEP: Insert into Database IMMEDIATELY
    const { error: dbError } = await supabaseClient
      .from('transactions')
      .insert({
        creator_id: creatorId,
        amount: amount,            // Gross Amount (What supporter paid)
        platform_fee: platformFee, // Your Revenue
        net_amount: netAmount,     // Creator Balance
        
        phone_number: phoneNumber,
        checkout_request_id: mpesaData.CheckoutRequestID,
        merchant_request_id: mpesaData.MerchantRequestID,
        status: 'PENDING',
        
        supporter_name: supporterName || 'Anonymous', // Fixes "Anonymous" bug
        supporter_message: message || '',             // Fixes missing message bug
        
        metadata: {
            message: message,
            supporter_name: supporterName,
            account_reference: accountReference,
            stk_initiated_at: new Date().toISOString(),
            fee_calculation: "5%"
        }
      })

    if (dbError) {
      console.error('Database Insert Error:', dbError)
    }

    // 8. Return Success to Frontend
    return new Response(
      JSON.stringify({ 
        success: true, 
        checkout_request_id: mpesaData.CheckoutRequestID,
        merchant_request_id: mpesaData.MerchantRequestID,
        message: "STK Push sent successfully" 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error: any) {
    console.error('Edge Function Error:', error)
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})