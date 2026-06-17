-- Jalankan ini di SQL Editor Supabase.
-- Masalah ini terjadi karena aturan keamanan (RLS) di tabel `team_members` 
-- ternyata masih memblokir anggota untuk membaca status keanggotaannya sendiri.
-- Jika mereka tidak bisa membaca statusnya sendiri di `team_members`, 
-- maka semua policy lain (seperti melihat tabel teams) ikut gagal!

DO $$
BEGIN
  -- Hapus policy lama jika ada
  DROP POLICY IF EXISTS "team_members_select_own" ON public.team_members;
  DROP POLICY IF EXISTS "team_members_select_team" ON public.team_members;

  -- 1. Izinkan user membaca data keanggotaannya SENDIRI
  CREATE POLICY "team_members_select_own" 
  ON public.team_members 
  FOR SELECT 
  USING (user_id = auth.uid());

  -- 2. Izinkan user melihat data member lain ASALKAN berada di tim yang sama
  CREATE POLICY "team_members_select_team" 
  ON public.team_members 
  FOR SELECT 
  USING (
    team_id IN (
      -- Menggunakan trik bypass RLS diri sendiri untuk subquery
      SELECT tm.team_id FROM public.team_members tm WHERE tm.user_id = auth.uid()
    )
  );
END $$;
