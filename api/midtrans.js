export default async function handler(req, res) {
  // Aktifkan CORS (dibutuhkan agar frontend bisa call API ini)
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*'); // Ubah ke domain Anda saat rilis jika perlu
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  // Handle preflight request (OPTIONS)
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Tolak selain POST
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const isProduction = process.env.VITE_MIDTRANS_IS_PRODUCTION === 'true';
    const serverKey = process.env.VITE_MIDTRANS_SERVER_KEY || 'SB-Mid-server-0TGPuhniptPemYTjz0tJl9K8';
    
    // Konversi ServerKey ke Base64 (Basic Auth)
    const authString = Buffer.from(serverKey + ':').toString('base64');
    
    // Pilih Endpoint (Sandbox / Production)
    const midtransUrl = isProduction
      ? 'https://app.midtrans.com/snap/v1/transactions'
      : 'https://app.sandbox.midtrans.com/snap/v1/transactions';

    // Meneruskan request dari Frontend ke Midtrans
    const response = await fetch(midtransUrl, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Basic ${authString}`
      },
      body: JSON.stringify(req.body) // Payload order dari frontend
    });
    
    const data = await response.json();

    // Kembalikan token midtrans ke frontend
    return res.status(response.status).json(data);
  } catch (error) {
    console.error('Midtrans API Error:', error);
    return res.status(500).json({ error: error.message });
  }
}
