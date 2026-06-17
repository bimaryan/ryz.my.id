-- Jalankan perintah SQL ini di menu SQL Editor pada Dashboard Supabase Anda
-- Perintah ini akan memperbarui relasi antar-tabel agar penghapusan link (shortlink)
-- bisa dilakukan, meskipun link tersebut sudah memiliki data analitik 
-- atau sudah dibagikan ke dalam sebuah tim.

-- 1. Perbarui tabel analytics
ALTER TABLE public.analytics DROP CONSTRAINT IF EXISTS analytics_link_id_fkey;
ALTER TABLE public.analytics ADD CONSTRAINT analytics_link_id_fkey 
  FOREIGN KEY (link_id) REFERENCES public.links(id) ON DELETE CASCADE;

-- 2. Perbarui tabel team_links
ALTER TABLE public.team_links DROP CONSTRAINT IF EXISTS team_links_link_id_fkey;
ALTER TABLE public.team_links ADD CONSTRAINT team_links_link_id_fkey 
  FOREIGN KEY (link_id) REFERENCES public.links(id) ON DELETE CASCADE;

-- 3. Perbarui tabel link_shares
ALTER TABLE public.link_shares DROP CONSTRAINT IF EXISTS link_shares_link_id_fkey;
ALTER TABLE public.link_shares ADD CONSTRAINT link_shares_link_id_fkey 
  FOREIGN KEY (link_id) REFERENCES public.links(id) ON DELETE CASCADE;
