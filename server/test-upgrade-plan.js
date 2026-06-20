
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

const testUpgradePlan = async () => {
  try {
    console.log('=== Test Upgrade Plan ===\n');

    // 1. Cari user test terlebih dahulu (kita butuh user_id)
    const { data: users, error: userError } = await supabase
      .from('auth.users')
      .select('*')
      .limit(1);

    let userId = null;
    if (userError || !users || users.length === 0) {
      console.log('⚠️ Tidak bisa menemukan user, buat dummy billing tanpa user_id');
    } else {
      userId = users[0].id;
      console.log('✅ Using user:', userId);
    }

    const orderId = `PLAN_PRO_${Date.now()}`;
    const planName = 'pro';
    const priceIDR = 50000;

    // 2. Buat billing_history entry seperti yang dilakukan di frontend
    console.log('1. Creating billing_history entry...');
    const { data: billingData, error: insertError } = await supabase
      .from('billing_history')
      .insert({
        plan_name: planName,
        amount: priceIDR,
        status: 'pending',
        midtrans_order_id: orderId,
        user_id: userId || '00000000-0000-0000-0000-000000000000'
      })
      .select()
      .single();

    if (insertError) {
      console.error('❌ Gagal buat billing entry:', insertError);
      return;
    }
    console.log('✅ Billing entry created:', billingData);

    // 3. Kirim test webhook ke server
    console.log('\n2. Sending webhook...');
    const webhookPayload = {
      order_id: orderId,
      status: 'paid'
    };

    const response = await fetch('http://localhost:5000/api/pakasir/webhook', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(webhookPayload)
    });

    const result = await response.json();
    console.log('Webhook response:', result);

    if (!result.success) {
      console.error('❌ Webhook failed');
      return;
    }

    // 4. Cek apakah billing_history sudah terupdate
    console.log('\n3. Checking billing history...');
    const { data: updatedBilling, error: checkError } = await supabase
      .from('billing_history')
      .select('*')
      .eq('id', billingData.id)
      .single();

    if (checkError) {
      console.error('❌ Gagal cek billing:', checkError);
      return;
    }

    console.log('✅ Final billing record:', updatedBilling);

    if (updatedBilling.status === 'paid') {
      console.log('\n🎉 SUCCESS! Upgrade plan status berubah menjadi PAID!');
    } else {
      console.log('\n❌ Status belum berubah:', updatedBilling.status);
    }
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
};

testUpgradePlan();
