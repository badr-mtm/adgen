-- 1. Remove campaigns from realtime publication to prevent cross-user leakage
ALTER PUBLICATION supabase_realtime DROP TABLE public.campaigns;

-- 2. Fix brand-assets SELECT policy - restrict to owner only
DROP POLICY IF EXISTS "Users can view brand assets" ON storage.objects;

CREATE POLICY "Users can view their own brand assets"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'brand-assets'
  AND (auth.uid())::text = (storage.foldername(name))[1]
);