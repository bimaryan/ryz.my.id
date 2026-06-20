
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env.local') });

// Initialize Supabase
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

const testFullFlow = async () => {
  try {
    console.log('=== Testing Full Webhook Flow ===\n');

    // 1. Create test order in Supabase
    const testOrderId = `test-order-${Date.now()}`;
    console.log(`1. Creating test order: ${testOrderId}`);
    
    const { data: insertData, error: insertError } = await supabase
      .from('orders')
      .insert({
        id: testOrderId,
        status: 'pending',
        amount: 10000,
        payment_provider: 'pakasir',
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (insertError) {
      console.error('❌ Failed to insert order:', insertError);
      return;
    }
    console.log('✅ Test order created:', insertData);

    // 2. Simulate sending Pakasir webhook to our endpoint
    console.log('\n2. Simulating Pakasir webhook...');
    
    const webhookPayload = {
      order_id: testOrderId,
      status: 'paid', // Status yang kita ingin update
      amount: 10000,
      payment_method: 'qris'
    };

    const webhookUrl = 'http://localhost:5000/api/pakasir/webhook';
    
    console.log('Webhook URL:', webhookUrl);
    console.log('Webhook Payload:', JSON.stringify(webhookPayload, null, 2));

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(webhookPayload)
    });

    const webhookResult = await response.json();
    console.log('\nWebhook Response:', webhookResult);

    if (webhookResult.success) {
      console.log('✅ Webhook processed successfully!');
    } else {
      console.error('❌ Webhook failed:', webhookResult);
    }

    // 3. Check order status from database
    console.log('\n3. Checking order status...');
    const { data: checkData, error: checkError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', testOrderId)
      .single();

    if (checkError) {
      console.error('❌ Failed to check order:', checkError);
    } else {
      console.log('✅ Current order status:', checkData.status);
      console.log('Full order details:', checkData);
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
};

testFullFlow();
