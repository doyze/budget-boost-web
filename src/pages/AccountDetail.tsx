import { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { th } from 'date-fns/locale';
import { ArrowLeft, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSupabaseData } from '@/hooks/useSupabaseData';
import TransactionChart from '@/components/TransactionChart';
import TransactionList from '@/components/TransactionList';
import MonthYearSelector from '@/components/MonthYearSelector';
import SummaryCard from '@/components/SummaryCard';
import SummarySection from '@/components/SummarySection';

const AccountDetail = () => {
  const { accountId } = useParams<{ accountId: string }>();
  const navigate = useNavigate();
  const { transactions, categories, accounts, loading } = useSupabaseData();
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'));

  // ค้นหาข้อมูลบัญชีจาก accountId
  const account = useMemo(() => {
    return accounts.find(acc => acc.id === accountId);
  }, [accounts, accountId]);

  // กรองข้อมูลธุรกรรมตามบัญชีและเดือนที่เลือก
  const monthlyData = useMemo(() => {
    if (!selectedMonth || !accountId) return { income: 0, expense: 0, balance: 0, transactions: [] };

    const [year, month] = selectedMonth.split('-').map(Number);
    const monthStart = startOfMonth(new Date(year, month - 1));
    const monthEnd = endOfMonth(new Date(year, month - 1));

    // กรองธุรกรรมตามเดือนที่เลือกและบัญชีที่ระบุ
    const filteredTransactions = transactions.filter(t => {
      const transactionDate = new Date(t.date);
      return (
        transactionDate >= monthStart && 
        transactionDate <= monthEnd && 
        t.account_id === accountId
      );
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
  }, [transactions, selectedMonth, accountId]);

  // คำนวณเดือนที่มีข้อมูลธุรกรรมของบัญชีนี้
  const availableMonths = useMemo(() => {
    const months = new Set<string>();
    
    // กรองเฉพาะธุรกรรมของบัญชีนี้
    const accountTransactions = transactions.filter(t => t.account_id === accountId);
    
    accountTransactions.forEach(t => {
      const date = new Date(t.date);
      months.add(format(date, 'yyyy-MM'));
    });
    
    // เพิ่มเดือนปัจจุบันถ้าไม่มีข้อมูล
    if (months.size === 0) {
      months.add(format(new Date(), 'yyyy-MM'));
    }
    
    return Array.from(months).sort().reverse();
  }, [transactions, accountId]);

  // ถ้าไม่พบบัญชีที่ระบุ
  if (!loading && !account) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">ไม่พบบัญชีที่ระบุ</h1>
        </div>
        <p>ไม่พบบัญชีที่ระบุ กรุณาตรวจสอบข้อมูลอีกครั้ง</p>
        <Button onClick={() => navigate('/')}>
          กลับไปหน้าหลัก
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* หัวข้อและปุ่มย้อนกลับ */}
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Wallet className="h-6 w-6" />
          {account?.name || 'รายละเอียดบัญชี'}
        </h1>
      </div>

      {/* ตัวเลือกเดือน */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="w-full sm:w-auto">
          <MonthYearSelector 
            value={selectedMonth} 
            onChange={setSelectedMonth} 
            options={availableMonths} 
            placeholder="เลือกเดือน" 
            ariaLabel="เลือกเดือน"
          />
        </div>
      </div>
      
      {/* สรุปข้อมูลบัญชี */}
      <SummarySection title="สรุปบัญชี">
        <SummaryCard 
          title={account?.name || 'บัญชี'}
          value={monthlyData.balance}
          icon={<Wallet className="h-6 w-6" />}
          color="dynamic"
          subtitle={`รายรับ: ฿${monthlyData.income.toLocaleString()} | รายจ่าย: ฿${monthlyData.expense.toLocaleString()}`}
        />
      </SummarySection>

      {/* กราฟและรายการธุรกรรม */}
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

export default AccountDetail;