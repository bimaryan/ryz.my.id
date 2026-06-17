-- Jalankan perintah SQL ini di menu SQL Editor Supabase Anda.
-- Masalah "kosong" terjadi karena ada perbedaan ID antara tabel `public.users` (buatan Anda) 
-- dengan `auth.users` (bawaan Supabase). 
-- Script ini akan memperbaiki fungsi untuk mengambil ID asli dari sistem auth Supabase.

-- 1. Perbarui fungsi invite_team_member untuk menggunakan auth.users
CREATE OR REPLACE FUNCTION invite_team_member(p_team_id uuid, p_email text, p_role text)
RETURNS boolean AS $$
DECLARE
  v_inviter_role text;
  v_target_user_id uuid;
BEGIN
  -- Cek izin inviter
  SELECT role INTO v_inviter_role 
  FROM public.team_members 
  WHERE team_id = p_team_id AND user_id = auth.uid();
  
  IF v_inviter_role NOT IN ('owner', 'admin') THEN
    RAISE EXCEPTION 'Not authorized to invite members';
  END IF;

  -- Cari ID asli dari sistem auth Supabase (bukan public.users)
  SELECT id INTO v_target_user_id FROM auth.users WHERE email = p_email LIMIT 1;
  IF v_target_user_id IS NULL THEN
    RAISE EXCEPTION 'User with this email not found in auth system';
  END IF;

  -- Cek jika sudah menjadi member
  IF EXISTS (SELECT 1 FROM public.team_members WHERE team_id = p_team_id AND user_id = v_target_user_id) THEN
    RAISE EXCEPTION 'User is already a member of this team';
  END IF;

  -- Insert dengan ID asli
  INSERT INTO public.team_members (team_id, user_id, role)
  VALUES (p_team_id, v_target_user_id, p_role);

  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Perbarui fungsi get_team_members untuk membaca dari auth.users
CREATE OR REPLACE FUNCTION get_team_members(p_team_id uuid)
RETURNS TABLE (
  id uuid,
  role character varying,
  joined_at timestamp with time zone,
  user_id uuid,
  email character varying,
  full_name character varying,
  avatar_url text
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    tm.id, 
    tm.role, 
    tm.joined_at, 
    au.id AS user_id, 
    au.email::character varying, 
    pu.full_name, 
    pu.avatar_url
  FROM public.team_members tm
  -- Cocokkan dengan ID autentikasi asli
  JOIN auth.users au ON tm.user_id = au.id
  -- Ambil nama dan avatar dari public.users menggunakan email
  LEFT JOIN public.users pu ON au.email = pu.email
  WHERE tm.team_id = p_team_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
