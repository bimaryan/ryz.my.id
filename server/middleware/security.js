import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BANS_FILE_PATH = path.join(__dirname, '../bans.json');

// Helmet Middleware for security headers
export const securityHeaders = helmet();

// Rate Limiting Middleware
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: {
    success: false,
    error: {
      code: 'TOO_MANY_REQUESTS',
      message: 'Too many requests from this IP, please try again after 15 minutes'
    }
  }
});

// Middleware to check banned IPs and Devices
export const checkBans = (req, res, next) => {
  try {
    const bansData = fs.readFileSync(BANS_FILE_PATH, 'utf8');
    const { bannedIPs, bannedDevices } = JSON.parse(bansData);

    // 1. Check IP
    // Using req.ip, which works if trust proxy is configured or directly connected
    const clientIp = req.ip || req.connection.remoteAddress;
    
    if (clientIp && bannedIPs.includes(clientIp)) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN_IP',
          message: 'Your IP address has been banned.'
        }
      });
    }

    // 2. Check Device (using custom header X-Device-ID or User-Agent fallback)
    const deviceId = req.headers['x-device-id'];
    const userAgent = req.headers['user-agent'];

    if (deviceId && bannedDevices.includes(deviceId)) {
       return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN_DEVICE',
          message: 'Your device has been banned.'
        }
      });
    }

    // We can optionally ban by exact User-Agent string if needed
    if (userAgent && bannedDevices.includes(userAgent)) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN_DEVICE',
          message: 'Your browser/device has been banned.'
        }
      });
    }

    next();
  } catch (error) {
    console.error('Error checking bans:', error);
    // Fail open if file doesn't exist or is invalid JSON
    next();
  }
};
