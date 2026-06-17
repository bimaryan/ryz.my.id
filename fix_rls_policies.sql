-- Jalankan perintah SQL ini di menu SQL Editor Supabase Anda.
-- Ini akan membuka gembok keamanan (RLS) secara spesifik agar 
-- pengguna yang diundang ke dalam tim BISA MEMBACA data tim, 
-- daftar link tim, dan detail link tersebut.

DO $$
BEGIN
  -- Hapus policy (aturan) jika sebelumnya sudah pernah dibuat agar tidak error saat menimpa
  DROP POLICY IF EXISTS "team_members_select_teams" ON public.teams;
  DROP POLICY IF EXISTS "team_members_select_team_links" ON public.team_links;
  DROP POLICY IF EXISTS "team_members_select_links" ON public.links;
  
  -- 1. Izinkan member membaca data tim (di tabel teams)
  CREATE POLICY "team_members_select_teams" 
  ON public.teams 
  FOR SELECT 
  USING (
    id IN (SELECT team_id FROM public.team_members WHERE user_id = auth.uid())
  );

  -- 2. Izinkan member melihat relasi link apa saja yang ada di timnya
  CREATE POLICY "team_members_select_team_links" 
  ON public.team_links 
  FOR SELECT 
  USING (
    team_id IN (SELECT team_id FROM public.team_members WHERE user_id = auth.uid())
  );

  -- 3. Izinkan member melihat detail dari link-link yang ada di dalam tim
  CREATE POLICY "team_members_select_links" 
  ON public.links 
  FOR SELECT 
  USING (
    id IN (
      SELECT link_id FROM public.team_links 
      WHERE team_id IN (SELECT team_id FROM public.team_members WHERE user_id = auth.uid())
    )
  );
END $$;
