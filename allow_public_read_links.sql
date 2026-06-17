-- Jalankan perintah SQL ini di menu SQL Editor pada Dashboard Supabase Anda
-- Secara bawaan, keamanan tabel 'links' sangat ketat dan mengunci akses untuk umum.
-- Perintah ini akan menambahkan izin khusus agar Publik (termasuk mode samaran) 
-- BISA MEMBACA isi tautan, sehingga mereka bisa diarahkan (redirect) ke tujuan aslinya.

DROP POLICY IF EXISTS "public_select_links" ON public.links;

CREATE POLICY "public_select_links" 
ON public.links 
FOR SELECT 
USING (true);
