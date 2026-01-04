
ALTER TABLE public.campaigns 
ADD COLUMN IF NOT EXISTS strategy jsonb;
