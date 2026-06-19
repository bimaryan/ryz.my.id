CREATE OR REPLACE FUNCTION decrement_product_stock(
  p_page_id uuid,
  p_product_id text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_links jsonb;
  v_idx int;
  v_link jsonb;
  v_stock int;
BEGIN
  -- Dapatkan array links
  SELECT links INTO v_links FROM public.pages WHERE id = p_page_id;
  
  IF v_links IS NULL THEN
    RETURN;
  END IF;

  -- Cari index dari product_id
  v_idx := 0;
  FOR v_link IN SELECT * FROM jsonb_array_elements(v_links)
  LOOP
    IF v_link->>'id' = p_product_id THEN
      -- Jika item quantity enabled, kurangi stock
      IF (v_link->>'item_quantity_enabled')::boolean = true THEN
        v_stock := (COALESCE(v_link->>'stock', '0'))::int;
        IF v_stock > 0 THEN
          v_stock := v_stock - 1;
          v_link := jsonb_set(v_link, '{stock}', to_jsonb(v_stock::text));
          v_links := jsonb_set(v_links, array[v_idx::text], v_link);
          
          -- Simpan kembali ke database
          UPDATE public.pages SET links = v_links WHERE id = p_page_id;
        END IF;
      END IF;
      EXIT;
    END IF;
    v_idx := v_idx + 1;
  END LOOP;
END;
$$;
