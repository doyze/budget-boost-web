import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Category, Transaction, MyAccount } from '@/types/transaction';
import { useAuth } from './useAuth';

export const useSupabaseData = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [accounts, setAccounts] = useState<MyAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  // Fetch all data
  const fetchData = async () => {
    if (!user) {
      setCategories([]);
      setTransactions([]);
      setAccounts([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      // Fetch categories, transactions, and accounts in parallel
      const [categoriesResult, transactionsResult, accountsResult] = await Promise.all([
        supabase
          .from('categories')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: true }),
        supabase
          .from('transactions')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false }),
        supabase
          .from('my_accounts')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: true })
      ]);

      if (categoriesResult.error) {
        console.error('Error fetching categories:', categoriesResult.error);
      } else {
        setCategories(categoriesResult.data || []);
      }

      if (transactionsResult.error) {
        console.error('Error fetching transactions:', transactionsResult.error);
      } else {
        setTransactions(transactionsResult.data || []);
      }
      
      if (accountsResult.error) {
        console.error('Error fetching accounts:', accountsResult.error);
      } else {
        setAccounts(accountsResult.data || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Add category
  const addCategory = async (categoryData: { name: string; icon: string; color: string }) => {
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('categories')
      .insert({
        ...categoryData,
        user_id: user.id
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding category:', error);
      throw error;
    }

    setCategories(prev => [...prev, data]);
    return data;
  };

  // Update category
  const updateCategory = async (categoryId: string, categoryData: { name: string; icon: string; color: string }) => {
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('categories')
      .update(categoryData)
      .eq('id', categoryId)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating category:', error);
      throw error;
    }

    setCategories(prev => prev.map(cat => cat.id === categoryId ? data : cat));
    return data;
  };

  // Delete category
  const deleteCategory = async (categoryId: string) => {
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', categoryId)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error deleting category:', error);
      throw error;
    }

    setCategories(prev => prev.filter(cat => cat.id !== categoryId));
  };

  // Add transaction
  const addTransaction = async (transactionData: {
    type: 'income' | 'expense';
    amount: number;
    category_id?: string;
    account_id: string;
    description?: string;
    image_url?: string;
    date: string;
  }) => {
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('transactions')
      .insert({
        ...transactionData,
        user_id: user.id
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding transaction:', error);
      throw error;
    }

    setTransactions(prev => [data, ...prev]);
    return data;
  };

  // Update transaction
  const updateTransaction = async (transactionId: string, transactionData: {
    type: 'income' | 'expense';
    amount: number;
    category_id?: string;
    account_id: string;
    description?: string;
    date: string;
    image_url?: string;
  }) => {
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('transactions')
      .update(transactionData)
      .eq('id', transactionId)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating transaction:', error);
      throw error;
    }

    setTransactions(prev => prev.map(t => t.id === transactionId ? data : t));
    return data;
  };

  // Delete transaction
  const deleteTransaction = async (transactionId: string) => {
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', transactionId)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error deleting transaction:', error);
      throw error;
    }

    setTransactions(prev => prev.filter(t => t.id !== transactionId));
  };

  // Upload transaction image
  const uploadTransactionImage = async (file: File): Promise<string> => {
    if (!user) throw new Error('User not authenticated');

    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}/${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('transaction-images')
      .upload(fileName, file);

    if (uploadError) {
      console.error('Error uploading image:', uploadError);
      throw uploadError;
    }

    const { data } = supabase.storage
      .from('transaction-images')
      .getPublicUrl(fileName);

    return data.publicUrl;
  };

  // Fetch data when user changes
  useEffect(() => {
    fetchData();
  }, [user]);

  return {
    categories,
    transactions,
    accounts,
    loading,
    addCategory,
    updateCategory,
    deleteCategory,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    uploadTransactionImage,
    refetch: fetchData
  };
};