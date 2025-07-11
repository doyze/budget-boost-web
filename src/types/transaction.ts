export interface Transaction {
  id: string;
  user_id: string;
  type: 'income' | 'expense';
  amount: number;
  category_id?: string;
  description?: string;
  image_url?: string;
  date: string;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  user_id: string;
  name: string;
  icon: string;
  color: string;
  created_at: string;
  updated_at: string;
}

export interface MonthlyData {
  year: number;
  month: number;
  transactions: Transaction[];
  totalIncome: number;
  totalExpense: number;
  balance: number;
}