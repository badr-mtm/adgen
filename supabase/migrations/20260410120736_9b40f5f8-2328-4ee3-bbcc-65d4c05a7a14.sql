-- 1. Make brand-assets bucket private
UPDATE storage.buckets SET public = false WHERE id = 'brand-assets';

-- 2. Scope ad-visuals policies to authenticated role
DROP POLICY IF EXISTS "Users can upload their own ad visuals" ON storage.objects;
CREATE POLICY "Users can upload their own ad visuals"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'ad-visuals' AND (auth.uid())::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "Users can update their own ad visuals" ON storage.objects;
CREATE POLICY "Users can update their own ad visuals"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'ad-visuals' AND (auth.uid())::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "Users can delete their own ad visuals" ON storage.objects;
CREATE POLICY "Users can delete their own ad visuals"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'ad-visuals' AND (auth.uid())::text = (storage.foldername(name))[1]);
