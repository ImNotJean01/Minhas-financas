import { createClient } from '@supabase/supabase-js';

const DEFAULT_SUPABASE_URL = 'https://wswywyjlspocupuowuuc.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'sb_publishable_KmmGaxxm_jlmqkSrSmMUng_RSlLIpfi';

export function getSupabaseCredentials() {
  const envUrl = import.meta.env.VITE_SUPABASE_URL || '';
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

  const url = (envUrl || DEFAULT_SUPABASE_URL).trim();
  const anonKey = (envKey || DEFAULT_SUPABASE_ANON_KEY).trim();

  return {
    url,
    anonKey,
    isConfigured: Boolean(url && anonKey && url.startsWith('http')),
  };
}

let cachedClient = null;
let cachedConfigSignature = '';

export function getSupabaseClient() {
  const { url, anonKey, isConfigured } = getSupabaseCredentials();
  if (!isConfigured) return null;

  const signature = `${url}::${anonKey}`;
  if (!cachedClient || cachedConfigSignature !== signature) {
    cachedClient = createClient(url, anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });
    cachedConfigSignature = signature;
  }

  return cachedClient;
}

export const supabase = getSupabaseClient();
