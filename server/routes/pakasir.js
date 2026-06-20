
import express from 'express';
import { createClient } from '@supabase/supabase-js';

const router = express.Router();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY,
  {
    auth: { autoRefreshToken: false, persistSession: false }
  }
);

router.post('/create-invoice', (req, res) => {
  try {
    const { order_id, gross_amount, redirect_url } = req.body;

    console.log('[PAKASIR] Create Invoice:', { order_id, gross_amount });

    const slug = process.env.PAKASIR_SLUG || 'ryzlink';
    let paymentUrl = `https://app.pakasir.com/pay/${slug}/${gross_amount}?order_id=${order_id}`;
    
    if (redirect_url) {
      paymentUrl += `&redirect=${encodeURIComponent(redirect_url)}`;
    }

    console.log('[PAKASIR] Payment URL:', paymentUrl);
    res.json({ success: true, payment_url: paymentUrl });
  } catch (error) {
    console.error('[PAKASIR] Error:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

router.post('/webhook', async (req, res) => {
  try {
    const notification = req.body;
    console.log('[PAKASIR WEBHOOK] Received:', JSON.stringify(notification, null, 2));

    const { order_id, status } = notification;

    if (!order_id) {
      return res.status(400).json({ success: false, message: 'Missing order_id' });
    }

    let dbStatus = 'pending';
    switch (status?.toLowerCase()) {
      case 'completed':
      case 'paid':
      case 'success':
        dbStatus = 'paid';
        break;
      case 'failed':
      case 'cancelled':
      case 'expired':
        dbStatus = 'failed';
        break;
    }

    console.log(`[PAKASIR WEBHOOK] Updating order ${order_id} to ${dbStatus}`);

    // Update orders table - using id UUID!
    const { data, error } = await supabase
      .from('orders')
      .update({
        status: dbStatus
      })
      .eq('id', order_id)
      .select();

    if (error) {
      console.error('[PAKASIR WEBHOOK] Supabase Error:', error);
      return res.status(500).json({ success: false, message: 'Database error', error: error });
    }

    console.log('[PAKASIR WEBHOOK] Update Result:', data);
    res.json({ success: true, message: 'Webhook received', data: data });
  } catch (error) {
    console.error('[PAKASIR WEBHOOK] Error:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

router.get('/check-status/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;
    console.log('[PAKASIR] Checking status for:', orderId);

    const { data, error } = await supabase
      .from('orders')
      .select('status')
      .eq('id', orderId)
      .single();

    if (error) {
      console.error('[PAKASIR] Check Error:', error);
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    console.log('[PAKASIR] Status:', data.status);
    res.json({ success: true, status: data.status });
  } catch (error) {
    console.error('[PAKASIR] Check Error:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

export default router;
