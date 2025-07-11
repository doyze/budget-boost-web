import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { CalendarIcon, Edit, Upload, X, Image } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useSupabaseData } from '@/hooks/useSupabaseData';
import { Transaction, Category } from '@/types/transaction';
import { cn } from '@/lib/utils';

const transactionSchema = z.object({
  type: z.enum(['income', 'expense']),
  amount: z.number().min(0.01, 'จำนวนเงินต้องมากกว่า 0'),
  category_id: z.string().min(1, 'กรุณาเลือกหมวดหมู่'),
  description: z.string().min(1, 'กรุณาใส่รายละเอียด'),
  date: z.date(),
  image_url: z.string().optional()
});

type TransactionForm = z.infer<typeof transactionSchema>;

interface EditTransactionDialogProps {
  transaction: Transaction;
  categories: Category[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const EditTransactionDialog = ({ 
  transaction, 
  categories, 
  open, 
  onOpenChange 
}: EditTransactionDialogProps) => {
  const { toast } = useToast();
  const { updateTransaction, uploadTransactionImage } = useSupabaseData();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(transaction.image_url || null);

  const form = useForm<TransactionForm>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: transaction.type,
      amount: transaction.amount,
      category_id: transaction.category_id || '',
      description: transaction.description,
      date: new Date(transaction.date),
      image_url: transaction.image_url || undefined
    }
  });

  const watchType = form.watch('type');
  const availableCategories = categories; // Show all categories since they're no longer type-specific

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
    try {
      let imageUrl = imagePreview;
      
      // Upload new image if selected
      if (imageFile) {
        imageUrl = await uploadTransactionImage(imageFile);
      }

      await updateTransaction(transaction.id, {
        type: data.type,
        amount: data.amount,
        category_id: data.category_id,
        description: data.description,
        date: data.date.toISOString(),
        image_url: imageUrl || undefined
      });

      toast({
        title: 'สำเร็จ',
        description: 'แก้ไขรายการเรียบร้อยแล้ว'
      });

      onOpenChange(false);
    } catch (error) {
      toast({
        title: 'เกิดข้อผิดพลาด',
        description: 'ไม่สามารถแก้ไขรายการได้',
        variant: 'destructive'
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Edit className="h-5 w-5" />
            <span>แก้ไขรายการ</span>
          </DialogTitle>
        </DialogHeader>
        
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
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="income" id="edit-income" />
                        <Label htmlFor="edit-income" className="text-green-600 font-medium">
                          รายรับ
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="expense" id="edit-expense" />
                        <Label htmlFor="edit-expense" className="text-red-600 font-medium">
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
                      {availableCategories.map((category) => (
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
                  <FormLabel>รายละเอียด</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="ใส่รายละเอียดของรายการ"
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
            <div className="flex space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="flex-1"
              >
                ยกเลิก
              </Button>
              <Button type="submit" className="flex-1">
                บันทึกการแก้ไข
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default EditTransactionDialog;