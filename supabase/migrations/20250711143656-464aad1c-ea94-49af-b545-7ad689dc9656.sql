-- Create storage bucket for transaction images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('transaction-images', 'transaction-images', true);

-- Create storage policies for transaction images
CREATE POLICY "Anyone can view transaction images"
ON storage.objects FOR SELECT
USING (bucket_id = 'transaction-images');

CREATE POLICY "Users can upload their own transaction images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'transaction-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own transaction images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'transaction-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own transaction images"
ON storage.objects FOR DELETE
USING (bucket_id = 'transaction-images' AND auth.uid()::text = (storage.foldername(name))[1]);