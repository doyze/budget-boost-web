-- Add accounts_id to transactions table
ALTER TABLE public.transactions
ADD COLUMN accounts_id UUID;

-- Add foreign key constraint
ALTER TABLE public.transactions
ADD CONSTRAINT fk_transactions_accounts
FOREIGN KEY (accounts_id)
REFERENCES public.my_accounts(id)
ON DELETE SET NULL;

-- Create index for better performance
CREATE INDEX idx_transactions_accounts_id ON public.transactions(accounts_id);