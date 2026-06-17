-- Jalankan perintah SQL ini di menu SQL Editor pada Dashboard Supabase Anda
-- Ini akan membersihkan versi-versi lama dari fungsi record_link_click yang mungkin
-- bertabrakan dan membuat versi baru yang benar-benar bersih.

-- 1. Hapus SEMUA versi lama dari fungsi record_link_click
DROP FUNCTION IF EXISTS public.record_link_click(uuid, text, text, text, text, text, text, text, text);
DROP FUNCTION IF EXISTS public.record_link_click(uuid, text, text, text, text, text, text, text, text, inet, character varying);
DROP FUNCTION IF EXISTS public.record_link_click(uuid, text, text, text, text, text, text, text, text, text, text);

-- 2. Buat ulang fungsi dengan format teks sederhana untuk IP agar aman dari error INET cast
CREATE OR REPLACE FUNCTION public.record_link_click(
  p_link_id UUID,
  p_referrer TEXT,
  p_user_agent TEXT,
  p_device_type TEXT,
  p_browser TEXT,
  p_os TEXT,
  p_utm_source TEXT,
  p_utm_medium TEXT,
  p_utm_campaign TEXT,
  p_ip_address TEXT DEFAULT NULL,
  p_country TEXT DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- 1. Insert ke tabel analytics
  -- Cast ip_address ke inet dengan ::inet jika ada isinya
  INSERT INTO public.analytics (
    link_id, 
    referrer, 
    user_agent, 
    device_type, 
    browser, 
    os, 
    utm_source, 
    utm_medium, 
    utm_campaign,
    ip_address,
    country
  ) VALUES (
    p_link_id, 
    p_referrer, 
    p_user_agent, 
    p_device_type, 
    p_browser, 
    p_os, 
    p_utm_source, 
    p_utm_medium, 
    p_utm_campaign,
    NULLIF(p_ip_address, '')::inet,
    p_country
  );

  -- 2. Update clicks_count di tabel links
  UPDATE public.links
  SET clicks_count = COALESCE(clicks_count, 0) + 1
  WHERE id = p_link_id;
END;
$$;
