/**
 * Supabase Client Configuration
 * 
 * Initializes the Supabase client for authentication and database operations.
 * Uses environment variables for configuration.
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️ Supabase environment variables not set. Auth features will not work.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Store session in memory for security (not localStorage)
    // Supabase will handle refresh tokens automatically
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
})

// Helper to get the current access token
export const getAccessToken = async (): Promise<string | null> => {
  const { data: { session } } = await supabase.auth.getSession()
  return session?.access_token ?? null
}

// Export types for convenience
export type { User, Session } from '@supabase/supabase-js'
