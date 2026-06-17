-- Jalankan perintah SQL ini di menu SQL Editor pada Dashboard Supabase Anda
-- Perintah ini akan memperbarui semua relasi (foreign keys) yang terhubung ke pengguna.
-- Dengan ini, saat Anda menghapus pengguna dari menu Authentication, semua data 
-- yang terhubung (profil, link, tim, dll) akan ikut terhapus otomatis (ON DELETE CASCADE),
-- sehingga tidak memunculkan error API.

-- 1. Tambahkan ON DELETE CASCADE pada public.users ke auth.users
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_id_fkey;
ALTER TABLE public.users ADD CONSTRAINT users_id_fkey 
  FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- 2. Perbarui tabel links
ALTER TABLE public.links DROP CONSTRAINT IF EXISTS links_user_id_fkey;
ALTER TABLE public.links ADD CONSTRAINT links_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;

-- 3. Perbarui tabel teams
ALTER TABLE public.teams DROP CONSTRAINT IF EXISTS teams_owner_id_fkey;
ALTER TABLE public.teams ADD CONSTRAINT teams_owner_id_fkey 
  FOREIGN KEY (owner_id) REFERENCES public.users(id) ON DELETE CASCADE;

-- 4. Perbarui tabel team_members
ALTER TABLE public.team_members DROP CONSTRAINT IF EXISTS team_members_user_id_fkey;
ALTER TABLE public.team_members ADD CONSTRAINT team_members_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;

-- 5. Perbarui tabel team_links (assigned_to di-set NULL agar link tidak hilang jika assignee dihapus)
ALTER TABLE public.team_links DROP CONSTRAINT IF EXISTS team_links_assigned_to_fkey;
ALTER TABLE public.team_links ADD CONSTRAINT team_links_assigned_to_fkey 
  FOREIGN KEY (assigned_to) REFERENCES public.users(id) ON DELETE SET NULL;

-- 6. Perbarui tabel api_keys
ALTER TABLE public.api_keys DROP CONSTRAINT IF EXISTS api_keys_user_id_fkey;
ALTER TABLE public.api_keys ADD CONSTRAINT api_keys_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;

-- 7. Perbarui tabel link_shares
ALTER TABLE public.link_shares DROP CONSTRAINT IF EXISTS link_shares_shared_by_fkey;
ALTER TABLE public.link_shares ADD CONSTRAINT link_shares_shared_by_fkey 
  FOREIGN KEY (shared_by) REFERENCES public.users(id) ON DELETE CASCADE;

-- 8. Perbarui tabel audit_logs
ALTER TABLE public.audit_logs DROP CONSTRAINT IF EXISTS audit_logs_user_id_fkey;
ALTER TABLE public.audit_logs ADD CONSTRAINT audit_logs_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;

-- 9. Perbarui tabel custom_domains
ALTER TABLE public.custom_domains DROP CONSTRAINT IF EXISTS custom_domains_user_id_fkey;
ALTER TABLE public.custom_domains ADD CONSTRAINT custom_domains_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;

-- 10. Perbarui tabel webhooks
ALTER TABLE public.webhooks DROP CONSTRAINT IF EXISTS webhooks_user_id_fkey;
ALTER TABLE public.webhooks ADD CONSTRAINT webhooks_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;
