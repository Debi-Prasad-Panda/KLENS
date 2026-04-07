/**
 * Supabase Client Configuration
 * 
 * Initializes the Supabase client for authentication and database operations.
 * Uses environment variables for configuration.
 */

import { createClient } from '@supabase/supabase-js'

const fallbackUrl = 'http://127.0.0.1:54321'
const fallbackAnonKey = 'public-anon-key'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || fallbackUrl
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || fallbackAnonKey
const supabaseStorageKey = import.meta.env.VITE_SUPABASE_STORAGE_KEY || 'klens-auth'

if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
  console.warn('⚠️ Supabase environment variables not set. Auth features will not work.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Use a project-specific key to avoid sharing session state with other localhost apps.
    storageKey: supabaseStorageKey,
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
