import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

const DeleteTransaction = () => {
  const [transactionId, setTransactionId] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleDelete = async () => {
    if (!transactionId) {
      toast({
        title: 'ข้อผิดพลาด',
        description: 'กรุณาใส่ ID ของรายการธุรกรรม',
        variant: 'destructive',
      });
      return;
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
        description: `ลบรายการธุรกรรม ID: ${transactionId} เรียบร้อยแล้ว`,
      });
      setTransactionId('');
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">ลบรายการธุรกรรม</h1>
      <div className="flex gap-2">
        <Input
          type="text"
          placeholder="ใส่ ID ของรายการธุรกรรม"
          value={transactionId}
          onChange={(e) => setTransactionId(e.target.value)}
          className="max-w-sm"
        />
        <Button onClick={handleDelete} disabled={loading}>
          {loading ? 'กำลังลบ...' : 'ลบ'}
        </Button>
      </div>
    </div>
  );
};

export default DeleteTransaction;