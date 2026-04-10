-- Make ad-visuals bucket private
UPDATE storage.buckets SET public = false WHERE id = 'ad-visuals';
