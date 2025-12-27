// Correct imports
import { createClient, RealtimeChannel } from '@supabase/supabase-js'

// Environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Create the supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Export RealtimeChannel type for use in components
export { RealtimeChannel }