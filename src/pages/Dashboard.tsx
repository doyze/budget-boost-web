import { useState, useMemo } from 'react';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { th } from 'date-fns/locale';
import { Calendar, TrendingUp, TrendingDown, Wallet } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useFirebaseData } from '@/hooks/useFirebaseData';
import TransactionChart from '@/components/TransactionChart';
import TransactionList from '@/components/TransactionList';
import YearlyReport from '@/components/YearlyReport';

const Dashboard = () => {
  const { transactions, categories, loading } = useFirebaseData();
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'));
  const [viewMode, setViewMode] = useState<'monthly' | 'yearly'>('monthly');

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

  const availableYears = useMemo(() => {
    const years = new Set<number>();
    transactions.forEach(t => {
      const date = new Date(t.date);
      years.add(date.getFullYear());
    });
    
    // Add current year if no transactions
    if (years.size === 0) {
      years.add(new Date().getFullYear());
    }
    
    return Array.from(years).sort().reverse();
  }, [transactions]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-lg text-muted-foreground">กำลังโหลดข้อมูล...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">แดชบอร์ด</h1>
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-4 w-full sm:w-auto">
          <Select value={viewMode} onValueChange={(value: 'monthly' | 'yearly') => setViewMode(value)}>
            <SelectTrigger className="w-full sm:w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="monthly">รายเดือน</SelectItem>
              <SelectItem value="yearly">รายปี</SelectItem>
            </SelectContent>
          </Select>

          {viewMode === 'monthly' ? (
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
          ) : (
            <Select value={selectedMonth.split('-')[0]} onValueChange={(year) => setSelectedMonth(year + '-01')}>
              <SelectTrigger className="w-full sm:w-32">
                <Calendar className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {availableYears.map(year => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      </div>

      {viewMode === 'monthly' ? (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">รายรับ</CardTitle>
                <TrendingUp className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
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
                <div className="text-2xl font-bold text-red-600">
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
                <div className={`text-2xl font-bold ${
                  monthlyData.balance >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  ฿{monthlyData.balance.toLocaleString()}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Chart and Transaction List */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
        </>
      ) : (
        <YearlyReport 
          year={parseInt(selectedMonth.split('-')[0])} 
          transactions={transactions} 
          categories={categories} 
        />
      )}
    </div>
  );
};

export default Dashboard;