-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create my_accounts table
CREATE TABLE public.my_accounts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on my_accounts table
ALTER TABLE public.my_accounts ENABLE ROW LEVEL SECURITY;

-- Create policies for my_accounts
CREATE POLICY "Users can view their own my_accounts"
ON public.my_accounts FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own my_accounts"
ON public.my_accounts FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own my_accounts"
ON public.my_accounts FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own my_accounts"
ON public.my_accounts FOR DELETE
USING (auth.uid() = user_id);

-- Create trigger for updated_at timestamp
CREATE TRIGGER my_accounts_updated_at
  BEFORE UPDATE ON public.my_accounts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for better performance
CREATE INDEX idx_my_accounts_user_id ON public.my_accounts(user_id);
CREATE INDEX idx_my_accounts_name ON public.my_accounts(name);