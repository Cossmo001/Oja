import { createClient } from '@supabase/supabase-js';

const getEnv = (key: string) => {
  try {
    // @ts-ignore
    if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[key]) {
      // @ts-ignore
      return import.meta.env[key];
    }
  } catch (e) {}
  if (typeof process !== 'undefined' && process.env && process.env[key]) {
    return process.env[key];
  }
  return '';
};

// Vite dynamically replaces import.meta.env.VITE_... if used explicitly, so we must explicitly use it or rely on it being on window/import.meta dynamically.
// Actually, explicitly writing it is safest for Vite static replacement:
let supabaseUrl = '';
let supabaseAnonKey = '';

try {
  // @ts-ignore
  supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  // @ts-ignore
  supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
} catch (e) {}

if (!supabaseUrl && typeof process !== 'undefined' && process.env) {
  supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '';
  supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '';
}

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Missing Supabase URL or Anon Key. Please set them in your .env file.');
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');
