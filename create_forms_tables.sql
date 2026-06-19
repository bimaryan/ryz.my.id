-- Create Forms Table
CREATE TABLE IF NOT EXISTS public.forms (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE,
    title TEXT NOT NULL DEFAULT 'Untitled Form',
    description TEXT,
    status BOOLEAN NOT NULL DEFAULT true,
    theme_color TEXT DEFAULT '#0b5cff',
    settings JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create Form Fields Table
CREATE TABLE IF NOT EXISTS public.form_fields (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    form_id UUID NOT NULL REFERENCES public.forms(id) ON DELETE CASCADE,
    type TEXT NOT NULL, -- 'short_text', 'long_text', 'email', 'number', 'radio', 'checkbox', 'select', 'date'
    label TEXT NOT NULL DEFAULT 'Question',
    placeholder TEXT,
    required BOOLEAN NOT NULL DEFAULT false,
    options JSONB DEFAULT '[]'::jsonb,
    settings JSONB DEFAULT '{}'::jsonb,
    order_index INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Create Form Responses Table
CREATE TABLE IF NOT EXISTS public.form_responses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    form_id UUID NOT NULL REFERENCES public.forms(id) ON DELETE CASCADE,
    answers JSONB NOT NULL DEFAULT '{}'::jsonb,
    respondent_email TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Set up Row Level Security (RLS)

-- Forms RLS
ALTER TABLE public.forms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can create forms"
ON public.forms FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own forms or team forms"
ON public.forms FOR SELECT
USING (
    auth.uid() = user_id 
    OR 
    team_id IN (
        SELECT team_id FROM public.team_members WHERE user_id = auth.uid()
    )
    OR
    status = true -- Anyone can view active forms (public form view)
);

CREATE POLICY "Users can update their own forms or team forms"
ON public.forms FOR UPDATE
USING (
    auth.uid() = user_id 
    OR 
    team_id IN (
        SELECT team_id FROM public.team_members WHERE user_id = auth.uid()
    )
);

CREATE POLICY "Users can delete their own forms or team forms"
ON public.forms FOR DELETE
USING (
    auth.uid() = user_id 
    OR 
    team_id IN (
        SELECT team_id FROM public.team_members WHERE user_id = auth.uid()
    )
);

-- Form Fields RLS
ALTER TABLE public.form_fields ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view form fields for active forms"
ON public.form_fields FOR SELECT
USING (
    form_id IN (
        SELECT id FROM public.forms WHERE status = true OR user_id = auth.uid() OR team_id IN (SELECT team_id FROM public.team_members WHERE user_id = auth.uid())
    )
);

CREATE POLICY "Form owners can insert fields"
ON public.form_fields FOR INSERT
WITH CHECK (
    form_id IN (
        SELECT id FROM public.forms WHERE user_id = auth.uid() OR team_id IN (SELECT team_id FROM public.team_members WHERE user_id = auth.uid())
    )
);

CREATE POLICY "Form owners can update fields"
ON public.form_fields FOR UPDATE
USING (
    form_id IN (
        SELECT id FROM public.forms WHERE user_id = auth.uid() OR team_id IN (SELECT team_id FROM public.team_members WHERE user_id = auth.uid())
    )
);

CREATE POLICY "Form owners can delete fields"
ON public.form_fields FOR DELETE
USING (
    form_id IN (
        SELECT id FROM public.forms WHERE user_id = auth.uid() OR team_id IN (SELECT team_id FROM public.team_members WHERE user_id = auth.uid())
    )
);

-- Form Responses RLS
ALTER TABLE public.form_responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit a response"
ON public.form_responses FOR INSERT
WITH CHECK (
    form_id IN (SELECT id FROM public.forms WHERE status = true)
);

CREATE POLICY "Only form owners can view responses"
ON public.form_responses FOR SELECT
USING (
    form_id IN (
        SELECT id FROM public.forms WHERE user_id = auth.uid() OR team_id IN (SELECT team_id FROM public.team_members WHERE user_id = auth.uid())
    )
);

CREATE POLICY "Only form owners can delete responses"
ON public.form_responses FOR DELETE
USING (
    form_id IN (
        SELECT id FROM public.forms WHERE user_id = auth.uid() OR team_id IN (SELECT team_id FROM public.team_members WHERE user_id = auth.uid())
    )
);
