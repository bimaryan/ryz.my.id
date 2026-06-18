CREATE OR REPLACE FUNCTION get_page_shipping_origin(page_slug text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id uuid;
  v_metadata jsonb;
BEGIN
  SELECT user_id INTO v_user_id FROM public.pages WHERE slug = page_slug LIMIT 1;
  
  IF v_user_id IS NULL THEN
    RETURN NULL;
  END IF;

  SELECT raw_user_meta_data INTO v_metadata FROM auth.users WHERE id = v_user_id;

  RETURN jsonb_build_object(
    'origin_area_id', v_metadata->>'biteship_origin_area_id',
    'origin_area_name', v_metadata->>'biteship_origin_area_name',
    'origin_address', v_metadata->>'biteship_origin_address',
    'whatsapp_number', v_metadata->>'whatsapp_number',
    'full_name', v_metadata->>'full_name'
  );
END;
$$;
