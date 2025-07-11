import { useState, useEffect } from 'react';
import { ref, onValue, push, set, remove, update } from 'firebase/database';
import { database } from '@/lib/firebase';
import { Transaction, Category } from '@/types/transaction';

export const useFirebaseData = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Default categories
  const defaultCategories: Category[] = [
    // Income categories
    { id: 'salary', name: 'เงินเดือน', type: 'income', icon: '💰' },
    { id: 'freelance', name: 'งานพิเศษ', type: 'income', icon: '💼' },
    { id: 'investment', name: 'การลงทุน', type: 'income', icon: '📈' },
    { id: 'other-income', name: 'รายได้อื่นๆ', type: 'income', icon: '💵' },
    
    // Expense categories
    { id: 'food', name: 'อาหาร', type: 'expense', icon: '🍔' },
    { id: 'transport', name: 'ค่าเดินทาง', type: 'expense', icon: '🚗' },
    { id: 'utilities', name: 'ค่าน้ำค่าไฟ', type: 'expense', icon: '💡' },
    { id: 'entertainment', name: 'ความบันเทิง', type: 'expense', icon: '🎮' },
    { id: 'shopping', name: 'ช้อปปิ้ง', type: 'expense', icon: '🛍️' },
    { id: 'healthcare', name: 'ค่ารักษาพยาบาล', type: 'expense', icon: '🏥' },
    { id: 'education', name: 'การศึกษา', type: 'expense', icon: '📚' },
    { id: 'other-expense', name: 'ค่าใช้จ่ายอื่นๆ', type: 'expense', icon: '💸' },
  ];

  useEffect(() => {
    const transactionsRef = ref(database, 'transactions');
    const categoriesRef = ref(database, 'categories');

    // Initialize default categories if not exists
    const initializeCategories = async () => {
      const categoriesSnapshot = await new Promise((resolve) => {
        onValue(categoriesRef, resolve, { onlyOnce: true });
      });
      
      if (!(categoriesSnapshot as any).exists()) {
        const categoriesObj: Record<string, Category> = {};
        defaultCategories.forEach(cat => {
          categoriesObj[cat.id] = cat;
        });
        await set(categoriesRef, categoriesObj);
      }
    };

    // Listen to transactions
    const unsubscribeTransactions = onValue(transactionsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const transactionsList = Object.keys(data).map(key => ({
          id: key,
          ...data[key]
        }));
        setTransactions(transactionsList);
      } else {
        setTransactions([]);
      }
    });

    // Listen to categories
    const unsubscribeCategories = onValue(categoriesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const categoriesList = Object.keys(data).map(key => ({
          id: key,
          ...data[key]
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
  }, []);

  const addTransaction = async (transaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>) => {
    const transactionsRef = ref(database, 'transactions');
    const now = new Date().toISOString();
    const newTransactionRef = push(transactionsRef);
    
    await set(newTransactionRef, {
      ...transaction,
      createdAt: now,
      updatedAt: now
    });
  };

  const updateTransaction = async (id: string, updates: Partial<Transaction>) => {
    const transactionRef = ref(database, `transactions/${id}`);
    await update(transactionRef, {
      ...updates,
      updatedAt: new Date().toISOString()
    });
  };

  const deleteTransaction = async (id: string) => {
    const transactionRef = ref(database, `transactions/${id}`);
    await remove(transactionRef);
  };

  const addCategory = async (category: Omit<Category, 'id'>) => {
    const categoriesRef = ref(database, 'categories');
    const newCategoryRef = push(categoriesRef);
    await set(newCategoryRef, category);
  };

  const updateCategory = async (id: string, updates: Partial<Category>) => {
    const categoryRef = ref(database, `categories/${id}`);
    await update(categoryRef, updates);
  };

  const deleteCategory = async (id: string) => {
    const categoryRef = ref(database, `categories/${id}`);
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