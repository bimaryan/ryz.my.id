
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env.local') });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY,
  {
    auth: { autoRefreshToken: false, persistSession: false }
  }
);

const checkTableSchema = async () => {
  try {
    console.log('=== Checking Orders Table Schema ===\n');

    // 1. Coba fetch satu order (untuk lihat kolom yang ada)
    console.log('1. Checking what columns exist in "orders" table...');
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .limit(1);

    if (error) {
      console.error('❌ Error fetching orders:', error);
      
      // Coba buat dummy order tanpa kolom payment_provider
      console.log('\n2. Trying to create dummy order (without payment_provider)...');
      const dummyId = `dummy-${Date.now()}`;
      const { data: insertData, error: insertError } = await supabase
        .from('orders')
        .insert({
          id: dummyId,
          status: 'pending',
          amount: 10000
        })
        .select()
        .single();

      if (insertError) {
        console.error('❌ Error creating dummy order:', insertError);
      } else {
        console.log('✅ Dummy order created! Columns:', Object.keys(insertData));
        console.log('Full dummy order:', insertData);
      }
      
    } else if (data && data.length > 0) {
      console.log('✅ Order found! Columns in table:', Object.keys(data[0]));
      console.log('Sample order:', data[0]);
    } else {
      console.log('⚠️ No orders found, trying to create dummy order...');
      const dummyId = `dummy-${Date.now()}`;
      const { data: insertData, error: insertError } = await supabase
        .from('orders')
        .insert({
          id: dummyId,
          status: 'pending',
          amount: 10000
        })
        .select()
        .single();

      if (insertError) {
        console.error('❌ Error creating dummy order:', insertError);
      } else {
        console.log('✅ Dummy order created! Columns:', Object.keys(insertData));
      }
    }

  } catch (error) {
    console.error('❌ Check failed:', error);
  }
};

checkTableSchema();
