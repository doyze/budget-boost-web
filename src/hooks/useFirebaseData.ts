import { useState, useEffect } from 'react';
import { ref, onValue, push, set, remove, update } from 'firebase/database';
import { database } from '@/lib/firebase';
import { Transaction, Category } from '@/types/transaction';
import { useAuth } from '@/hooks/useAuth';

export const useFirebaseData = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Default categories
  const defaultCategories: Category[] = [
    // Income categories
    { id: 'salary', name: 'เงินเดือน', type: 'income', icon: '💰', isDefault: true },
    { id: 'freelance', name: 'งานพิเศษ', type: 'income', icon: '💼', isDefault: true },
    { id: 'investment', name: 'การลงทุน', type: 'income', icon: '📈', isDefault: true },
    { id: 'other-income', name: 'รายได้อื่นๆ', type: 'income', icon: '💵', isDefault: true },
    
    // Expense categories
    { id: 'food', name: 'อาหาร', type: 'expense', icon: '🍔', isDefault: true },
    { id: 'transport', name: 'ค่าเดินทาง', type: 'expense', icon: '🚗', isDefault: true },
    { id: 'utilities', name: 'ค่าน้ำค่าไฟ', type: 'expense', icon: '💡', isDefault: true },
    { id: 'entertainment', name: 'ความบันเทิง', type: 'expense', icon: '🎮', isDefault: true },
    { id: 'shopping', name: 'ช้อปปิ้ง', type: 'expense', icon: '🛍️', isDefault: true },
    { id: 'healthcare', name: 'ค่ารักษาพยาบาล', type: 'expense', icon: '🏥', isDefault: true },
    { id: 'education', name: 'การศึกษา', type: 'expense', icon: '📚', isDefault: true },
    { id: 'other-expense', name: 'ค่าใช้จ่ายอื่นๆ', type: 'expense', icon: '💸', isDefault: true },
  ];

  useEffect(() => {
    if (!user) {
      setTransactions([]);
      setCategories(defaultCategories);
      setLoading(false);
      return;
    }

    const userTransactionsRef = ref(database, `users/${user.id}/transactions`);
    const userCategoriesRef = ref(database, `users/${user.id}/categories`);

    // Initialize default categories if not exists
    const initializeCategories = async () => {
      const categoriesSnapshot = await new Promise((resolve) => {
        onValue(userCategoriesRef, resolve, { onlyOnce: true });
      });
      
      if (!(categoriesSnapshot as any).exists()) {
        const categoriesObj: Record<string, Category> = {};
        defaultCategories.forEach(cat => {
          categoriesObj[cat.id] = {
            ...cat,
            email: user.email || '',
            isDefault: true
          };
        });
        await set(userCategoriesRef, categoriesObj);
      }
    };

    // Listen to user's transactions
    const unsubscribeTransactions = onValue(userTransactionsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const transactionsList = Object.keys(data).map(key => ({
          id: key,
          ...data[key],
          // Add email to existing transactions that don't have it
          email: data[key].email || user.email || ''
        }));
        setTransactions(transactionsList);
      } else {
        setTransactions([]);
      }
    });

    // Listen to user's categories
    const unsubscribeCategories = onValue(userCategoriesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const categoriesList = Object.keys(data).map(key => ({
          id: key,
          ...data[key],
          // Add email to existing categories that don't have it
          email: data[key].email || user.email || '',
          // Mark existing categories as default if they don't have isDefault field
          isDefault: data[key].isDefault !== undefined ? data[key].isDefault : true
        }));
        setCategories(categoriesList);
      } else {
        setCategories(defaultCategories);
      }
      setLoading(false);
    });

    initializeCategories();

    return () => {
      unsubscribeTransactions();
      unsubscribeCategories();
    };
  }, [user]);

  const addTransaction = async (transaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt' | 'email'>) => {
    if (!user) return;
    
    const userTransactionsRef = ref(database, `users/${user.id}/transactions`);
    const now = new Date().toISOString();
    const newTransactionRef = push(userTransactionsRef);
    
    await set(newTransactionRef, {
      ...transaction,
      email: user.email || '',
      createdAt: now,
      updatedAt: now
    });
  };

  const updateTransaction = async (id: string, updates: Partial<Transaction>) => {
    if (!user) return;
    
    const transactionRef = ref(database, `users/${user.id}/transactions/${id}`);
    await update(transactionRef, {
      ...updates,
      updatedAt: new Date().toISOString()
    });
  };

  const deleteTransaction = async (id: string) => {
    if (!user) return;
    
    const transactionRef = ref(database, `users/${user.id}/transactions/${id}`);
    await remove(transactionRef);
  };

  const addCategory = async (category: Omit<Category, 'id' | 'email' | 'isDefault'>) => {
    if (!user) return;
    
    const userCategoriesRef = ref(database, `users/${user.id}/categories`);
    const newCategoryRef = push(userCategoriesRef);
    await set(newCategoryRef, {
      ...category,
      email: user.email || '',
      isDefault: false
    });
  };

  const updateCategory = async (id: string, updates: Partial<Category>) => {
    if (!user) return;
    
    // Get category first to check if it's user's own and not default
    const categoryRef = ref(database, `users/${user.id}/categories/${id}`);
    const categorySnapshot = await new Promise<any>((resolve) => {
      onValue(categoryRef, resolve, { onlyOnce: true });
    });
    
    const category = categorySnapshot.val();
    if (!category || category.email !== user.email || category.isDefault) {
      throw new Error('ไม่สามารถแก้ไขหมวดหมู่นี้ได้');
    }
    
    await update(categoryRef, updates);
  };

  const deleteCategory = async (id: string) => {
    if (!user) return;
    
    // Get category first to check if it's user's own and not default
    const categoryRef = ref(database, `users/${user.id}/categories/${id}`);
    const categorySnapshot = await new Promise<any>((resolve) => {
      onValue(categoryRef, resolve, { onlyOnce: true });
    });
    
    const category = categorySnapshot.val();
    if (!category || category.email !== user.email || category.isDefault) {
      throw new Error('ไม่สามารถลบหมวดหมู่นี้ได้');
    }
    
    await remove(categoryRef);
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
    deleteCategory
  };
};