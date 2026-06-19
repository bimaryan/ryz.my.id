import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

console.log("=== DEBUG INFO ===");
console.log("__dirname is:", __dirname);
const envPath1 = path.join(__dirname, '../.env');
console.log("Looking for .env at:", envPath1, "Exists?", fs.existsSync(envPath1));
const envPath2 = path.join(__dirname, '../../.env.local');
console.log("Looking for .env.local at:", envPath2, "Exists?", fs.existsSync(envPath2));

const result1 = dotenv.config({ path: envPath1 });
console.log("Dotenv result 1:", result1.error ? result1.error.message : "Success");
const result2 = dotenv.config({ path: envPath2 });
console.log("Dotenv result 2:", result2.error ? result2.error.message : "Success");

console.log("SUPABASE_URL from process.env:", process.env.SUPABASE_URL);
console.log("==================");

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

let supabaseClient;
try {
  supabaseClient = createClient(supabaseUrl, supabaseKey);
} catch (e) {
  console.error("Supabase init error:", e.message);
}
export const supabase = supabaseClient;

export const requireApiKey = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: { code: 'UNAUTHORIZED', message: 'Missing or invalid Authorization header. Must provide Bearer token.' }
    });
  }

  const apiKey = authHeader.split(' ')[1];

  try {
    // Look up the API key in the database
    const { data: keyData, error } = await supabase
      .from('api_keys')
      .select('user_id, is_active')
      .eq('key_hash', apiKey)
      .single();

    if (error || !keyData) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Invalid API Key' }
      });
    }

    if (!keyData.is_active) {
      return res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'API Key is revoked or inactive' }
      });
    }

    // Attach user context to request
    req.user = {
      id: keyData.user_id,
      apiKey: apiKey
    };
    
    // Update last_used_at securely without blocking the request
    supabase.from('api_keys')
      .update({ last_used_at: new Date().toISOString() })
      .eq('key_hash', apiKey)
      .then();

    next();
  } catch (err) {
    console.error('Auth middleware error:', err);
    return res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Authentication failed due to server error' }
    });
  }
};
