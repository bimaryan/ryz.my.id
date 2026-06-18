-- WARNING: Script ini akan MENGHAPUS SEMUA DATA di database Anda.
-- Gunakan dengan sangat hati-hati!

-- Menghapus semua data dari tabel publik dengan CASCADE
-- CASCADE akan otomatis menghapus data yang saling berhubungan (foreign keys)
TRUNCATE TABLE 
  public.billing_history,
  public.orders,
  public.blog_chapters,
  public.blogs,
  public.page_blocks,
  public.pages,
  public.webhook_logs,
  public.webhooks,
  public.custom_domains,
  public.audit_logs,
  public.link_shares,
  public.api_keys,
  public.team_links,
  public.team_members,
  public.teams,
  public.analytics,
  public.links,
  public.users
CASCADE;

-- CATATAN: Jika Anda JUGA ingin menghapus semua akun pengguna (login/register) 
-- Silakan hilangkan tanda komentar (--) pada perintah di bawah ini:
-- DELETE FROM auth.users;
