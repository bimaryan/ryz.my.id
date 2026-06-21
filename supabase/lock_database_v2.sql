-- =========================================================================
-- 🔥 SCRIPT PENGUNCI KEAMANAN V2 (RELATIONAL RLS & MISSING TABLES) 🔥
-- =========================================================================

-- 1. AKTIFKAN RLS UNTUK TABEL YANG TERLEWAT
ALTER TABLE public.links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.form_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.form_fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plan_limits ENABLE ROW LEVEL SECURITY;

-- 2. HAPUS POLICY LAMA AGAR TIDAK BENTROK
DROP POLICY IF EXISTS "Owner access only" ON public.links;
DROP POLICY IF EXISTS "Allow public read" ON public.links;

DROP POLICY IF EXISTS "Owner access only" ON public.orders;
DROP POLICY IF EXISTS "Allow public insert" ON public.orders;
DROP POLICY IF EXISTS "Allow public read" ON public.orders;

DROP POLICY IF EXISTS "Owner access only" ON public.form_responses;
DROP POLICY IF EXISTS "Allow public insert" ON public.form_responses;

DROP POLICY IF EXISTS "Owner access only" ON public.form_fields;
DROP POLICY IF EXISTS "Allow public read" ON public.form_fields;

DROP POLICY IF EXISTS "Owner access only" ON public.blog_chapters;
DROP POLICY IF EXISTS "Allow public read" ON public.blog_chapters;

DROP POLICY IF EXISTS "Allow public read" ON public.plan_limits;

-- 3. BUAT POLICY BARU

-- ==========================================
-- TABEL LINKS
-- ==========================================
-- Hanya pemilik yang bisa bikin, edit, hapus
CREATE POLICY "Owner access only" ON public.links FOR ALL USING (auth.uid() = user_id);
-- Publik boleh ngebaca (select) untuk keperluan sistem redirect backend/frontend
CREATE POLICY "Allow public read" ON public.links FOR SELECT USING (true);


-- ==========================================
-- TABEL ORDERS (Transaksi Publik)
-- ==========================================
-- Publik bebas MENGIRIM orderan baru tanpa login
CREATE POLICY "Allow public insert" ON public.orders FOR INSERT WITH CHECK (true);
-- TAPI, hanya sang Pemilik Produk (blog owner) yang boleh MEMBACA atau MENGHAPUS orderan tersebut.
-- Relasi: orders.product_id -> blogs.id -> blogs.user_id
CREATE POLICY "Owner access only" ON public.orders FOR ALL USING (
    product_id IN (
        SELECT id::text FROM public.blogs WHERE user_id = auth.uid()
    )
);


-- ==========================================
-- TABEL FORM RESPONSES (Jawaban Publik)
-- ==========================================
-- Publik bebas MENGISI form
CREATE POLICY "Allow public insert" ON public.form_responses FOR INSERT WITH CHECK (true);
-- HANYA pembuat form yang boleh MELIHAT jawabannya (Anti-Bocor)
-- Relasi: form_responses.form_id -> forms.id -> forms.user_id
CREATE POLICY "Owner access only" ON public.form_responses FOR ALL USING (
    form_id IN (
        SELECT id FROM public.forms WHERE user_id = auth.uid()
    )
);


-- ==========================================
-- TABEL FORM FIELDS (Pertanyaan Form)
-- ==========================================
-- Publik WAJIB bisa ngebaca pertanyaannya agar form bisa dimuat
CREATE POLICY "Allow public read" ON public.form_fields FOR SELECT USING (true);
-- TAPI, HANYA pembuat form yang boleh nambah/ngedit/hapus pertanyaannya
CREATE POLICY "Owner access only" ON public.form_fields FOR ALL USING (
    form_id IN (
        SELECT id FROM public.forms WHERE user_id = auth.uid()
    )
);


-- ==========================================
-- TABEL BLOG CHAPTERS (Konten Artikel)
-- ==========================================
-- Publik WAJIB bisa baca kontennya
CREATE POLICY "Allow public read" ON public.blog_chapters FOR SELECT USING (true);
-- TAPI, HANYA penulis aslinya yang bisa nambah/ngedit kontennya
CREATE POLICY "Owner access only" ON public.blog_chapters FOR ALL USING (
    blog_id IN (
        SELECT id FROM public.blogs WHERE user_id = auth.uid()
    )
);


-- ==========================================
-- TABEL PLAN LIMITS (Konfigurasi Global Harga)
-- ==========================================
-- Publik WAJIB bisa ngecek spesifikasi/batas plan (misal max_links 100)
CREATE POLICY "Allow public read" ON public.plan_limits FOR SELECT USING (true);
-- (Sengaja tidak ada policy INSERT/UPDATE/DELETE agar hanya Admin via Service Role yang bisa edit harga)
