import express from 'express';
import { supabase } from '../middleware/auth.js';

const router = express.Router();

// Utility for creating error responses
const sendError = (res, status, code, message) => {
  res.status(status).json({
    success: false,
    error: { code, message }
  });
};

// POST /api/v1/links - Create a short link
router.post('/', async (req, res) => {
  try {
    const { original_url, short_code, domain, title, category } = req.body;
    
    if (!original_url) {
      return sendError(res, 400, 'INVALID_INPUT', 'original_url is required');
    }

    // Auto-generate short code if not provided
    const finalShortCode = short_code || Math.random().toString(36).substring(2, 8);
    const finalDomain = domain || 'ryz.my.id';

    const { data, error } = await supabase
      .from('links')
      .insert([
        {
          original_url,
          short_code: finalShortCode,
          domain: finalDomain,
          title: title || null,
          category: category || null,
          user_id: req.user.id
        }
      ])
      .select()
      .single();

    if (error) {
      if (error.code === '23505') { // Unique constraint violation
        return sendError(res, 409, 'CONFLICT', 'Short code is already in use');
      }
      throw error;
    }

    res.status(201).json({
      success: true,
      data: {
        id: data.id,
        short_code: data.short_code,
        original_url: data.original_url,
        domain: data.domain,
        short_url: `https://${data.domain}/${data.short_code}`,
        created_at: data.created_at
      }
    });

  } catch (err) {
    console.error('POST /links error:', err);
    sendError(res, 500, 'INTERNAL_ERROR', 'Failed to create short link');
  }
});

// GET /api/v1/links - List short links
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const offset = (page - 1) * limit;

    const { data, error, count } = await supabase
      .from('links')
      .select('id, short_code, original_url, domain, title, clicks_count, created_at', { count: 'exact' })
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    res.json({
      success: true,
      data: data.map(link => ({
        ...link,
        short_url: `https://${link.domain}/${link.short_code}`
      })),
      pagination: {
        page,
        limit,
        total: count
      }
    });

  } catch (err) {
    console.error('GET /links error:', err);
    sendError(res, 500, 'INTERNAL_ERROR', 'Failed to fetch links');
  }
});

// PATCH /api/v1/links/:id - Update a link
router.patch('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    // Prevent updating protected fields
    delete updates.id;
    delete updates.user_id;
    delete updates.created_at;

    const { data, error } = await supabase
      .from('links')
      .update(updates)
      .eq('id', id)
      .eq('user_id', req.user.id) // Ensure they own it
      .select()
      .single();

    if (error) throw error;
    if (!data) return sendError(res, 404, 'NOT_FOUND', 'Link not found');

    res.json({
      success: true,
      data
    });

  } catch (err) {
    console.error('PATCH /links error:', err);
    sendError(res, 500, 'INTERNAL_ERROR', 'Failed to update link');
  }
});

// DELETE /api/v1/links/:id - Delete a link
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('links')
      .delete()
      .eq('id', id)
      .eq('user_id', req.user.id)
      .select()
      .single();

    if (error) throw error;
    if (!data) return sendError(res, 404, 'NOT_FOUND', 'Link not found');

    res.json({
      success: true,
      data: { id: data.id, deleted: true }
    });

  } catch (err) {
    console.error('DELETE /links error:', err);
    sendError(res, 500, 'INTERNAL_ERROR', 'Failed to delete link');
  }
});

export default router;
