import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { th } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';
import { Edit, Trash2, Plus, Eye, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
// ลบการนำเข้า AlertDialog เนื่องจากไม่ได้ใช้งานแล้ว
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useSupabaseData } from '@/hooks/useSupabaseData';
import { Transaction, Category } from '@/types/transaction';

interface TransactionListProps {
  transactions: Transaction[];
  categories: Category[];
  title?: string;
  className?: string;
  accountId?: string;
}

const TransactionList = ({ transactions, categories, title = "รายการล่าสุด", className, accountId }: TransactionListProps) => {
  const { toast } = useToast();
  const { deleteTransaction, refetch } = useSupabaseData();
  const [viewingTransaction, setViewingTransaction] = useState<Transaction | null>(null);
  const [imageZoom, setImageZoom] = useState(false);
  const [localTransactions, setLocalTransactions] = useState<Transaction[]>(transactions);
  
  // อัปเดต localTransactions เมื่อ transactions เปลี่ยนแปลง
  useEffect(() => {
    setLocalTransactions(transactions);
  }, [transactions]);
  
  // ฟังก์ชันสำหรับเปิดหน้าดูรายละเอียด
  const handleViewTransaction = (transaction: Transaction) => {
    setViewingTransaction(transaction);
  };
  const navigate = useNavigate();

  const sortedTransactions = [...localTransactions].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const handleDelete = async (transactionId: string) => {
    try {
      await deleteTransaction(transactionId);
      // รีเฟรชข้อมูลหลังจากลบรายการ
      await refetch();
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
      <Card className={className}>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          {sortedTransactions.length > 0 ? (
            <div className="space-y-3 max-h-[630px] overflow-y-auto">
              {sortedTransactions.map((transaction) => {
                const category = getCategoryInfo(transaction.category_id || '');
                
                return (
                  <Card 
                    key={transaction.id}
                    className={`mb-4 overflow-hidden transition-all duration-200 hover:shadow-md cursor-pointer ${transaction.type === 'income' ? 'border-green-200 hover:border-green-300' : 'border-red-200 hover:border-red-300'}`}
                    onClick={() => handleViewTransaction(transaction)}
                  >
                    <div className={`h-2 w-full ${transaction.type === 'income' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <CardContent className="p-4">
                      <div className="flex flex-col space-y-3">
                        {/* Header with amount and category */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className={`flex items-center justify-center rounded-full w-12 h-12 ${transaction.type === 'income' ? 'bg-green-100' : 'bg-red-100'} shadow-sm`}>
                              <span className="text-2xl">{category.icon}</span>
                            </div>
                            <div>
                              <h3 className="font-medium text-lg">{category.name}</h3>
                              <p className="text-sm text-muted-foreground">
                                {format(new Date(transaction.date), 'dd MMMM yyyy', { locale: th })}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className={`font-bold text-xl ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                              {transaction.type === 'income' ? '+' : '-'}฿{transaction.amount.toLocaleString()}
                            </p>
                          </div>
                        </div>
                        
                        {/* Description */}
                        {transaction.description && (
                          <div className="pt-2 border-t">
                            <p className="text-sm text-muted-foreground mb-1">รายละเอียด:</p>
                            <p className="text-base">{transaction.description}</p>
                          </div>
                        )}
                        
                        {/* Image preview if available */}
                        {transaction.image_url && (
                          <div className="pt-2 border-t">
                            <p className="text-sm text-muted-foreground mb-1">รูปภาพ:</p>
                            <div className="relative h-32 w-full overflow-hidden rounded-md bg-muted/20">
                              <img 
                                src={transaction.image_url} 
                                alt="Transaction" 
                                className="h-full w-full object-cover hover:scale-105 transition-transform duration-300"
                              />
                            </div>
                          </div>
                        )}
                        
                        {/* Action buttons */}
                         <div className="flex justify-end space-x-2 pt-2 border-t mt-2">
                           <Button
                             size="sm"
                             variant="outline"
                             onClick={(e) => {
                               e.stopPropagation();
                               handleViewTransaction(transaction);
                             }}
                             title="ดูรายละเอียด"
                           >
                             <Eye className="h-4 w-4" />
                           </Button>
                           
                           <Button
                             size="sm"
                             variant="outline"
                             onClick={(e) => {
                               e.stopPropagation();
                               if (accountId) {
                                 navigate(`/edit-transaction?accountId=${accountId}&transactionId=${transaction.id}`);
                               } else {
                                 navigate(`/edit-transaction?transactionId=${transaction.id}`);
                               }
                             }}
                             title="แก้ไขรายการ"
                           >
                             <Edit className="h-4 w-4" />
                           </Button>
                           
                           <Button 
                             size="sm" 
                             variant="outline"
                             className="text-red-500 hover:text-red-700 hover:bg-red-50"
                             onClick={(e) => {
                               e.stopPropagation();
                               if (accountId) {
                                 navigate(`/delete-transaction?accountId=${accountId}&transactionId=${transaction.id}`);
                               } else {
                                 handleDelete(transaction.id);
                                 setViewingTransaction(transaction);
                               }
                             }}
                           >
                             <Trash2 className="h-4 w-4" />
                           </Button>
                         </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 px-4">
              <div className="bg-muted/20 rounded-xl p-8 border border-dashed border-muted-foreground/30 max-w-md mx-auto">
                <div className="bg-primary/5 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                  <Plus className="h-10 w-10 text-primary/60" />
                </div>
                <h3 className="text-xl font-medium mb-2">ยังไม่มีรายการในเดือนนี้</h3>
                <p className="text-muted-foreground mb-6">เพิ่มรายการรายรับหรือรายจ่ายเพื่อติดตามการเงินของคุณ</p>
                <Button 
                  variant="outline" 
                  className="rounded-full px-6 py-2 border-primary/30 hover:border-primary/60 transition-colors"
                  onClick={() => navigate('/add')}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  เพิ่มรายการใหม่
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>



      {/* View Transaction Dialog */}
      {viewingTransaction && (
        <Dialog 
            open={!!viewingTransaction} 
            onOpenChange={(open) => {
              if (!open) {
                setViewingTransaction(null);
              }
            }}
        >
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader className="space-y-3">
              <DialogTitle className="flex items-center space-x-2 text-xl">
                <Eye className="h-6 w-6 text-primary" />
                <span>รายละเอียดรายการ</span>
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-6 p-1">


              {/* Amount - Prominent Display */}
              <div className="text-center py-6 bg-muted/30 rounded-lg border shadow-sm">
                <label className="text-sm font-medium text-muted-foreground block mb-3">จำนวนเงิน</label>
                <p className={`text-3xl font-bold ${viewingTransaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                  {viewingTransaction.type === 'income' ? '+' : '-'}฿{viewingTransaction.amount.toLocaleString()}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Category */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">หมวดหมู่</label>
                  <div className={`flex items-center space-x-3 p-4 rounded-lg border shadow-sm ${viewingTransaction.type === 'income' ? 'bg-green-50' : 'bg-red-50'}`}>
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${viewingTransaction.type === 'income' ? 'bg-green-100' : 'bg-red-100'}`}>
                      <span className="text-2xl">{getCategoryInfo(viewingTransaction.category_id || '').icon}</span>
                    </div>
                    <span className="font-medium text-lg">{getCategoryInfo(viewingTransaction.category_id || '').name}</span>
                  </div>
                </div>

                {/* Date */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">วันที่</label>
                  <div className="p-4 rounded-lg border shadow-sm bg-muted/20">
                    <div className="flex items-center">
                      <div className="bg-primary/10 rounded-full w-12 h-12 flex items-center justify-center mr-3">
                        <span className="text-xl">📅</span>
                      </div>
                      <div>
                        <p className="font-medium text-lg">{format(new Date(viewingTransaction.date), 'dd MMMM yyyy', { locale: th })}</p>
                        <p className="text-sm text-muted-foreground">{format(new Date(viewingTransaction.date), 'EEEE', { locale: th })}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">รายละเอียด</label>
                <div className="p-4 bg-muted/20 rounded-lg border shadow-sm min-h-[80px]">
                  <div className="flex">
                    <div className="bg-primary/10 rounded-full w-10 h-10 flex-shrink-0 flex items-center justify-center mr-3 mt-1">
                      <span className="text-lg">📝</span>
                    </div>
                    <p className="whitespace-pre-wrap leading-relaxed text-lg">
                      {viewingTransaction.description || 
                        <span className="text-muted-foreground italic">ไม่มีรายละเอียด</span>
                      }
                    </p>
                  </div>
                </div>
              </div>

              {/* Image */}
              {viewingTransaction.image_url && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">รูปภาพ</label>
                  <div className="border rounded-lg overflow-hidden bg-muted/20 shadow-sm p-2">
                    <div className="relative group">
                      <img
                        src={viewingTransaction.image_url}
                        alt="Transaction"
                        className="w-full h-auto max-h-64 object-contain cursor-pointer rounded-lg transition-all duration-300 group-hover:brightness-95"
                        onClick={() => setImageZoom(true)}
                      />
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/10 rounded-lg">
                        <div className="bg-white/90 rounded-full p-2 shadow-md">
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-zoom-in"><circle cx="11" cy="11" r="8"/><line x1="21" x2="16.65" y1="21" y2="16.65"/><line x1="11" x2="11" y1="8" y2="14"/><line x1="8" x2="14" y1="11" y2="11"/></svg>
                        </div>
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground text-center">คลิกที่รูปเพื่อดูขนาดเต็ม</p>
                </div>
              )}

              {/* Transaction Info */}
              <div className="pt-4 border-t space-y-3 mt-4">
                <div className="flex items-center justify-between text-sm p-2 rounded-lg bg-muted/10 hover:bg-muted/20 transition-colors">
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 text-primary/70"><path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.85.99 6.63 2.63"/><path d="M21 3v9h-9"/></svg>
                    <span className="text-muted-foreground">สร้างเมื่อ:</span>
                  </div>
                  <span className="font-medium">{format(new Date(viewingTransaction.created_at), 'dd MMM yyyy HH:mm', { locale: th })}</span>
                </div>
                {viewingTransaction.updated_at !== viewingTransaction.created_at && (
                  <div className="flex items-center justify-between text-sm p-2 rounded-lg bg-muted/10 hover:bg-muted/20 transition-colors">
                    <div className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 text-primary/70"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4Z"/></svg>
                      <span className="text-muted-foreground">แก้ไขล่าสุด:</span>
                    </div>
                    <span className="font-medium">{format(new Date(viewingTransaction.updated_at), 'dd MMM yyyy HH:mm', { locale: th })}</span>
                  </div>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Image Zoom Dialog */}
      {imageZoom && viewingTransaction?.image_url && (
        <Dialog open={imageZoom} onOpenChange={setImageZoom}>
          <DialogContent className="max-w-[95vw] max-h-[95vh] p-0 overflow-hidden">
            <div className="relative w-full h-full flex items-center justify-center bg-black/90">
              <Button
                variant="ghost"
                size="sm"
                className="absolute top-4 right-4 z-10 text-white hover:bg-white/20"
                onClick={() => setImageZoom(false)}
              >
                <X className="h-5 w-5" />
              </Button>
              <img
                src={viewingTransaction.image_url}
                alt="Transaction - Full Size"
                className="max-w-full max-h-full object-contain"
                onClick={() => setImageZoom(false)}
              />
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};

export default TransactionList;