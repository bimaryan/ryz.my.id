
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env.local') });

// Initialize Supabase with service role key for bypassing RLS
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

const testUpdateOrder = async () => {
  try {
    // Buat test order ID
    const testOrderId = `test-order-${Date.now()}`;
    
    console.log('Supabase URL:', process.env.SUPABASE_URL);
    console.log('Testing Supabase update...');
    console.log('Test Order ID:', testOrderId);

    // Pertama, insert test order ke Supabase
    console.log('1. Inserting test order...');
    const { data: insertData, error: insertError } = await supabase
      .from('orders')
      .insert({
        id: testOrderId,
        status: 'pending',
        amount: 10000,
        payment_provider: 'pakasir'
      })
      .select()
      .single();

    if (insertError) {
      console.error('❌ Failed to insert test order:', insertError);
      return;
    }

    console.log('✅ Test order inserted:', insertData);

    // Sekarang update statusnya
    console.log('2. Updating order status to paid...');
    const { data: updateData, error: updateError } = await supabase
      .from('orders')
      .update({
        status: 'paid',
        payment_provider: 'pakasir',
        pakasir_order_id: testOrderId
      })
      .eq('id', testOrderId)
      .select()
      .single();

    if (updateError) {
      console.error('❌ Failed to update order:', updateError);
    } else {
      console.log('✅ Order updated successfully:', updateData);
    }

    // Coba coba lihat semua orders
    console.log('3. Fetching all orders...');
    const { data: orders, error: fetchError } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (fetchError) {
      console.error('❌ Failed to fetch orders:', fetchError);
    } else {
      console.log(`✅ Total orders found: ${orders?.length || 0}`);
      console.log('Orders:', orders);
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
};

testUpdateOrder();
