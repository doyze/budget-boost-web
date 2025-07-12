import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Transaction, Category } from '@/types/transaction';
import { useQueryClient } from '@tanstack/react-query';

export const useSupabaseData = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const queryClient = useQueryClient();

  const fetchTransactions = async () => {
    if (!user) return;
    
    const { data } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: false });
    
    setTransactions((data || []) as Transaction[]);
  };

  const fetchCategories = async () => {
    if (!user) return;
    
    const { data } = await supabase
      .from('categories')
      .select('*')
      .eq('user_id', user.id)
      .order('name');
    
    setCategories((data || []) as Category[]);
  };

  useEffect(() => {
    if (user) {
      Promise.all([fetchTransactions(), fetchCategories()]).finally(() => {
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, [user]);

  const addTransaction = async (transaction: Omit<Transaction, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user) throw new Error('User not authenticated');
    
    const { error, data } = await supabase
      .from('transactions')
      .insert({
        ...transaction,
        user_id: user.id
      })
      .select();
    
    if (error) throw error;
    
    // อัปเดตข้อมูลในสถานะโดยตรงเพื่อให้ UI อัปเดตทันที
    if (data && data.length > 0) {
      setTransactions(prevTransactions => [data[0] as Transaction, ...prevTransactions]);
    }
    
    // อัปเดต cache ของ React Query
    queryClient.invalidateQueries(['transactions']);
    
    // ยังคงเรียก fetchTransactions เพื่อให้แน่ใจว่าข้อมูลถูกต้อง
    await fetchTransactions();
    
    return data?.[0];
  };

  const updateTransaction = async (id: string, updates: Partial<Transaction>) => {
    const { error, data } = await supabase
      .from('transactions')
      .update(updates)
      .eq('id', id)
      .select();
    
    if (error) throw error;
    
    // อัปเดตข้อมูลในสถานะโดยตรงเพื่อให้ UI อัปเดตทันที
    setTransactions(prevTransactions => 
      prevTransactions.map(t => t.id === id ? {...t, ...updates, updated_at: new Date().toISOString()} : t)
    );
    
    // อัปเดต cache ของ React Query
    queryClient.invalidateQueries(['transactions']);
    
    // ยังคงเรียก fetchTransactions เพื่อให้แน่ใจว่าข้อมูลถูกต้อง
    await fetchTransactions();
    
    return data?.[0];
  };

  const deleteTransaction = async (id: string) => {
    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    
    // อัปเดตข้อมูลในสถานะโดยตรงเพื่อให้ UI อัปเดตทันที
    setTransactions(prevTransactions => prevTransactions.filter(t => t.id !== id));
    
    // อัปเดต cache ของ React Query
    queryClient.invalidateQueries(['transactions']);
    
    // ยังคงเรียก fetchTransactions เพื่อให้แน่ใจว่าข้อมูลถูกต้อง
    await fetchTransactions();
  };

  const addCategory = async (category: Omit<Category, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user) throw new Error('User not authenticated');
    
    const { error, data } = await supabase
      .from('categories')
      .insert({
        ...category,
        user_id: user.id
      })
      .select();
    
    if (error) throw error;
    
    // อัปเดตข้อมูลในสถานะโดยตรงเพื่อให้ UI อัปเดตทันที
    if (data && data.length > 0) {
      setCategories(prevCategories => [...prevCategories, data[0] as Category]);
    }
    
    // อัปเดต cache ของ React Query
    queryClient.invalidateQueries(['categories']);
    
    // ยังคงเรียก fetchCategories เพื่อให้แน่ใจว่าข้อมูลถูกต้อง
    await fetchCategories();
    
    return data?.[0];
  };

  const updateCategory = async (id: string, updates: Partial<Category>) => {
    const { error, data } = await supabase
      .from('categories')
      .update(updates)
      .eq('id', id)
      .select();
    
    if (error) throw error;
    
    // อัปเดตข้อมูลในสถานะโดยตรงเพื่อให้ UI อัปเดตทันที
    setCategories(prevCategories => 
      prevCategories.map(c => c.id === id ? {...c, ...updates, updated_at: new Date().toISOString()} : c)
    );
    
    // อัปเดต cache ของ React Query
    queryClient.invalidateQueries(['categories']);
    
    // ยังคงเรียก fetchCategories เพื่อให้แน่ใจว่าข้อมูลถูกต้อง
    await fetchCategories();
    
    return data?.[0];
  };

  const deleteCategory = async (id: string) => {
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    
    // อัปเดตข้อมูลในสถานะโดยตรงเพื่อให้ UI อัปเดตทันที
    setCategories(prevCategories => prevCategories.filter(c => c.id !== id));
    
    // อัปเดต cache ของ React Query
    queryClient.invalidateQueries(['categories']);
    
    // ยังคงเรียก fetchCategories เพื่อให้แน่ใจว่าข้อมูลถูกต้อง
    await fetchCategories();
  };

  const uploadTransactionImage = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `transaction-images/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('transaction-images')
      .upload(filePath, file);

    if (uploadError) {
      throw new Error('Failed to upload image');
    }

    const { data } = supabase.storage
      .from('transaction-images')
      .getPublicUrl(filePath);

    return data.publicUrl;
  };

  const exportTransactionsToCSV = (startDate: Date, endDate: Date): string => {
    if (!user) throw new Error('User not authenticated');
    
    // กรองธุรกรรมตามช่วงเวลา
    const filteredTransactions = transactions.filter(t => {
      const transactionDate = new Date(t.date);
      return transactionDate >= startDate && transactionDate <= endDate;
    });
    
    // หากไม่มีข้อมูล
    if (filteredTransactions.length === 0) {
      throw new Error('ไม่พบข้อมูลธุรกรรมในช่วงเวลาที่เลือก');
    }
    
    // สร้างข้อมูล CSV header
    const headers = ['วันที่', 'ประเภท', 'หมวดหมู่', 'จำนวนเงิน', 'รายละเอียด'];
    
    // ฟังก์ชันสำหรับจัดการข้อความที่มีเครื่องหมายจุลภาค
    const escapeCSV = (text: string) => {
      // ถ้ามีเครื่องหมายจุลภาคหรือขึ้นบรรทัดใหม่ ให้ครอบด้วยเครื่องหมายคำพูด
      if (text.includes(',') || text.includes('"') || text.includes('\n')) {
        // แทนที่เครื่องหมายคำพูดด้วยเครื่องหมายคำพูดซ้อน
        return `"${text.replace(/"/g, '""')}"`;  
      }
      return text;
    };
    
    // แปลงข้อมูลธุรกรรมเป็นรูปแบบ CSV
    const csvRows = filteredTransactions.map(transaction => {
      // หาชื่อหมวดหมู่จาก category_id
      const category = categories.find(c => c.id === transaction.category_id);
      const categoryName = category ? category.name : '';
      
      // แปลงประเภทธุรกรรมเป็นภาษาไทย
      const typeInThai = transaction.type === 'income' ? 'รายรับ' : 'รายจ่าย';
      
      // จัดรูปแบบวันที่
      const formattedDate = new Date(transaction.date).toLocaleDateString('th-TH');
      
      // สร้างแถวข้อมูล CSV
      return [
        escapeCSV(formattedDate),
        escapeCSV(typeInThai),
        escapeCSV(categoryName),
        transaction.amount.toString(),
        escapeCSV(transaction.description || '')
      ];
    });
    
    // เรียงลำดับตามวันที่จากเก่าไปใหม่
    csvRows.sort((a, b) => {
      const dateA = new Date(a[0].replace(/"/g, ''));
      const dateB = new Date(b[0].replace(/"/g, ''));
      return dateA.getTime() - dateB.getTime();
    });
    
    // รวม header และข้อมูลเข้าด้วยกัน
    const csvContent = [
      headers.join(','),
      ...csvRows.map(row => row.join(','))
    ].join('\n');
    
    return csvContent;
  };

  return {
    transactions,
    categories,
    loading,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    addCategory,
    updateCategory,
    deleteCategory,
    refreshTransactions: fetchTransactions,
    refreshCategories: fetchCategories,
    uploadTransactionImage,
    exportTransactionsToCSV
  };

};