-- Jalankan ini di SQL Editor Supabase.
-- Masalah ini terjadi karena meskipun Anda sudah diizinkan membaca data tim,
-- Supabase masih memblokir Anda (secara diam-diam) saat mencoba menambah/memasukkan 
-- data link baru ke dalam tabel `team_links` (INSERT policy).

DO $$
BEGIN
  -- Hapus policy lama jika ada agar tidak error
  DROP POLICY IF EXISTS "team_members_insert_team_links" ON public.team_links;

  -- Izinkan siapa saja yang ada di dalam tim untuk menambahkan link ke dalam tim tersebut
  CREATE POLICY "team_members_insert_team_links" 
  ON public.team_links 
  FOR INSERT 
  WITH CHECK (
    team_id IN (SELECT team_id FROM public.team_members WHERE user_id = auth.uid())
  );
END $$;
