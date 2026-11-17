import { createClient } from '@supabase/supabase-js';

const DEFAULT_SUPABASE_URL = 'https://wswywyjlspocupuowuuc.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'sb_publishable_KmmGaxxm_jlmqkSrSmMUng_RSlLIpfi';

const STORAGE_URL_KEY = 'minhas_financas_supabase_url';
const STORAGE_ANON_KEY = 'minhas_financas_supabase_anon_key';

export function getSupabaseCredentials() {
  const envUrl = import.meta.env.VITE_SUPABASE_URL || '';
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

  const storedUrl =
    typeof window !== 'undefined'
      ? window.localStorage.getItem(STORAGE_URL_KEY) || ''
      : '';
  const storedKey =
    typeof window !== 'undefined'
      ? window.localStorage.getItem(STORAGE_ANON_KEY) || ''
      : '';

  const url = (envUrl || storedUrl || DEFAULT_SUPABASE_URL).trim();
  const anonKey = (envKey || storedKey || DEFAULT_SUPABASE_ANON_KEY).trim();

  return {
    url,
    anonKey,
    isConfigured: Boolean(url && anonKey && url.startsWith('http')),
    fromEnv: true,
  };
}

export function saveSupabaseCredentials(url, anonKey) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_URL_KEY, String(url || '').trim());
  window.localStorage.setItem(STORAGE_ANON_KEY, String(anonKey || '').trim());
}

export function clearSupabaseCredentials() {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(STORAGE_URL_KEY);
  window.localStorage.removeItem(STORAGE_ANON_KEY);
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
