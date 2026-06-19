import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// Try to load .env or .env.local from the server folder (for 1Panel)
dotenv.config({ path: path.join(__dirname, '../.env') });
dotenv.config({ path: path.join(__dirname, '../.env.local') });
// Fallback for local dev
dotenv.config({ path: path.join(__dirname, '../../.env.local') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);

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
