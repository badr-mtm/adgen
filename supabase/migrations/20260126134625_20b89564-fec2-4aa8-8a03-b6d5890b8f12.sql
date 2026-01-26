-- Add generation_progress column to track scene-by-scene generation status
ALTER TABLE public.campaigns 
ADD COLUMN IF NOT EXISTS generation_progress jsonb DEFAULT NULL;

-- Enable realtime for campaigns table to track progress updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.campaigns;