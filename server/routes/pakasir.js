
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

router.post('/create-invoice', async (req, res) => {
  try {
    const { order_id, redirect_url } = req.body;

    if (!order_id) {
      return res.status(400).json({ success: false, message: 'Missing order_id' });
    }

    console.log('[PAKASIR] Create Invoice Request for Order:', order_id);

    let realAmount = null;

    // Try finding the order in 'orders' table
    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .select('amount')
      .eq('id', order_id)
      .single();

    if (!orderError && orderData) {
      realAmount = orderData.amount;
      // Hardcode/Force status to pending in DB just in case it was tampered from frontend
      await supabase.from('orders').update({ status: 'pending' }).eq('id', order_id);
    } else {
      // If not in 'orders', try 'billing_history'
      const { data: billingData, error: billingError } = await supabase
        .from('billing_history')
        .select('amount')
        .eq('midtrans_order_id', order_id)
        .single();

      if (!billingError && billingData) {
        realAmount = billingData.amount;
        // Hardcode/Force status to pending in DB
        await supabase.from('billing_history').update({ status: 'pending' }).eq('midtrans_order_id', order_id);
      }
    }

    if (realAmount === null || realAmount === undefined) {
      console.error('[PAKASIR] Order not found for ID:', order_id);
      return res.status(404).json({ success: false, message: 'Order not found in database' });
    }

    const slug = process.env.PAKASIR_SLUG || 'ryzlink';
    // Use realAmount from DB, completely ignoring any amount sent by client
    let paymentUrl = `https://app.pakasir.com/pay/${slug}/${realAmount}?order_id=${order_id}`;
    
    if (redirect_url) {
      paymentUrl += `&redirect=${encodeURIComponent(redirect_url)}`;
    }

    console.log('[PAKASIR] Payment URL Generated (Amount Protected):', paymentUrl);
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

    // Try updating ORDERS table first
    let updateResult = null;
    let tableUsed = null;

    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .update({ status: dbStatus })
      .eq('id', order_id)
      .select();

    if (!orderError && orderData && orderData.length > 0) {
      updateResult = orderData;
      tableUsed = 'orders';
    } else {
      // If not found in orders, try BILLING_HISTORY table
      console.log('[PAKASIR WEBHOOK] Not found in orders, trying billing_history...');
      const { data: billingData, error: billingError } = await supabase
        .from('billing_history')
        .update({ status: dbStatus })
        .eq('midtrans_order_id', order_id)
        .select();

      if (!billingError && billingData && billingData.length > 0) {
        updateResult = billingData;
        tableUsed = 'billing_history';
      }
    }

    if (!updateResult) {
      console.error('[PAKASIR WEBHOOK] No record found for order_id:', order_id);
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    console.log(`[PAKASIR WEBHOOK] Updated ${tableUsed} successfully:`, updateResult);
    res.json({ success: true, message: 'Webhook received', data: updateResult, table: tableUsed });
  } catch (error) {
    console.error('[PAKASIR WEBHOOK] Error:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

router.get('/check-status/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;
    console.log('[PAKASIR] Checking status for:', orderId);

    let status = 'pending';

    // Try ORDERS first
    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .select('status')
      .eq('id', orderId)
      .single();

    if (!orderError && orderData) {
      status = orderData.status;
    } else {
      // Try BILLING_HISTORY
      const { data: billingData, error: billingError } = await supabase
        .from('billing_history')
        .select('status')
        .eq('midtrans_order_id', orderId)
        .single();

      if (!billingError && billingData) {
        status = billingData.status;
      }
    }

    console.log('[PAKASIR] Final Status:', status);
    res.json({ success: true, status: status });
  } catch (error) {
    console.error('[PAKASIR] Check Error:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

export default router;
