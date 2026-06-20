
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env.local') });

const app = express();
const PORT = 5001; // Port terpisah buat test

app.use(cors());
app.use(express.json());

// Endpoint test create invoice yang simple
app.post('/test-pakasir', (req, res) => {
  try {
    const {
      order_id,
      gross_amount
    } = req.body;

    const slug = process.env.PAKASIR_SLUG || 'ryzlink';
    console.log('Test Pakasir Payload:', { order_id, gross_amount, slug });

    const paymentUrl = `https://app.pakasir.com/pay/${slug}/${gross_amount}?order_id=${order_id}`;
    console.log('Generated Payment URL:', paymentUrl);

    res.json({
      success: true,
      payment_url: paymentUrl
    });
  } catch (error) {
    console.error('Test Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Test server running on http://localhost:${PORT}`);
  console.log('Test it with: POST http://localhost:5001/test-pakasir');
});
