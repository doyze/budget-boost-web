import { useState, useMemo } from 'react';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { th } from 'date-fns/locale';
import { Calendar, TrendingUp, TrendingDown, Wallet, Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useFirebaseData } from '@/hooks/useFirebaseData';
import TransactionChart from '@/components/TransactionChart';
import TransactionList from '@/components/TransactionList';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const { transactions, categories, loading } = useFirebaseData();
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'));

  const monthlyData = useMemo(() => {
    if (!selectedMonth) return { income: 0, expense: 0, balance: 0, transactions: [] };

    const [year, month] = selectedMonth.split('-').map(Number);
    const monthStart = startOfMonth(new Date(year, month - 1));
    const monthEnd = endOfMonth(new Date(year, month - 1));

    const monthTransactions = transactions.filter(t => {
      const transactionDate = new Date(t.date);
      return transactionDate >= monthStart && transactionDate <= monthEnd;
    });

    const income = monthTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const expense = monthTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      income,
      expense,
      balance: income - expense,
      transactions: monthTransactions
    };
  }, [transactions, selectedMonth]);

  const availableMonths = useMemo(() => {
    const months = new Set<string>();
    transactions.forEach(t => {
      const date = new Date(t.date);
      months.add(format(date, 'yyyy-MM'));
    });
    
    // Add current month if no transactions
    if (months.size === 0) {
      months.add(format(new Date(), 'yyyy-MM'));
    }
    
    return Array.from(months).sort().reverse();
  }, [transactions]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-lg text-muted-foreground">กำลังโหลดข้อมูล...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-xl md:text-2xl font-bold text-foreground">สรุปรายรับรายจ่าย</h1>
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="w-full sm:w-48">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {availableMonths.map(month => (
                <SelectItem key={month} value={month}>
                  {format(new Date(month + '-01'), 'MMMM yyyy', { locale: th })}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Link to="/add">
            <Button className="w-full sm:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              เพิ่มรายการ
            </Button>
          </Link>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">รายรับ</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold text-green-600">
              ฿{monthlyData.income.toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">รายจ่าย</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold text-red-600">
              ฿{monthlyData.expense.toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ยอดคงเหลือ</CardTitle>
            <Wallet className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className={`text-xl md:text-2xl font-bold ${
              monthlyData.balance >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              ฿{monthlyData.balance.toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chart and Transaction List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        <TransactionChart 
          transactions={monthlyData.transactions} 
          categories={categories} 
        />
        
        <TransactionList 
          transactions={monthlyData.transactions} 
          categories={categories}
          title={`รายการ ${format(new Date(selectedMonth + '-01'), 'MMMM yyyy', { locale: th })}`}
        />
      </div>
    </div>
  );
};

export default Dashboard;