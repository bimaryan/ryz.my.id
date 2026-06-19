import express from 'express';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

const router = express.Router();

// Initialize Supabase with Service Role Key (Admin privileges to bypass RLS)
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY // Fallback for now if they haven't set it yet
);

// 1. Endpoint to generate Snap Token for Frontend
router.post('/token', async (req, res) => {
  try {
    const { order_id, gross_amount, customer_details, item_details } = req.body;

    const isProduction = process.env.MIDTRANS_IS_PRODUCTION === 'true';
    const serverKey = process.env.MIDTRANS_SERVER_KEY;

    if (!serverKey) {
      return res.status(500).json({ success: false, message: 'Server key not configured on backend' });
    }

    const midtransUrl = isProduction
      ? 'https://app.midtrans.com/snap/v1/transactions'
      : 'https://app.sandbox.midtrans.com/snap/v1/transactions';

    const authString = Buffer.from(serverKey + ':').toString('base64');

    const payload = {
      transaction_details: { order_id, gross_amount },
      customer_details,
      item_details
    };

    const response = await fetch(midtransUrl, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Basic ${authString}`
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Midtrans API Error:", data);
      return res.status(response.status).json({ success: false, error: data });
    }

    res.json({ success: true, token: data.token, redirect_url: data.redirect_url });

  } catch (error) {
    console.error('Error generating Midtrans token:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

// 2. Webhook / Notification Handler (Called by Midtrans directly)
router.post('/webhook', async (req, res) => {
  try {
    const notification = req.body;

    const {
      order_id,
      status_code,
      gross_amount,
      signature_key,
      transaction_status,
      fraud_status
    } = notification;

    const serverKey = process.env.MIDTRANS_SERVER_KEY;

    // Verify Signature Key to ensure this actually came from Midtrans!
    const hash = crypto.createHash('sha512');
    hash.update(`${order_id}${status_code}${gross_amount}${serverKey}`);
    const generatedSignature = hash.digest('hex');

    if (generatedSignature !== signature_key) {
      console.warn(`[MIDTRANS WEBHOOK] Invalid signature detected for order ${order_id}`);
      return res.status(401).json({ success: false, message: 'Invalid signature' });
    }

    console.log(`[MIDTRANS WEBHOOK] Valid notification received for order ${order_id}. Status: ${transaction_status}`);

    // Update the database based on transaction status
    let dbStatus = 'pending';

    if (transaction_status == 'capture') {
      if (fraud_status == 'challenge') {
        dbStatus = 'challenge';
      } else if (fraud_status == 'accept') {
        dbStatus = 'paid';
      }
    } else if (transaction_status == 'settlement') {
      dbStatus = 'paid';
    } else if (transaction_status == 'cancel' || transaction_status == 'deny' || transaction_status == 'expire') {
      dbStatus = 'failed';
    } else if (transaction_status == 'pending') {
      dbStatus = 'pending';
    }

    // Tangani Test Notification dari dashboard Midtrans
    if (order_id.startsWith('payment_notif_test_')) {
      return res.json({ success: true, message: 'Midtrans test notification received successfully' });
    }

    // Tangani transaksi Plan Upgrade (karena ini tidak masuk ke tabel orders yang butuh UUID)
    if (order_id.startsWith('PLAN_')) {
      // Untuk saat ini Plan upgrade ditangani oleh Frontend setelah success (SettingsPage.jsx)
      // Jadi Webhook cukup merespon OK agar Midtrans tidak retry.
      console.log(`[MIDTRANS WEBHOOK] Plan Upgrade transaction ${order_id} recorded.`);
      return res.json({ success: true, message: 'Plan upgrade webhook received' });
    }

    // Update Supabase menggunakan Service Role (Bypasses RLS)
    const { error } = await supabase
      .from('orders')
      .update({ 
        status: dbStatus, 
        midtrans_order_id: order_id 
      })
      .eq('id', order_id);

    if (error) {
      console.error('[MIDTRANS WEBHOOK] Failed to update Supabase:', error);
      return res.status(500).json({ success: false, message: 'Failed to update database' });
    }

    res.json({ success: true, message: 'Webhook processed successfully' });

  } catch (error) {
    console.error('[MIDTRANS WEBHOOK] Error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

export default router;
