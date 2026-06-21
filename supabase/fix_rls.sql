-- Mengaktifkan RLS untuk tabel links dan analytics
ALTER TABLE links ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics ENABLE ROW LEVEL SECURITY;

-- Hapus policy lama jika sudah ada
DROP POLICY IF EXISTS "Users can select own links" ON links;
DROP POLICY IF EXISTS "Users can insert own links" ON links;
DROP POLICY IF EXISTS "Users can update own links" ON links;
DROP POLICY IF EXISTS "Users can delete own links" ON links;
DROP POLICY IF EXISTS "Users can select own analytics" ON analytics;

-- 1. Policies untuk tabel links (Hanya pemilik yang bisa akses)
CREATE POLICY "Users can select own links" ON links 
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own links" ON links 
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own links" ON links 
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own links" ON links 
FOR DELETE USING (auth.uid() = user_id);

-- 2. Policies untuk tabel analytics (Hanya pemilik link yang bisa lihat analytics)
CREATE POLICY "Users can select own analytics" ON analytics 
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM links 
    WHERE links.id = analytics.link_id 
    AND links.user_id = auth.uid()
  )
);

-- 3. Fungsi RPC aman untuk mengambil 1 link di halaman Redirect (bisa diakses publik secara spesifik)
-- SECURITY DEFINER membuat fungsi ini berjalan menggunakan hak akses admin sehingga bisa membaca tabel links
-- meskipun public RLS memblokir akses langsung.
CREATE OR REPLACE FUNCTION get_public_link(p_slug TEXT, p_domain TEXT DEFAULT NULL)
RETURNS SETOF links
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    IF p_domain IS NOT NULL THEN
        RETURN QUERY 
        SELECT * FROM links 
        WHERE (short_code = p_slug OR custom_slug = p_slug)
        AND custom_domain = p_domain
        LIMIT 1;
    ELSE
        RETURN QUERY 
        SELECT * FROM links 
        WHERE (short_code = p_slug OR custom_slug = p_slug)
        AND custom_domain IS NULL
        LIMIT 1;
    END IF;
END;
$$;
