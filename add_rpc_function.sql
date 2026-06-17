-- Jalankan perintah SQL ini di menu SQL Editor pada Dashboard Supabase Anda
-- Ini diperlukan karena aturan keamanan RLS menghalangi aplikasi membaca
-- detail profil (email, nama) dari tabel users saat memuat daftar anggota tim.

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
    u.id AS user_id, 
    u.email, 
    u.full_name, 
    u.avatar_url
  FROM public.team_members tm
  JOIN public.users u ON tm.user_id = u.id
  WHERE tm.team_id = p_team_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
