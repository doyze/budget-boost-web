import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useSupabaseData } from '@/hooks/useSupabaseData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Edit, CalendarIcon, Image, X } from 'lucide-react';
import { Transaction, Category } from '@/types/transaction';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

const transactionSchema = z.object({
  type: z.enum(['income', 'expense']),
  amount: z.number().min(0.01, 'จำนวนเงินต้องมากกว่า 0'),
  category_id: z.string().min(1, 'กรุณาเลือกหมวดหมู่'),
  description: z.string().optional(),
  date: z.date(),
  image_url: z.string().optional()
});

type TransactionForm = z.infer<typeof transactionSchema>;

const EditTransaction = () => {
  const [transactionId, setTransactionId] = useState('');
  const [loading, setLoading] = useState(false);
  const [accountName, setAccountName] = useState('');
  const [transactionDetails, setTransactionDetails] = useState<Transaction | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const { accounts, categories, updateTransaction, uploadTransactionImage, refetch } = useSupabaseData();
  
  // ดึง accountId และ transactionId จาก URL query parameters
  const queryParams = new URLSearchParams(location.search);
  const accountId = queryParams.get('accountId') || '';
  const transactionIdFromUrl = queryParams.get('transactionId') || '';
  
  // สร้าง form
  const form = useForm<TransactionForm>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: 'expense',
      amount: 0,
      category_id: '',
      description: '',
      date: new Date(),
      image_url: undefined
    }
  });

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
      setLoading(true);
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching transaction details:', error);
        toast({
          title: 'ข้อผิดพลาด',
          description: 'ไม่พบข้อมูลรายการ',
          variant: 'destructive',
        });
        setLoading(false);
        return;
      }

      if (data) {
        const transaction = data as Transaction;
        setTransactionDetails(transaction);
        setImagePreview(transaction.image_url || null);
        
        // กำหนดค่าเริ่มต้นให้กับฟอร์ม
        form.reset({
          type: transaction.type,
          amount: transaction.amount,
          category_id: transaction.category_id || '',
          description: transaction.description || '',
          date: new Date(transaction.date),
          image_url: transaction.image_url || undefined
        });
      }
      setLoading(false);
    } catch (error) {
      console.error('Error:', error);
      setLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    form.setValue('image_url', undefined);
  };

  const onSubmit = async (data: TransactionForm) => {
    if (!transactionDetails) {
      toast({
        title: 'ข้อผิดพลาด',
        description: 'ไม่พบข้อมูลรายการที่ต้องการแก้ไข',
        variant: 'destructive',
      });
      return;
    }

    try {
      setLoading(true);
      let imageUrl = imagePreview;
      
      // Upload new image if selected
      if (imageFile) {
        imageUrl = await uploadTransactionImage(imageFile);
      }

      // แก้ไขปัญหาวันที่ถอยหลังไป 1 วัน
      // สร้างวันที่ใหม่โดยใช้ปี เดือน วัน จากวันที่ที่ผู้ใช้เลือก
      const selectedDate = data.date;
      const year = selectedDate.getFullYear();
      const month = selectedDate.getMonth();
      const day = selectedDate.getDate();
      const formattedDate = new Date(year, month, day, 12, 0, 0);
      
      // อัปเดตรายการธุรกรรม
      await updateTransaction(transactionDetails.id, {
        type: data.type,
        amount: data.amount,
        category_id: data.category_id,
        description: data.description,
        date: formattedDate.toISOString(),
        image_url: imageUrl || undefined
      });

      // ดึงข้อมูลใหม่เพื่ออัปเดตหน้าจอ
      await refetch();

      toast({
        title: 'สำเร็จ',
        description: 'แก้ไขรายการเรียบร้อยแล้ว'
      });

      // ถ้ามี accountId ให้นำทางกลับไปที่หน้ารายละเอียดบัญชี
      if (accountId) {
        navigate(`/account/${accountId}`);
      } else {
        navigate('/');
      }
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: 'เกิดข้อผิดพลาด',
        description: 'ไม่สามารถแก้ไขรายการได้',
        variant: 'destructive'
      });
      setLoading(false);
    }
  };

  const watchType = form.watch('type');

  return (
    <div className="max-w-2xl mx-auto px-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Edit className="h-5 w-5 text-blue-500" />
            <span>แก้ไขรายการ</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {accountId && (
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-4">
                <p className="text-blue-700 text-lg font-semibold text-center">กำลังแก้ไขรายการจากกระเป๋าเงิน "{accountName || `ID: ${accountId}`}"</p>
              </div>
            )}
            
            {!transactionDetails && !transactionIdFromUrl ? (
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
            ) : loading ? (
              <div className="text-center py-4">
                <p>กำลังโหลดข้อมูล...</p>
              </div>
            ) : transactionDetails ? (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  {/* Transaction Type */}
                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>ประเภท</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            value={field.value}
                            className="flex space-x-6"
                          >
                            <div className={`flex items-center space-x-2 p-3 rounded-lg transition-colors ${field.value === 'income' ? 'bg-green-50' : ''}`}>
                              <RadioGroupItem value="income" id="edit-income" />
                              <Label htmlFor="edit-income" className="flex items-center text-green-600 font-medium">
                                <div className="bg-green-100 text-green-800 rounded-full w-6 h-6 flex items-center justify-center mr-2">
                                  <span>+</span>
                                </div>
                                รายรับ
                              </Label>
                            </div>
                            <div className={`flex items-center space-x-2 p-3 rounded-lg transition-colors ${field.value === 'expense' ? 'bg-red-50' : ''}`}>
                              <RadioGroupItem value="expense" id="edit-expense" />
                              <Label htmlFor="edit-expense" className="flex items-center text-red-600 font-medium">
                                <div className="bg-red-100 text-red-800 rounded-full w-6 h-6 flex items-center justify-center mr-2">
                                  <span>-</span>
                                </div>
                                รายจ่าย
                              </Label>
                            </div>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Amount */}
                  <FormField
                    control={form.control}
                    name="amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>จำนวนเงิน (บาท)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Category */}
                  <FormField
                    control={form.control}
                    name="category_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>หมวดหมู่</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="เลือกหมวดหมู่" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {categories.map((category) => (
                              <SelectItem key={category.id} value={category.id}>
                                <div className="flex items-center space-x-2">
                                  <span>{category.icon}</span>
                                  <span>{category.name}</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Date */}
                  <FormField
                    control={form.control}
                    name="date"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>วันที่</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                className={cn(
                                  "w-full pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? (
                                  format(field.value, "dd/MM/yyyy")
                                ) : (
                                  <span>เลือกวันที่</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) => date > new Date()}
                              initialFocus
                              className="p-3 pointer-events-auto"
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Description */}
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>รายละเอียด (ไม่บังคับ)</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="ใส่รายละเอียดของรายการ (ไม่บังคับ)"
                            className="resize-none"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Image Upload */}
                  <FormField
                    control={form.control}
                    name="image_url"
                    render={() => (
                      <FormItem>
                        <FormLabel>รูปภาพ (ไม่บังคับ)</FormLabel>
                        <FormControl>
                          <div className="space-y-4">
                            {imagePreview ? (
                              <div className="relative inline-block">
                                <img
                                  src={imagePreview}
                                  alt="Transaction"
                                  className="w-32 h-32 object-cover rounded-lg border"
                                />
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="destructive"
                                  className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                                  onClick={removeImage}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            ) : (
                              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6">
                                <div className="text-center">
                                  <Image className="mx-auto h-12 w-12 text-muted-foreground/50" />
                                  <div className="mt-4">
                                    <label htmlFor="edit-image-upload" className="cursor-pointer">
                                      <span className="mt-2 block text-sm font-medium text-muted-foreground">
                                        คลิกเพื่อเลือกรูปภาพ
                                      </span>
                                      <input
                                        id="edit-image-upload"
                                        type="file"
                                        className="hidden"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                      />
                                    </label>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Submit Buttons */}
                  <div className="flex justify-center gap-4 mt-6">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => accountId ? navigate(`/account/${accountId}`) : navigate('/')}
                    >
                      ยกเลิก
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={loading}
                    >
                      {loading ? 'กำลังบันทึก...' : 'บันทึกการแก้ไข'}
                    </Button>
                  </div>
                </form>
              </Form>
            ) : null}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EditTransaction;