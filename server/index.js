import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { requireApiKey } from './middleware/auth.js';
import { securityHeaders, apiLimiter, checkBans, maliciousScanner, autoBanIp, autoBanDevice } from './middleware/security.js';

// Import Routes
import linksRouter from './routes/links.js';
import pakasirRouter from './routes/pakasir.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// Try to load .env from the server folder first (for 1Panel), then fallback to ../.env.local (for local dev)
dotenv.config({ path: path.join(__dirname, '.env') });
dotenv.config({ path: path.join(__dirname, '.env.local') });
dotenv.config({ path: path.join(__dirname, '../.env.local') });

const app = express();
const PORT = process.env.PORT || 5000;

// Enable if you're behind a reverse proxy
app.set('trust proxy', 1);

// Standard Middlewares (Must be before security/routes)
app.use(cors());
app.use(express.json());

// Apply Security Middlewares
app.use(securityHeaders);
app.use(maliciousScanner);
app.use(checkBans);

// Security Check Endpoint for Frontend
app.get('/api/check-security', (req, res) => {
    res.json({ 
        success: true, 
        message: 'You are allowed to access this site.', 
        detected_ip: req.ip,
        headers_forwarded: req.headers['x-forwarded-for'],
        detected_device_id: req.headers['x-device-id'] || 'Tidak Ada (Gunakan Frontend Baru)'
    });
});

// Endpoint for Frontend to Report Hackers
app.post('/api/report-malicious', (req, res) => {
    const forwarded = req.headers['x-forwarded-for'];
    const clientIp = forwarded ? forwarded.split(',')[0].trim() : (req.ip || req.connection.remoteAddress);
    const deviceId = req.headers['x-device-id'];
    
    if (clientIp) autoBanIp(clientIp);
    if (deviceId) autoBanDevice(deviceId);
    
    res.json({ success: true, message: 'Threat neutralized. Hacker banned.' });
});

// Basic health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'RYZ Shortlink API is running' });
});

// Protect all /api/v1 routes with API Key auth
app.use('/api/v1', apiLimiter); // Apply rate limiting to all API routes
app.use('/api/v1', requireApiKey);

// Mount Routes
app.use('/api/v1/links', linksRouter);
app.use('/api/pakasir', pakasirRouter);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred'
    }
  });
});

app.listen(PORT, () => {
  console.log(`✅ API Server is running on http://localhost:${PORT}`);
});
