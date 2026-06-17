import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../../.env.local') });

// We need the service role key to bypass RLS when looking up the API key.
// If VITE_SUPABASE_SERVICE_ROLE_KEY is missing, we might have to fall back to using the anon key
// and hope the RLS policy allows querying api_keys by the key itself.
const supabaseUrl = process.env.VITE_SUPABASE_URL;
// Use service role key if available, otherwise anon key (but anon key might not work due to RLS).
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

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
