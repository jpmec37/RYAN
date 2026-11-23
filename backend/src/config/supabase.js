import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey || supabaseKey === 'your_service_role_key_here') {
  console.error('AVISO: Configure SUPABASE_URL e SUPABASE_KEY no arquivo .env');
  console.error('Use a chave "service_role" (não a publishable key)');
  console.error('Supabase Dashboard > Settings > API > Project API keys > service_role');
}

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});