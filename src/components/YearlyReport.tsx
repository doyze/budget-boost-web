import { useMemo } from 'react';
import { format } from 'date-fns';
import { th } from 'date-fns/locale';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Transaction, Category } from '@/types/transaction';

interface YearlyReportProps {
  year: number;
  transactions: Transaction[];
  categories: Category[];
}

const YearlyReport = ({ year, transactions, categories }: YearlyReportProps) => {
  const yearlyData = useMemo(() => {
    const yearTransactions = transactions.filter(t => {
      const transactionDate = new Date(t.date);
      return transactionDate.getFullYear() === year;
    });

    // Monthly summary
    const monthlyData = Array.from({ length: 12 }, (_, index) => {
      const month = index + 1;
      const monthTransactions = yearTransactions.filter(t => {
        const transactionDate = new Date(t.date);
        return transactionDate.getMonth() + 1 === month;
      });

      const income = monthTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);

      const expense = monthTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

      return {
        month: format(new Date(year, index, 1), 'MMM', { locale: th }),
        income,
        expense,
        balance: income - expense
      };
    });

    // Category summary
    const categoryData: { [key: string]: { income: number; expense: number } } = {};
    
    categories.forEach(cat => {
      categoryData[cat.name] = { income: 0, expense: 0 };
    });

    yearTransactions.forEach(transaction => {
      const category = categories.find(cat => cat.id === transaction.category);
      if (category) {
        if (transaction.type === 'income') {
          categoryData[category.name].income += transaction.amount;
        } else {
          categoryData[category.name].expense += transaction.amount;
        }
      }
    });

    const categorySummary = Object.entries(categoryData)
      .map(([name, data]) => ({
        name,
        income: data.income,
        expense: data.expense,
        total: data.income + data.expense
      }))
      .filter(item => item.total > 0)
      .sort((a, b) => b.total - a.total);

    // Totals
    const totalIncome = yearTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpense = yearTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      monthlyData,
      categorySummary,
      totalIncome,
      totalExpense,
      totalBalance: totalIncome - totalExpense,
      transactionCount: yearTransactions.length
    };
  }, [year, transactions, categories]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.dataKey === 'income' ? 'รายรับ' : 
               entry.dataKey === 'expense' ? 'รายจ่าย' : 
               entry.dataKey === 'balance' ? 'ยอดคงเหลือ' : entry.dataKey}: 
              ฿{entry.value.toLocaleString()}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Year Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-600">รายรับรวม</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ฿{yearlyData.totalIncome.toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-red-600">รายจ่ายรวม</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              ฿{yearlyData.totalExpense.toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-blue-600">ยอดคงเหลือ</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${
              yearlyData.totalBalance >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              ฿{yearlyData.totalBalance.toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">จำนวนรายการ</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {yearlyData.transactionCount}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Comparison Chart */}
      <Card>
        <CardHeader>
          <CardTitle>รายรับรายจ่ายรายเดือน ปี {year}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={yearlyData.monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="income" fill="#10b981" name="รายรับ" />
                <Bar dataKey="expense" fill="#ef4444" name="รายจ่าย" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Balance Trend */}
      <Card>
        <CardHeader>
          <CardTitle>แนวโน้มยอดคงเหลือ</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={yearlyData.monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip content={<CustomTooltip />} />
                <Line 
                  type="monotone" 
                  dataKey="balance" 
                  stroke="#3b82f6" 
                  strokeWidth={3}
                  name="ยอดคงเหลือ"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Category Summary */}
      <Card>
        <CardHeader>
          <CardTitle>สรุปตามหมวดหมู่</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {yearlyData.categorySummary.map((category, index) => (
              <div key={category.name} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="font-medium">{category.name}</div>
                <div className="flex items-center space-x-4 text-sm">
                  {category.income > 0 && (
                    <span className="text-green-600">
                      รายรับ: ฿{category.income.toLocaleString()}
                    </span>
                  )}
                  {category.expense > 0 && (
                    <span className="text-red-600">
                      รายจ่าย: ฿{category.expense.toLocaleString()}
                    </span>
                  )}
                  <span className="font-medium">
                    รวม: ฿{category.total.toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default YearlyReport;