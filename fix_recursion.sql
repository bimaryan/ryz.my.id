-- Jalankan perintah ini di SQL Editor Supabase untuk menghapus penyebab error.
-- Error "infinite recursion" terjadi karena tabel team_members mencoba 
-- membaca dirinya sendiri terus-menerus tanpa henti dalam aturan RLS.

DO $$
BEGIN
  -- Hapus policy yang menyebabkan looping / recursion
  DROP POLICY IF EXISTS "team_members_select_team" ON public.team_members;
  
  -- Pastikan policy utama untuk membaca diri sendiri tetap ada dan aman
  DROP POLICY IF EXISTS "team_members_select_own" ON public.team_members;
  CREATE POLICY "team_members_select_own" 
  ON public.team_members 
  FOR SELECT 
  USING (user_id = auth.uid());
END $$;
