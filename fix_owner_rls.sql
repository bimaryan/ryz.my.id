-- Jalankan perintah ini di SQL Editor Supabase.
-- Masalah ini terjadi karena aturan Insert di team_members memblokir Anda (sebagai pembuat tim) 
-- untuk menambahkan diri Anda sendiri ke dalam tim yang baru saja Anda buat.
-- Selain itu, kita memastikan Owner selalu memiliki hak akses untuk melihat tim buatannya.

DO $$
BEGIN
  -- 1. Pastikan Pembuat Tim (Owner) SELALU bisa melihat timnya 
  -- (sebagai cadangan pengaman jika terjadi masalah di team_members)
  DROP POLICY IF EXISTS "teams_select_owner" ON public.teams;
  CREATE POLICY "teams_select_owner" 
  ON public.teams 
  FOR SELECT 
  USING (owner_id = auth.uid());

  -- 2. Izinkan proses pembuatan tim untuk menambahkan pembuatnya ke dalam daftar anggota (team_members)
  DROP POLICY IF EXISTS "team_members_insert_owner" ON public.team_members;
  CREATE POLICY "team_members_insert_owner" 
  ON public.team_members 
  FOR INSERT 
  WITH CHECK (
    -- Mengizinkan Anda memasukkan diri sendiri saat baru membuat tim
    user_id = auth.uid() 
    OR 
    -- Atau mengizinkan jika Anda adalah pembuat tim tersebut
    team_id IN (SELECT id FROM public.teams WHERE owner_id = auth.uid())
  );
END $$;
