-- Jalankan perintah SQL ini di menu SQL Editor pada Dashboard Supabase Anda
-- Perintah ini akan memberikan izin kepada Anda (sebagai pemilik tautan)
-- dan anggota tim Anda untuk bisa MEMBACA data analitik yang masuk.
-- Sebelumnya, RLS memblokir siapa pun untuk membaca tabel analytics.

-- Hapus policy lama jika ada
DROP POLICY IF EXISTS "users_select_analytics" ON public.analytics;
DROP POLICY IF EXISTS "team_members_select_analytics" ON public.analytics;

-- 1. Izinkan pemilik tautan (user_id pembuat) melihat analitiknya
CREATE POLICY "users_select_analytics"
ON public.analytics
FOR SELECT
USING (
  link_id IN (
    SELECT id FROM public.links WHERE user_id = auth.uid()
  )
);

-- 2. Izinkan anggota tim melihat analitik tautan yang dibagikan ke tim mereka
CREATE POLICY "team_members_select_analytics"
ON public.analytics
FOR SELECT
USING (
  link_id IN (
    SELECT link_id FROM public.team_links 
    WHERE team_id IN (
      SELECT team_id FROM public.team_members WHERE user_id = auth.uid()
    )
  )
);
