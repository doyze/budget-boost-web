import { useState, useMemo } from 'react';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { th } from 'date-fns/locale';
import { Plus, CreditCard, Wallet } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useSupabaseData } from '@/hooks/useSupabaseData';
import TransactionChart from '@/components/TransactionChart';
import TransactionList from '@/components/TransactionList';
import { Link, useNavigate } from 'react-router-dom';
import { Transaction } from '@/types/transaction';
import MonthYearSelector from '@/components/MonthYearSelector';
import SummaryCard from '@/components/SummaryCard';
import SummarySection from '@/components/SummarySection';

const Dashboard = () => {
  const { transactions, categories, accounts, loading } = useSupabaseData();
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'));
  const navigate = useNavigate();
  
  // ฟังก์ชันสำหรับการนำทางไปยังหน้าแสดงรายละเอียดของบัญชีนั้นๆ
  const handleAccountIconClick = (account_id: string) => {
    // นำทางไปยังหน้า AccountDetail โดยส่ง account_id เป็น URL parameter
    navigate(`/account/${account_id}`);
  };

  const monthlyData = useMemo(() => {
    if (!selectedMonth) return { income: 0, expense: 0, balance: 0, transactions: [] };

    const [year, month] = selectedMonth.split('-').map(Number);
    const monthStart = startOfMonth(new Date(year, month - 1));
    const monthEnd = endOfMonth(new Date(year, month - 1));

    // กรองธุรกรรมตามเดือนที่เลือก
    const filteredTransactions = transactions.filter(t => {
      const transactionDate = new Date(t.date);
      return transactionDate >= monthStart && transactionDate <= monthEnd;
    });

    const income = filteredTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const expense = filteredTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      income,
      expense,
      balance: income - expense,
      transactions: filteredTransactions
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
        <div className="flex items-center gap-2">
          <Link to="/add">
            <Button className="w-full sm:w-auto">
              <Plus className="h-6 w-6 mr-2" />
              เพิ่มรายการ
            </Button>
          </Link>
        </div>
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
          <MonthYearSelector 
            value={selectedMonth} 
            onChange={setSelectedMonth} 
            options={availableMonths} 
            placeholder="เลือกเดือน" 
            ariaLabel="เลือกเดือน"
          />
        </div>
      </div>
      
      {/* Account Summary Cards */}
      <SummarySection title="สรุปกระเป๋าเงิน">
        
        {accounts.map(account => {
          // คำนวณยอดรวมธุรกรรมสำหรับบัญชีนี้ในเดือนที่เลือก
          const accountTransactions = monthlyData.transactions.filter(t => t.account_id === account.id);
          const accountIncome = accountTransactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0);
          const accountExpense = accountTransactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0);
          const accountBalance = accountIncome - accountExpense;
          
          return (
            <SummaryCard 
              key={account.id}
              title={account.name}
              value={accountBalance}
              icon={<Wallet className="h-6 w-6" />}
              color="dynamic"
              subtitle={`รายรับ: ฿${accountIncome.toLocaleString()} | รายจ่าย: ฿${accountExpense.toLocaleString()}`}
              account_id={account.id}
              onIconClick={() => handleAccountIconClick(account.id)}
            />
          );
        })}
        
        {accounts.length === 0 && (
          <Card className="col-span-full">
            <CardContent className="flex flex-col items-center justify-center py-6">
              <p className="text-muted-foreground mb-2">ยังไม่มีกระเป๋าเงิน</p>
              <Link to="/accounts">
                <Button variant="outline" size="sm">
                  <Plus className="h-6 w-6 mr-2" />
                  เพิ่มกระเป๋าเงินใหม่
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </SummarySection>

      {/* Chart and Transaction List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        <SummarySection title="กราฟสรุป" className="h-full">
          <TransactionChart 
            transactions={monthlyData.transactions} 
            categories={categories} 
            className="col-span-full"
          />
        </SummarySection>
        
        <SummarySection 
          title="รายการธุรกรรม" 
          tag={format(new Date(selectedMonth + '-01'), 'MMMM yyyy', { locale: th })}
          className="h-full"
        >
          <TransactionList 
            transactions={monthlyData.transactions} 
            categories={categories}
            title={`รายการ ${format(new Date(selectedMonth + '-01'), 'MMMM yyyy', { locale: th })}`}
            className="col-span-full"
          />
        </SummarySection>
      </div>
    </div>
  );
};

export default Dashboard;