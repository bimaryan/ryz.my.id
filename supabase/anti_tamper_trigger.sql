-- =========================================================================
-- 🔥 SCRIPT ANTI-TAMPERING (MENGUNCI HARGA & STATUS DI DATABASE) 🔥
-- =========================================================================
-- Script ini akan mencegat setiap INSERT atau UPDATE dari frontend/Burp Suite
-- dan memaksa agar harga dan status sesuai dengan aslinya.

-- 1. FUNGSI UNTUK MENGAMANKAN TABEL BILLING_HISTORY (UPGRADE PLAN)
CREATE OR REPLACE FUNCTION enforce_billing_security()
RETURNS TRIGGER AS $$
BEGIN
  -- Cek apakah request datang dari User biasa (Frontend) atau dari Backend (Service Role)
  -- 'authenticated' dan 'anon' adalah role standar dari frontend
  IF current_user IN ('authenticated', 'anon') THEN
    
    -- JIKA MENGIRIM DATA BARU (INSERT): Paksa status jadi pending
    IF TG_OP = 'INSERT' THEN
      NEW.status := 'pending';
    END IF;

    -- JIKA MENGUBAH DATA (UPDATE): Jangan izinkan user ngubah status jadi paid!
    IF TG_OP = 'UPDATE' THEN
      NEW.status := OLD.status; -- Kembalikan ke status aslinya
    END IF;

  END IF;
  
  -- Menimpa harga palsu dari hacker dengan harga ASLI
  IF NEW.plan_name = 'pro' THEN
    NEW.amount := 50000;
  ELSIF NEW.plan_name = 'enterprise' THEN
    NEW.amount := 200000;
  ELSE
    NEW.amount := 0; 
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Menerapkan trigger ke tabel billing_history
DROP TRIGGER IF EXISTS trg_enforce_billing_security ON public.billing_history;
CREATE TRIGGER trg_enforce_billing_security
BEFORE INSERT OR UPDATE ON public.billing_history
FOR EACH ROW
EXECUTE FUNCTION enforce_billing_security();


-- 2. FUNGSI UNTUK MENGAMANKAN TABEL ORDERS (PEMBELIAN BLOG/PRODUK)
CREATE OR REPLACE FUNCTION enforce_order_security()
RETURNS TRIGGER AS $$
DECLARE
  v_price numeric;
BEGIN
  -- Keamanan Status: Sama seperti di atas
  IF current_user IN ('authenticated', 'anon') THEN
    IF TG_OP = 'INSERT' THEN
      NEW.status := 'pending';
    END IF;
    IF TG_OP = 'UPDATE' THEN
      NEW.status := OLD.status;
    END IF;
  END IF;

  -- Mencari harga produk ASLI langsung dari tabel blogs
  SELECT COALESCE(sale_price, price) INTO v_price 
  FROM public.blogs 
  WHERE id::text = NEW.product_id;
  
  IF v_price IS NOT NULL THEN
    NEW.amount := v_price;
  ELSE
    NEW.amount := 0;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Menerapkan trigger ke tabel orders
DROP TRIGGER IF EXISTS trg_enforce_order_security ON public.orders;
CREATE TRIGGER trg_enforce_order_security
BEFORE INSERT OR UPDATE ON public.orders
FOR EACH ROW
EXECUTE FUNCTION enforce_order_security();
