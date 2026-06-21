-- =========================================================================
-- 🔥 SCRIPT PENGUNCI KEAMANAN DATABASE (SUPABASE ROW LEVEL SECURITY) 🔥
-- =========================================================================
-- Script ini akan MENGUNCI (mengamankan) seluruh tabel agar tidak bisa dibobol
-- lewat API oleh orang yang tidak login / tidak punya hak akses.

-- 1. MENGAKTIFKAN RLS UNTUK SEMUA TABEL
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_domains ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blogs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.billing_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forms ENABLE ROW LEVEL SECURITY;

-- TABEL WHATSAPP (Sangat Sensitif)
ALTER TABLE public.whatsapp_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_webhooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_autoresponders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_broadcasts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_contact_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_contacts ENABLE ROW LEVEL SECURITY;

-- 2. HAPUS POLICY LAMA JIKA ADA BENTROK
-- (Melewati langkah ini agar aman, kita pakai nama policy yang unik)

-- 3. BUAT POLICY STRICT (HANYA PEMILIK DATA YANG BISA AKSES)

-- Tabel Users
DROP POLICY IF EXISTS "Strict user isolation" ON public.users;
CREATE POLICY "Strict user isolation" ON public.users FOR ALL USING (auth.uid() = id);

-- Tabel dengan kolom user_id langsung
DO $$
DECLARE
    t_name text;
    tables text[] := ARRAY[
        'api_keys', 'audit_logs', 'custom_domains', 'webhooks', 
        'pages', 'blogs', 'billing_history', 'activity_logs', 'forms',
        'whatsapp_sessions', 'whatsapp_messages', 'whatsapp_usage', 
        'whatsapp_webhooks', 'whatsapp_autoresponders', 'whatsapp_broadcasts', 
        'whatsapp_api_keys', 'whatsapp_contact_groups', 'whatsapp_contacts'
    ];
BEGIN
    FOREACH t_name IN ARRAY tables
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS "Owner access only" ON public.%I', t_name);
        EXECUTE format('CREATE POLICY "Owner access only" ON public.%I FOR ALL USING (auth.uid() = user_id)', t_name);
    END LOOP;
END $$;

-- Tabel Teams (pakai owner_id, bukan user_id)
DROP POLICY IF EXISTS "Owner access only" ON public.teams;
CREATE POLICY "Owner access only" ON public.teams FOR ALL USING (auth.uid() = owner_id);

-- 4. KHUSUS UNTUK TABEL YANG BUTUH AKSES PUBLIK (BACA SAJA)
-- Contoh: data profil orang (users) saat bikin shortlink mungkin butuh dibaca publik sedikit?
-- Tapi demi keamanan, kita tutup full dulu kecuali yang penting-penting saja.
