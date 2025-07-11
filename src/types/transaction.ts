export interface Transaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  description: string;
  date: string; // ISO string format
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  type: 'income' | 'expense';
  icon?: string;
}

export interface MonthlyData {
  year: number;
  month: number;
  transactions: Transaction[];
  totalIncome: number;
  totalExpense: number;
  balance: number;
}