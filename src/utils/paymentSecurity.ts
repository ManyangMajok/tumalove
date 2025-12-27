import { supabase } from '../supabaseClient'

export class PaymentSecurity {
  private static instance: PaymentSecurity
  private requestQueue: Map<string, number> = new Map()
  
  // Singleton Pattern
  private constructor() {}

  static getInstance(): PaymentSecurity {
    if (!PaymentSecurity.instance) {
      PaymentSecurity.instance = new PaymentSecurity()
    }
    return PaymentSecurity.instance
  }

  // SIMPLE LOCAL RATE LIMIT
  async checkLocalRateLimit(action: string): Promise<boolean> {
    const now = Date.now()
    const minute = Math.floor(now / 60000)
    const key = `${action}_${minute}`
    
    const currentCount = Array.from(this.requestQueue.entries())
      .filter(([k, v]) => k.startsWith(action) && now - v < 60000)
      .length
    
    if (currentCount >= 10) return false // Max 10 requests per minute
    
    this.requestQueue.set(key, now)
    return true
  }

  // INITIALIZE SECURE SESSION (FIXED NAME)
  async initSecureSession(): Promise<void> {
    try {
      // Try to get existing session
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        // Optionally create anonymous session (not required for payments)
        const { error } = await supabase.auth.signInAnonymously()
        if (error) {
          console.log('Anonymous session note:', error.message)
          // This is OK - we can still proceed with payments
        }
      }
    } catch (error) {
      console.log('Session initialization note:', error)
      // Don't throw - sessions are optional for payments
    }
  }

  // SIMPLE SECURE PAYMENT REQUEST - WORKS FOR ALL USERS
  async securePaymentRequest(payload: any): Promise<any> {
    // 1. Check local throttle
    if (!(await this.checkLocalRateLimit('payment'))) {
      throw new Error('Too many requests. Please wait a moment.')
    }

    // 🔥 FIX: Sanitize Payload
    // This ensures supporterName and message are never undefined when they hit the server
    const finalPayload = {
      ...payload,
      supporterName: payload.supporterName || 'Anonymous',
      message: payload.message || ''
    }

    try {
      // 2. Use Supabase's built-in function invocation
      const { data, error } = await supabase.functions.invoke('mpesa-stk-push', {
        body: finalPayload, // <--- Send the sanitized payload
      })

      if (error) {
        console.log('Function invoke error:', error)
        throw new Error(error.message || 'Payment processing failed')
      }
      
      return data
    } catch (error: any) {
      console.log('Payment request error:', error)
      
      // Fallback to fetch if invoke fails
      return await this.fallbackPaymentRequest(finalPayload) // <--- Send sanitized payload to fallback too
    }
  }

  // FALLBACK METHOD USING FETCH
  async fallbackPaymentRequest(payload: any): Promise<any> {
    // Get anon key from env
    const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
    
    if (!anonKey || !supabaseUrl) {
      throw new Error('Missing Supabase configuration')
    }

    const response = await fetch(
      `${supabaseUrl}/functions/v1/mpesa-stk-push`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${anonKey}`,
        },
        body: JSON.stringify(payload),
      }
    )

    const data = await response.json()

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Payment system error. Please refresh the page.')
      }
      if (response.status === 429) {
        throw new Error('Too many payment attempts. Please wait 5 minutes.')
      }
      throw new Error(data.error || 'Payment failed. Please try again.')
    }

    return data
  }
}

// Create and export the instance
export const paymentSecurity = PaymentSecurity.getInstance()