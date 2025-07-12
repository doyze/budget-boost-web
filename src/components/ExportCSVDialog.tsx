import { useState } from 'react';
import { format, subMonths } from 'date-fns';
import { th } from 'date-fns/locale';
import { Calendar, Download, FileSpreadsheet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { useSupabaseData } from '@/hooks/useSupabaseData';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

interface ExportCSVDialogProps {
  className?: string;
}

const ExportCSVDialog = ({ className }: ExportCSVDialogProps) => {
  // กำหนดค่าเริ่มต้นเป็นเดือนที่แล้วถึงวันปัจจุบัน
  const [startDate, setStartDate] = useState<string>(format(subMonths(new Date(), 1), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  const [open, setOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const { exportTransactionsToCSV, transactions } = useSupabaseData();

  // ฟังก์ชันสำหรับตั้งค่าช่วงเวลาล่วงหน้า
  const setDateRange = (months: number) => {
    const end = new Date();
    const start = subMonths(end, months);
    setStartDate(format(start, 'yyyy-MM-dd'));
    setEndDate(format(end, 'yyyy-MM-dd'));
  };

  const handleExport = async () => {
    try {
      setIsExporting(true);
      
      // แปลงวันที่จาก string เป็น Date object
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      // ตรวจสอบว่าวันที่เริ่มต้นไม่มากกว่าวันที่สิ้นสุด
      if (start > end) {
        toast.error('วันที่เริ่มต้นต้องไม่มากกว่าวันที่สิ้นสุด');
        setIsExporting(false);
        return;
      }

      // ดึงข้อมูล CSV
      const csvContent = exportTransactionsToCSV(start, end);
      
      // เพิ่ม BOM เพื่อให้รองรับภาษาไทยใน Excel
      const BOM = '\uFEFF';
      const csvContentWithBOM = BOM + csvContent;
      
      // สร้าง Blob จากข้อมูล CSV
      const blob = new Blob([csvContentWithBOM], { type: 'text/csv;charset=utf-8;' });
      
      // สร้าง URL สำหรับดาวน์โหลด
      const url = URL.createObjectURL(blob);
      
      // สร้าง element a สำหรับดาวน์โหลด
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `รายรับรายจ่าย_${format(start, 'dd-MM-yyyy')}_ถึง_${format(end, 'dd-MM-yyyy')}.csv`);
      document.body.appendChild(link);
      
      // คลิกลิงก์เพื่อดาวน์โหลด
      link.click();
      
      // ลบลิงก์
      document.body.removeChild(link);
      
      // แสดงข้อความสำเร็จ
      toast.success('ส่งออกข้อมูลสำเร็จ');
      
      // ปิด Dialog
      setOpen(false);
    } catch (error) {
      // แสดงข้อความผิดพลาด
      toast.error(error instanceof Error ? error.message : 'เกิดข้อผิดพลาดในการส่งออกข้อมูล');
    } finally {
      setIsExporting(false);
    }
  };

  // คำนวณจำนวนธุรกรรมที่จะส่งออก
  const getTransactionCount = () => {
    try {
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      if (start > end) return 0;
      
      return transactions.filter(t => {
        const transactionDate = new Date(t.date);
        return transactionDate >= start && transactionDate <= end;
      }).length;
    } catch (error) {
      return 0;
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className={cn("bg-green-50 hover:bg-green-100 border-green-200", className)}>
          <FileSpreadsheet className="h-4 w-4 mr-2 text-green-600" />
          ส่งออก CSV
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <FileSpreadsheet className="h-5 w-5 mr-2 text-green-600" />
            ส่งออกข้อมูลรายรับรายจ่าย
          </DialogTitle>
          <DialogDescription>
            เลือกช่วงเวลาที่ต้องการส่งออกข้อมูลรายรับรายจ่ายเป็นไฟล์ CSV
          </DialogDescription>
        </DialogHeader>
        
        {/* ปุ่มช่วงเวลาล่วงหน้า */}
        <div className="flex flex-wrap gap-2 my-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setDateRange(1)}
            className="text-xs"
          >
            1 เดือน
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setDateRange(3)}
            className="text-xs"
          >
            3 เดือน
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setDateRange(6)}
            className="text-xs"
          >
            6 เดือน
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setDateRange(12)}
            className="text-xs"
          >
            1 ปี
          </Button>
        </div>
        
        <Separator className="my-2" />
        
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="startDate" className="text-right">
              วันที่เริ่มต้น
            </Label>
            <div className="col-span-3 flex items-center">
              <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="endDate" className="text-right">
              วันที่สิ้นสุด
            </Label>
            <div className="col-span-3 flex items-center">
              <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>
        </div>
        
        <div className="text-sm text-muted-foreground mb-4">
          จำนวนรายการที่จะส่งออก: <span className="font-medium">{getTransactionCount()}</span> รายการ
        </div>
        
        <DialogFooter>
          <Button 
            type="submit" 
            onClick={handleExport} 
            disabled={isExporting || getTransactionCount() === 0}
            className="bg-green-600 hover:bg-green-700"
          >
            {isExporting ? (
              <>
                <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent" />
                กำลังส่งออก...
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                ส่งออก CSV
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ExportCSVDialog;