-- Add settings to form_fields to store quiz info (points, correct_answers)
ALTER TABLE public.form_fields 
ADD COLUMN IF NOT EXISTS settings JSONB DEFAULT '{}'::jsonb;
