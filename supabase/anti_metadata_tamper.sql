-- =========================================================================
-- 🔥 SCRIPT ANTI-TAMPERING UNTUK USER_METADATA & PUBLIC.USERS 🔥
-- =========================================================================

-- 1. TRIGGER UNTUK TABEL PUBLIC.USERS
-- Memastikan user frontend tidak bisa mengubah plan_type dan max_links mereka sendiri
CREATE OR REPLACE FUNCTION public.block_users_tampering()
RETURNS TRIGGER AS $$
BEGIN
  -- Jika yang mengubah adalah user biasa via API (bukan backend Node.js / service_role)
  IF current_user IN ('authenticated', 'anon') THEN
    -- Cek apakah ada usaha merubah kolom sensitif
    IF NEW.plan_type IS DISTINCT FROM OLD.plan_type OR NEW.max_links IS DISTINCT FROM OLD.max_links THEN
       RAISE EXCEPTION 'Akses Ditolak: Anda tidak berhak mengubah limit paket. Aktivitas percobaan peretasan telah dicatat sistem dan IP Anda diawasi.';
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_block_users_tampering ON public.users;
CREATE TRIGGER trg_block_users_tampering
BEFORE UPDATE ON public.users
FOR EACH ROW
EXECUTE FUNCTION public.block_users_tampering();


-- 2. TRIGGER UNTUK TABEL AUTH.USERS (USER_METADATA SUPABASE)
-- Memaksa raw_user_meta_data selalu berpatokan pada data resmi di public.users
CREATE OR REPLACE FUNCTION public.sync_user_metadata_security()
RETURNS TRIGGER AS $$
DECLARE
  v_true_plan text;
  v_true_max_links integer;
BEGIN
  -- Cari data asli dari tabel public.users
  SELECT plan_type, max_links INTO v_true_plan, v_true_max_links
  FROM public.users WHERE id = NEW.id;

  IF v_true_plan IS NOT NULL THEN
    
    -- JIKA ADA YANG MENCOBA MENGUBAH METADATA SECARA ILEGAL DARI FRONTEND/BURP SUITE
    IF (NEW.raw_user_meta_data->>'plan_type') IS DISTINCT FROM v_true_plan OR 
       (NEW.raw_user_meta_data->>'max_links') IS DISTINCT FROM v_true_max_links::text THEN
       RAISE EXCEPTION 'Security Alert: Manipulasi user_metadata terdeteksi! Payload ditolak secara permanen dan upaya serangan dicatat.';
    END IF;

    -- Timpa nilai plan_type dan max_links di dalam JSON metadata dengan data yang Asli/Resmi!
    NEW.raw_user_meta_data := jsonb_set(
      COALESCE(NEW.raw_user_meta_data, '{}'::jsonb), 
      '{plan_type}', 
      to_jsonb(v_true_plan)
    );
    
    NEW.raw_user_meta_data := jsonb_set(
      NEW.raw_user_meta_data, 
      '{max_links}', 
      to_jsonb(v_true_max_links)
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_sync_user_metadata_security ON auth.users;
CREATE TRIGGER trg_sync_user_metadata_security
BEFORE UPDATE ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.sync_user_metadata_security();
