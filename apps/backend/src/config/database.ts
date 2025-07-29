import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey || supabaseUrl === 'your_supabase_project_url') {
  console.warn('⚠️  Supabase environment variables not configured properly');
  console.warn('⚠️  Please update apps/backend/.env with your actual Supabase credentials');
  console.warn('⚠️  Running in mock mode - database operations will fail');
}

// Create a dummy client if credentials are not set
export const supabase = (supabaseUrl && supabaseServiceKey && supabaseUrl !== 'your_supabase_project_url') 
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : null as any;