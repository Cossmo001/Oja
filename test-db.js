import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

async function test() {
  const { data: users, error: err1 } = await supabase.from('users').select('*');
  console.log('Users:', users, err1);

  const { data: products, error: err2 } = await supabase.from('products').select('*');
  console.log('Products:', products, err2);
}

test();
