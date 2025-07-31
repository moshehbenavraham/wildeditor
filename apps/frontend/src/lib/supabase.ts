import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Debug logging to check what's actually loaded
console.log('🔍 Supabase Config Debug:', {
  url: supabaseUrl,
  hasKey: !!supabaseAnonKey,
  keyLength: supabaseAnonKey?.length,
  env: import.meta.env.MODE,
  allEnvKeys: Object.keys(import.meta.env)
})

if (!supabaseUrl || !supabaseAnonKey || supabaseUrl === 'your_supabase_project_url') {
  console.warn('⚠️  Supabase environment variables not configured properly')
  console.warn('⚠️  Please update apps/frontend/.env with your actual Supabase credentials')
  console.warn('⚠️  Running in demo mode - authentication will not work')
}

// Create a dummy client if credentials are not set - this prevents runtime errors
export const supabase = (supabaseUrl && supabaseAnonKey && supabaseUrl !== 'your_supabase_project_url')
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
      }
    })
  : null as unknown as ReturnType<typeof createClient>