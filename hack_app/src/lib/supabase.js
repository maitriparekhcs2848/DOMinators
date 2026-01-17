import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Strict validation of environment variables
if (!supabaseUrl || !supabaseUrl.startsWith('http')) {
  console.error('CRITICAL: VITE_SUPABASE_URL is missing or invalid.');
  throw new Error('VITE_SUPABASE_URL is required to run this application.');
}

if (!supabaseAnonKey) {
  console.error('CRITICAL: VITE_SUPABASE_ANON_KEY is missing.');
  throw new Error('VITE_SUPABASE_ANON_KEY is required to run this application.');
}

console.log('✅ Supabase Client Initializing...', { url: supabaseUrl });

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: window.localStorage,
    storageKey: 'sb-auth-token', // Explicit key for easier debugging
  }
});
