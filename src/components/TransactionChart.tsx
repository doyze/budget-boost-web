import { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Transaction, Category } from '@/types/transaction';

interface TransactionChartProps {
  transactions: Transaction[];
  categories: Category[];
  className?: string;
}

const COLORS = [
  '#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8',
  '#82ca9d', '#ffc658', '#ff7c7c', '#8dd1e1', '#d084d0'
];

const TransactionChart = ({ transactions, categories, className }: TransactionChartProps) => {
  const chartData = useMemo(() => {
    const incomeData: { [key: string]: number } = {};
    const expenseData: { [key: string]: number } = {};

    transactions.forEach(transaction => {
      const category = categories.find(cat => cat.id === transaction.category_id);
      if (!category) return;

      if (transaction.type === 'income') {
        incomeData[category.name] = (incomeData[category.name] || 0) + transaction.amount;
      } else {
        expenseData[category.name] = (expenseData[category.name] || 0) + transaction.amount;
      }
    });

    const incomeChartData = Object.entries(incomeData).map(([name, value]) => ({
      name,
      value,
      percentage: 0
    }));

    const expenseChartData = Object.entries(expenseData).map(([name, value]) => ({
      name,
      value,
      percentage: 0
    }));

    // Calculate percentages
    const totalIncome = incomeChartData.reduce((sum, item) => sum + item.value, 0);
    const totalExpense = expenseChartData.reduce((sum, item) => sum + item.value, 0);

    incomeChartData.forEach(item => {
      item.percentage = totalIncome > 0 ? Math.round((item.value / totalIncome) * 100) : 0;
    });

    expenseChartData.forEach(item => {
      item.percentage = totalExpense > 0 ? Math.round((item.value / totalExpense) * 100) : 0;
    });

    return { incomeChartData, expenseChartData };
  }, [transactions, categories]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium">{data.name}</p>
          <p className="text-primary">
            ฿{data.value.toLocaleString()} ({data.percentage}%)
          </p>
        </div>
      );
    }
    return null;
  };

  const ChartSection = ({ 
    title, 
    data, 
    color 
  }: { 
    title: string; 
    data: any[]; 
    color: string;
  }) => (
    <div className="space-y-4">
      <h3 className={`text-lg font-semibold ${color}`}>{title}</h3>
      {data.length > 0 ? (
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                verticalAlign="bottom" 
                height={36}
                formatter={(value) => value.length > 15 ? value.substring(0, 15) + '...' : value}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="h-64 flex items-center justify-center text-muted-foreground">
          ไม่มีข้อมูล
        </div>
      )}
    </div>
  );

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>สัดส่วนรายรับรายจ่าย</CardTitle>
      </CardHeader>
      <CardContent className="space-y-8">
        <ChartSection 
          title="รายรับ" 
          data={chartData.incomeChartData} 
          color="text-green-600"
        />
        
        <ChartSection 
          title="รายจ่าย" 
          data={chartData.expenseChartData} 
          color="text-red-600"
        />
      </CardContent>
    </Card>
  );
};

export default TransactionChart;