import { supabase } from '@/integrations/supabase/client';
import { z } from 'zod';

const formSchema = z.object({
  name: z.string().min(2, {
    message: 'Account name must be at least 2 characters.',
  }),
  type: z.string().min(2, {
    message: 'Account type must be at least 2 characters.',
  }),
  balance: z.coerce.number(),
});

export const getAccounts = async () => {
  return supabase.from('my_accounts').select('*');
};

export const createAccount = async (values: z.infer<typeof formSchema>, userId: string) => {
  return await supabase.from('my_accounts').insert([{ ...values, user_id: userId }]).select();
};

export const updateAccount = async (values: z.infer<typeof formSchema>, accountId: number) => {
  return await supabase.from('my_accounts').update(values).eq('id', accountId);
};

export const deleteAccount = async (accountId: number) => {
  return await supabase.from('my_accounts').delete().eq('id', accountId);
};