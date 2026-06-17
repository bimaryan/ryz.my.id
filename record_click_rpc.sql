-- Jalankan perintah SQL ini di menu SQL Editor pada Dashboard Supabase Anda
-- Ini adalah versi terbaru dari fungsi pencatat klik yang mendukung pelacakan
-- Alamat IP dan Lokasi Negara (Country).

CREATE OR REPLACE FUNCTION record_link_click(
  p_link_id UUID,
  p_referrer TEXT,
  p_user_agent TEXT,
  p_device_type TEXT,
  p_browser TEXT,
  p_os TEXT,
  p_utm_source TEXT,
  p_utm_medium TEXT,
  p_utm_campaign TEXT,
  p_ip_address INET DEFAULT NULL,
  p_country VARCHAR DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- 1. Insert ke tabel analytics
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
    p_ip_address,
    p_country
  );

  -- 2. Update clicks_count di tabel links
  UPDATE public.links
  SET clicks_count = COALESCE(clicks_count, 0) + 1
  WHERE id = p_link_id;
END;
$$;
