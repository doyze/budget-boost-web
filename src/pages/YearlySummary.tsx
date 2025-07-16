import { useState, useMemo } from 'react';
import { useSupabaseData } from '@/hooks/useSupabaseData';
import YearlyReport from '@/components/YearlyReport';
import YearSelector from '@/components/YearSelector';
import { Card, CardContent } from '@/components/ui/card';

const YearlySummary = () => {
  const { transactions, categories, loading } = useSupabaseData();
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

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
    <div className="space-y-4 md:space-y-6">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-xl md:text-2xl font-bold text-foreground">สรุปรายปี</h1>
        
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <YearSelector 
            value={selectedYear} 
            onChange={setSelectedYear} 
            options={availableYears} 
            placeholder="เลือกปี" 
            ariaLabel="เลือกปี"
          />
        </div>
      </div>

      {/* Yearly Report */}
      <Card>
        <CardContent className="p-6">
          <YearlyReport 
            year={selectedYear} 
            transactions={transactions} 
            categories={categories} 
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default YearlySummary;