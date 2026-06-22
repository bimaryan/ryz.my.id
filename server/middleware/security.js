import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BANS_FILE_PATH = path.join(__dirname, '../bans.json');

// Helper function to automatically ban an IP
export const autoBanIp = (ip) => {
  if (!ip || ip === '127.0.0.1' || ip === '::1') return; 
  try {
    const bansData = fs.readFileSync(BANS_FILE_PATH, 'utf8');
    const bans = JSON.parse(bansData);
    if (!bans.bannedIPs.includes(ip)) {
      bans.bannedIPs.push(ip);
      fs.writeFileSync(BANS_FILE_PATH, JSON.stringify(bans, null, 2));
      console.log(`[SECURITY] Auto-banned hacker IP: ${ip}`);
    }
  } catch (err) {
    console.error('Failed to auto-ban IP:', err);
  }
};

// Helper function to automatically ban a Device
export const autoBanDevice = (deviceId) => {
  if (!deviceId) return;
  try {
    const bansData = fs.readFileSync(BANS_FILE_PATH, 'utf8');
    const bans = JSON.parse(bansData);
    if (!bans.bannedDevices.includes(deviceId)) {
      bans.bannedDevices.push(deviceId);
      fs.writeFileSync(BANS_FILE_PATH, JSON.stringify(bans, null, 2));
      console.log(`[SECURITY] Auto-banned hacker Device: ${deviceId}`);
    }
  } catch (err) {
    console.error('Failed to auto-ban Device:', err);
  }
};

// Helmet Middleware for security headers
export const securityHeaders = helmet();

// Rate Limiting Middleware (Nge-ban orang yang spam request)
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // Limit dinaikkan sedikit agar user asli tidak kena
  standardHeaders: true, 
  legacyHeaders: false, 
  handler: (req, res, next, options) => {
    const forwarded = req.headers['x-forwarded-for'];
    const clientIp = forwarded ? forwarded.split(',')[0].trim() : (req.ip || req.connection.remoteAddress);
    
    // Hacker melakukan spam / brute force! Langsung Auto Ban!
    autoBanIp(clientIp);

    res.status(options.statusCode).json({
      success: false,
      error: {
        code: 'BANNED_FOR_SPAM',
        message: 'You have been permanently banned for abusive behavior.'
      }
    });
  }
});

// Standard Rate Limiting Middleware (Tanpa auto-ban, untuk API umum seperti WhatsApp)
export const standardLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // 300 requests per 15 minutes
  standardHeaders: true, 
  legacyHeaders: false, 
  handler: (req, res, next, options) => {
    res.status(options.statusCode).json({
      success: false,
      error: 'Terlalu banyak permintaan, silakan coba lagi nanti.'
    });
  }
});

// Middleware pendeteksi Serangan Hacker (Mencari file .env, phpmyadmin, wp-admin)
export const maliciousScanner = (req, res, next) => {
  const maliciousPatterns = ['.env', 'wp-admin', 'wp-login', 'phpmyadmin', 'config.php', '.git'];
  const isMalicious = maliciousPatterns.some(pattern => req.url.toLowerCase().includes(pattern));
  
  if (isMalicious) {
    const forwarded = req.headers['x-forwarded-for'];
    const clientIp = forwarded ? forwarded.split(',')[0].trim() : (req.ip || req.connection.remoteAddress);
    
    // Hacker mencoba mencari celah! Langsung Auto Ban!
    autoBanIp(clientIp);
    
    return res.status(403).json({ 
        success: false, 
        error: { code: 'MALICIOUS_ATTACK_BLOCKED', message: 'Malicious attack detected. Your IP has been permanently banned.' }
    });
  }
  next();
};

// Middleware to check banned IPs and Devices
export const checkBans = (req, res, next) => {
  try {
    const bansData = fs.readFileSync(BANS_FILE_PATH, 'utf8');
    const { bannedIPs, bannedDevices } = JSON.parse(bansData);

    // 1. Check IP
    // Ambil IP asli dari header x-forwarded-for karena server berada di belakang Nginx/Cloudflare
    const forwarded = req.headers['x-forwarded-for'];
    const clientIp = forwarded ? forwarded.split(',')[0].trim() : (req.ip || req.connection.remoteAddress);
    
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
