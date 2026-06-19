-- Add settings to forms
ALTER TABLE public.forms 
ADD COLUMN IF NOT EXISTS settings JSONB DEFAULT '{}'::jsonb;

-- Add respondent_email to form_responses
ALTER TABLE public.form_responses 
ADD COLUMN IF NOT EXISTS respondent_email TEXT;
