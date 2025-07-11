import { useState } from 'react';
import { format } from 'date-fns';
import { th } from 'date-fns/locale';
import { Edit, Trash2, Plus, Eye } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useSupabaseData } from '@/hooks/useSupabaseData';
import { Transaction, Category } from '@/types/transaction';
import EditTransactionDialog from './EditTransactionDialog';

interface TransactionListProps {
  transactions: Transaction[];
  categories: Category[];
  title?: string;
}

const TransactionList = ({ transactions, categories, title = "รายการล่าสุด" }: TransactionListProps) => {
  const { toast } = useToast();
  const { deleteTransaction } = useSupabaseData();
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [viewingTransaction, setViewingTransaction] = useState<Transaction | null>(null);

  const sortedTransactions = [...transactions].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const handleDelete = async (transactionId: string) => {
    try {
      await deleteTransaction(transactionId);
      toast({
        title: 'สำเร็จ',
        description: 'ลบรายการเรียบร้อยแล้ว'
      });
    } catch (error) {
      toast({
        title: 'เกิดข้อผิดพลาด',
        description: 'ไม่สามารถลบรายการได้',
        variant: 'destructive'
      });
    }
  };

  const getCategoryInfo = (categoryId: string) => {
    return categories.find(cat => cat.id === categoryId) || { name: 'ไม่ระบุ', icon: '❓' };
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          {sortedTransactions.length > 0 ? (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {sortedTransactions.map((transaction) => {
                const category = getCategoryInfo(transaction.category_id || '');
                
                return (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-3 bg-muted rounded-lg"
                  >
                    <div className="flex items-center space-x-3 flex-1">
                      <span className="text-xl">{category.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <p className="font-medium truncate">{transaction.description}</p>
                          <Badge
                            variant={transaction.type === 'income' ? 'default' : 'secondary'}
                            className={
                              transaction.type === 'income' 
                                ? 'bg-green-100 text-green-800 hover:bg-green-100' 
                                : 'bg-red-100 text-red-800 hover:bg-red-100'
                            }
                          >
                            {category.name}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(transaction.date), 'dd MMM yyyy', { locale: th })}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <span
                        className={`font-bold ${
                          transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                        }`}
                      >
                        {transaction.type === 'income' ? '+' : '-'}฿{transaction.amount.toLocaleString()}
                      </span>
                      
                      <div className="flex items-center space-x-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setViewingTransaction(transaction)}
                          title="ดูรายละเอียด"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEditingTransaction(transaction)}
                          title="แก้ไขรายการ"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button size="sm" variant="outline">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>ยืนยันการลบ</AlertDialogTitle>
                              <AlertDialogDescription>
                                คุณแน่ใจหรือไม่ที่จะลบรายการ "{transaction.description}" 
                                จำนวน ฿{transaction.amount.toLocaleString()} การดำเนินการนี้ไม่สามารถย้อนกลับได้
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(transaction.id)}>
                                ลบ
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Plus className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>ยังไม่มีรายการในเดือนนี้</p>
            </div>
          )}
        </CardContent>
      </Card>

      {editingTransaction && (
        <EditTransactionDialog
          transaction={editingTransaction}
          categories={categories}
          open={!!editingTransaction}
          onOpenChange={(open) => !open && setEditingTransaction(null)}
        />
      )}

      {/* View Transaction Dialog */}
      {viewingTransaction && (
        <Dialog open={!!viewingTransaction} onOpenChange={(open) => !open && setViewingTransaction(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <Eye className="h-5 w-5" />
                <span>รายละเอียดรายการ</span>
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-6">
              {/* Transaction Type */}
              <div>
                <label className="text-sm font-medium text-muted-foreground">ประเภท</label>
                <p className={`font-medium ${viewingTransaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                  {viewingTransaction.type === 'income' ? 'รายรับ' : 'รายจ่าย'}
                </p>
              </div>

              {/* Amount */}
              <div>
                <label className="text-sm font-medium text-muted-foreground">จำนวนเงิน</label>
                <p className={`text-lg font-bold ${viewingTransaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                  {viewingTransaction.type === 'income' ? '+' : '-'}฿{viewingTransaction.amount.toLocaleString()}
                </p>
              </div>

              {/* Category */}
              <div>
                <label className="text-sm font-medium text-muted-foreground">หมวดหมู่</label>
                <div className="flex items-center space-x-2">
                  <span className="text-lg">{getCategoryInfo(viewingTransaction.category_id || '').icon}</span>
                  <span>{getCategoryInfo(viewingTransaction.category_id || '').name}</span>
                </div>
              </div>

              {/* Date */}
              <div>
                <label className="text-sm font-medium text-muted-foreground">วันที่</label>
                <p>{format(new Date(viewingTransaction.date), 'dd MMMM yyyy', { locale: th })}</p>
              </div>

              {/* Description */}
              <div>
                <label className="text-sm font-medium text-muted-foreground">รายละเอียด</label>
                <p className="whitespace-pre-wrap">{viewingTransaction.description}</p>
              </div>

              {/* Image */}
              {viewingTransaction.image_url && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">รูปภาพ</label>
                  <div className="mt-2">
                    <img
                      src={viewingTransaction.image_url}
                      alt="Transaction"
                      className="max-w-full h-auto rounded-lg border max-h-64 object-contain"
                    />
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};

export default TransactionList;