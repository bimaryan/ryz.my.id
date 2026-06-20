
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env.local') });
dotenv.config({ path: path.join(__dirname, '../.env.local') });

const PAKASIR_BASE_URL = 'https://api.pakasir.com/v1';
const apiKey = process.env.PAKASIR_API_KEY || 'jzk2CUvf3HbLEr7sFkXHngOVEuq8t6zk';

const testCreateInvoice = async () => {
  try {
    console.log('Testing Pakasir Create Invoice...');
    console.log('API Key:', apiKey ? `${apiKey.slice(0, 10)}...` : 'NOT FOUND');
    console.log('URL:', `${PAKASIR_BASE_URL}/invoices`);

    const payload = {
      order_id: `test-${Date.now()}`,
      amount: 10000,
      description: 'Test Payment',
      customer: {
        name: 'Test User',
        email: 'test@example.com',
        phone: '08123456789'
      },
      items: [
        {
          name: 'Test Product',
          price: 10000,
          quantity: 1
        }
      ]
    };

    console.log('Payload:', JSON.stringify(payload, null, 2));

    const response = await fetch(`${PAKASIR_BASE_URL}/invoices`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(payload)
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers));

    const data = await response.json();
    console.log('Response data:', JSON.stringify(data, null, 2));

  } catch (error) {
    console.error('Error testing Pakasir:', error);
  }
};

testCreateInvoice();
