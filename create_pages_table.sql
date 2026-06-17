-- Buat tabel pages
CREATE TABLE public.pages (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  team_id uuid REFERENCES public.teams(id) ON DELETE CASCADE,
  slug varchar NOT NULL UNIQUE,
  title varchar,
  description text,
  avatar_url varchar,
  theme jsonb DEFAULT '{"bg_color": "#f4f6fa", "text_color": "#273144", "button_bg": "#ffffff", "button_text": "#273144", "button_style": "rounded"}'::jsonb,
  links jsonb DEFAULT '[]'::jsonb,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT pages_pkey PRIMARY KEY (id)
);

-- Buat indeks untuk slug agar pencarian lebih cepat
CREATE INDEX pages_slug_idx ON public.pages (slug);

-- Aktifkan RLS
ALTER TABLE public.pages ENABLE ROW LEVEL SECURITY;

-- 1. Siapapun (publik) bisa melihat halaman (untuk merender halaman Link-in-Bio)
CREATE POLICY "Public can view pages" 
ON public.pages 
FOR SELECT 
USING (true);

-- 2. User bisa membuat page miliknya sendiri
CREATE POLICY "Users can insert their own pages" 
ON public.pages 
FOR INSERT 
WITH CHECK (
  user_id = auth.uid()
);

-- 3. User bisa mengedit page miliknya sendiri atau milik timnya
CREATE POLICY "Users can update their own or team pages" 
ON public.pages 
FOR UPDATE 
USING (
  user_id = auth.uid() OR
  team_id IN (SELECT team_id FROM public.team_members WHERE user_id = auth.uid())
);

-- 4. User bisa menghapus page miliknya sendiri atau milik timnya
CREATE POLICY "Users can delete their own or team pages" 
ON public.pages 
FOR DELETE 
USING (
  user_id = auth.uid() OR
  team_id IN (SELECT team_id FROM public.team_members WHERE user_id = auth.uid())
);
