import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useSupabaseData } from '@/hooks/useSupabaseData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trash2 } from 'lucide-react';
import { Transaction } from '@/types/transaction';

const DeleteTransaction = () => {
  const [transactionId, setTransactionId] = useState('');
  const [loading, setLoading] = useState(false);
  const [accountName, setAccountName] = useState('');
  const [transactionDetails, setTransactionDetails] = useState<Transaction | null>(null);
  const [categoryName, setCategoryName] = useState('');
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const { accounts, categories } = useSupabaseData();
  
  // ดึง accountId และ transactionId จาก URL query parameters
  const queryParams = new URLSearchParams(location.search);
  const accountId = queryParams.get('accountId') || '';
  const transactionIdFromUrl = queryParams.get('transactionId') || '';
  
  // ถ้ามี transactionId จาก URL ให้ใช้ค่านั้นและดึงข้อมูลรายการ
  useEffect(() => {
    if (transactionIdFromUrl) {
      setTransactionId(transactionIdFromUrl);
      fetchTransactionDetails(transactionIdFromUrl);
    }
    
    // ดึงชื่อบัญชีจาก accountId
    if (accountId && accounts.length > 0) {
      const account = accounts.find(acc => acc.id === accountId);
      if (account) {
        setAccountName(account.name);
      }
    }
  }, [transactionIdFromUrl, accountId, accounts]);

  // ดึงข้อมูลรายการจาก transactionId
  const fetchTransactionDetails = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching transaction details:', error);
        return;
      }

      if (data) {
        setTransactionDetails(data as Transaction);
        
        // ดึงชื่อหมวดหมู่
        if (data.category_id && categories.length > 0) {
          const category = categories.find(cat => cat.id === data.category_id);
          if (category) {
            setCategoryName(category.name);
          }
        }
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleDelete = async () => {
    if (!transactionId) {
      toast({
        title: 'ข้อผิดพลาด',
        description: 'กรุณาใส่ ID ของรายการ',
        variant: 'destructive',
      });
      return;
    }

    // ถ้ายังไม่มีข้อมูลรายการ ให้ดึงข้อมูลก่อน
    if (!transactionDetails) {
      await fetchTransactionDetails(transactionId);
    }

    setLoading(true);
    const { error } = await supabase
      .from('transactions')
      .delete()
      .match({ id: transactionId });

    setLoading(false);

    if (error) {
      toast({
        title: 'เกิดข้อผิดพลาดในการลบ',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'สำเร็จ',
        description: `ลบรายการเรียบร้อยแล้ว`,
      });
      setTransactionId('');
      setTransactionDetails(null);
      setCategoryName('');
      
      // ถ้ามี accountId ให้นำทางกลับไปที่หน้ารายละเอียดบัญชี
      if (accountId) {
        navigate(`/account/${accountId}`);
      }
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Trash2 className="h-5 w-5 text-red-500" />
            <span>ลบรายการ</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {accountId && (
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-4">
                <p className="text-blue-700 text-lg font-semibold text-center">กำลังลบรายการจากกระเป๋าเงิน "{accountName || `ID: ${accountId}`}"</p>
              </div>
            )}
            
            {transactionDetails ? (
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <p className="text-gray-700 mb-2">
                  <span className="font-semibold">หมวดหมู่:</span> {categoryName || 'ไม่ระบุหมวดหมู่'}
                </p>
                <p className="text-gray-700 mb-2">
                  <span className="font-semibold">วันที่:</span> {new Date(transactionDetails.date).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
                <p className="text-gray-700 mb-2">
                  <span className="font-semibold">จำนวนเงิน:</span> {transactionDetails.amount.toLocaleString('th-TH')} บาท
                </p>
                {transactionDetails.description && (
                  <p className="text-gray-700">
                    <span className="font-semibold">รายละเอียด:</span> {transactionDetails.description}
                  </p>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                 <div className="flex gap-2">
                   <Input
                     type="text"
                     placeholder="ใส่ ID ของรายการ"
                     value={transactionId}
                     onChange={(e) => setTransactionId(e.target.value)}
                     className="flex-1"
                   />
                   <Button 
                     onClick={() => fetchTransactionDetails(transactionId)}
                     variant="secondary"
                     disabled={!transactionId || loading}
                   >
                     ดึงข้อมูล
                   </Button>
                 </div>
                 <p className="text-sm text-gray-500 italic">กรอก ID รายการและคลิก "ดึงข้อมูล" เพื่อแสดงรายละเอียด</p>
               </div>
            )}
            
            <div className="flex justify-center gap-4 mt-6">
              <Button
                variant="outline"
                onClick={() => accountId ? navigate(`/account/${accountId}`) : navigate('/')}
              >
                ยกเลิก
              </Button>
              <Button 
                onClick={handleDelete} 
                disabled={loading}
                variant="destructive"
              >
                {loading ? 'กำลังลบ...' : 'ลบรายการ'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DeleteTransaction;