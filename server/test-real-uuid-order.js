
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

const testWithRealUUID = async () => {
  try {
    console.log('=== Test with Real UUID Order ===\n');

    // 1. Create order in Supabase with UUID
    console.log('1. Creating order in Supabase...');
    const { data: order, error: insertError } = await supabase
      .from('orders')
      .insert({
        page_slug: 'test-page',
        product_id: 'test-prod-1',
        product_name: 'Test Product',
        amount: 10000,
        customer_name: 'Test Customer',
        status: 'pending'
      })
      .select()
      .single();

    if (insertError) {
      console.error('❌ Insert Error:', insertError);
      return;
    }

    console.log('✅ Order Created:', order.id);
    console.log('Initial Status:', order.status);

    // 2. Simulate sending webhook to our server
    console.log('\n2. Sending test webhook to server...');
    
    const webhookPayload = {
      order_id: order.id, // Use the real UUID!
      status: 'paid',
      amount: 10000
    };

    const response = await fetch('http://localhost:5000/api/pakasir/webhook', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(webhookPayload)
    });

    const result = await response.json();
    console.log('Webhook Response:', result);

    if (!result.success) {
      console.error('❌ Webhook failed!');
      return;
    }

    // 3. Check the order status in database
    console.log('\n3. Checking updated order status...');
    const { data: updatedOrder, error: checkError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', order.id)
      .single();

    if (checkError) {
      console.error('❌ Check Error:', checkError);
    } else {
      console.log('✅ Updated Status:', updatedOrder.status);
      if (updatedOrder.status === 'paid') {
        console.log('\n🎉 SUCCESS! Order status updated to "paid"!');
      }
    }

  } catch (error) {
    console.error('❌ Test Failed:', error);
  }
};

testWithRealUUID();
