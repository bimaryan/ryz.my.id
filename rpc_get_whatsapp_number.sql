-- Jalankan script ini di SQL Editor Supabase Anda
-- Script ini membuat fungsi aman (RPC) untuk mengambil Nomor WhatsApp kreator
-- dari metadata auth.users berdasarkan slug halaman publik, tanpa mengekspos data pribadi lainnya.

CREATE OR REPLACE FUNCTION public.get_page_whatsapp_number(page_slug text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  wa_number text;
BEGIN
  SELECT auth.users.raw_user_meta_data->>'whatsapp_number' INTO wa_number
  FROM auth.users
  JOIN public.pages ON public.pages.user_id = auth.users.id
  WHERE public.pages.slug = page_slug
  LIMIT 1;
  
  RETURN wa_number;
END;
$$;

-- Berikan akses agar publik bisa memanggil fungsi ini
GRANT EXECUTE ON FUNCTION public.get_page_whatsapp_number(text) TO anon, authenticated;
