
import express from 'express';
import { createClient } from '@supabase/supabase-js';

const router = express.Router();

// Initialize Supabase with Service Role Key (IMPORTANT for bypassing RLS)
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

// 1. Create Payment URL (Simple - using Pakasir URL Redirect)
router.post('/create-invoice', (req, res) => {
  try {
    const {
      order_id,
      gross_amount,
      redirect_url
    } = req.body;

    console.log('[PAKASIR] Create Invoice Request:', { order_id, gross_amount });

    const slug = process.env.PAKASIR_SLUG || 'ryzlink';
    let paymentUrl = `https://app.pakasir.com/pay/${slug}/${gross_amount}?order_id=${order_id}`;
    
    if (redirect_url) {
      paymentUrl += `&redirect=${encodeURIComponent(redirect_url)}`;
    }

    console.log('[PAKASIR] Generated Payment URL:', paymentUrl);

    res.json({
      success: true,
      payment_url: paymentUrl
    });
  } catch (error) {
    console.error('[PAKASIR] Create Invoice Error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal Server Error',
      error: error.message
    });
  }
});

// 2. Webhook Handler (Update Supabase dengan Service Role Key
router.post('/webhook', async (req, res) => {
  try {
    const notification = req.body;
    console.log('[PAKASIR WEBHOOK] Received:', JSON.stringify(notification, null, 2));

    const {
      order_id,
      status
    } = notification;

    if (!order_id) {
      console.error('[PAKASIR WEBHOOK] Missing order_id');
      return res.status(400).json({
        success: false,
        message: 'Order ID is required'
      });
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
      default:
        dbStatus = 'pending';
        break;
    }

    console.log(`[PAKASIR WEBHOOK] Updating order ${order_id} to ${dbStatus}`);

    // Update Supabase (with Service Role Key - bypass RLS)
    const { data, error } = await supabase
      .from('orders')
      .update({
        status: dbStatus,
        payment_provider: 'pakasir',
        pakasir_order_id: order_id
      })
      .eq('id', order_id)
      .select();

    if (error) {
      console.error('[PAKASIR WEBHOOK] Supabase Update Error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to update database',
        error: error
      });
    }

    console.log('[PAKASIR WEBHOOK] Order Updated:', data);
    res.json({
      success: true,
      message: 'Webhook processed successfully',
      data: data
    });
  } catch (error) {
    console.error('[PAKASIR WEBHOOK] Error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal Server Error'
    });
  }
});

// 3. Check Payment Status (check Supabase langsung
router.get('/check-status/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;
    console.log('[PAKASIR] Checking status for order:', orderId);

    const { data, error } = await supabase
      .from('orders')
      .select('status')
      .eq('id', orderId)
      .single();

    if (error) {
      console.error('[PAKASIR] Failed to fetch status:', error);
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    console.log('[PAKASIR] Order status:', data.status);
    res.json({
      success: true,
      status: data.status
    });
  } catch (error) {
    console.error('[PAKASIR] Check Status Error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal Server Error'
    });
  }
});

export default router;
