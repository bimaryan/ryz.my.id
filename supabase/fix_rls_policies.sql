-- Fix RLS Policies for new tables

-- custom_domains
DROP POLICY IF EXISTS "Users can manage their own custom domains" ON public.custom_domains;
CREATE POLICY "Users can manage their own custom domains" 
ON public.custom_domains FOR ALL 
USING (auth.uid() = user_id) 
WITH CHECK (auth.uid() = user_id);

-- webhooks
DROP POLICY IF EXISTS "Users can manage their own webhooks" ON public.webhooks;
CREATE POLICY "Users can manage their own webhooks" 
ON public.webhooks FOR ALL 
USING (auth.uid() = user_id) 
WITH CHECK (auth.uid() = user_id);

-- api_keys
DROP POLICY IF EXISTS "Users can manage their own api keys" ON public.api_keys;
CREATE POLICY "Users can manage their own api keys" 
ON public.api_keys FOR ALL 
USING (auth.uid() = user_id) 
WITH CHECK (auth.uid() = user_id);

-- teams
DROP POLICY IF EXISTS "Users can manage their own teams" ON public.teams;
CREATE POLICY "Users can manage their own teams" 
ON public.teams FOR ALL 
USING (auth.uid() = owner_id) 
WITH CHECK (auth.uid() = owner_id);

-- link_shares
DROP POLICY IF EXISTS "Users can manage their own link shares" ON public.link_shares;
CREATE POLICY "Users can manage their own link shares" 
ON public.link_shares FOR ALL 
USING (auth.uid() = shared_by) 
WITH CHECK (auth.uid() = shared_by);

-- Make sure RLS is enabled for all of them just in case
ALTER TABLE public.custom_domains ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.link_shares ENABLE ROW LEVEL SECURITY;
