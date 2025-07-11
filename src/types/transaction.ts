export interface Transaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  description: string;
  date: string; // ISO string format
  email: string; // User email for identification
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  type: 'income' | 'expense';
  icon?: string;
  email?: string; // User email for identification
  isDefault?: boolean; // Mark default categories that cannot be deleted
}

export interface MonthlyData {
  year: number;
  month: number;
  transactions: Transaction[];
  totalIncome: number;
  totalExpense: number;
  balance: number;
}