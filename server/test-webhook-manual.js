
// Script manual test webhook Pakasir
const apiUrl = 'http://localhost:5000/api/pakasir/webhook';

const testWebhook = async () => {
  // 1. Buat test order ID
  const testOrderId = `test-order-${Date.now()}`;
  console.log('Testing Webhook...');
  console.log('Test Order ID:', testOrderId);

  // 2. Pertama, insert test order ke Supabase manually (atau pakai yang sudah ada)
  console.log('\nSimulating order creation...');
  console.log('Order ID:', testOrderId);
  console.log('Now sending webhook with "completed" status...');

  // 3. Kirim test webhook ke endpoint kita
  const webhookPayload = {
    order_id: testOrderId,
    status: 'completed', // Ganti jadi 'paid' atau 'success' kalo perlu
    amount: 10000,
    payment_method: 'qris',
    timestamp: new Date().toISOString()
  };

  console.log('\nWebhook Payload:', JSON.stringify(webhookPayload, null, 2));
  console.log('Sending to:', apiUrl);

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(webhookPayload)
    });

    const result = await response.json();
    console.log('\nResponse Status:', response.status);
    console.log('Response:', JSON.stringify(result, null, 2));

    if (result.success) {
      console.log('\n✅ WEBHOOK SUCCESSFUL! Order status updated.');
    } else {
      console.log('\n❌ WEBHOOK FAILED.');
    }
  } catch (error) {
    console.error('\n❌ Error sending webhook:', error);
  }
};

testWebhook();
