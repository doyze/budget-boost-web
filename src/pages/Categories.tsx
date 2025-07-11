import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Edit, Trash2, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { useFirebaseData } from '@/hooks/useFirebaseData';
import { Category } from '@/types/transaction';

const categorySchema = z.object({
  name: z.string().min(1, 'กรุณาใส่ชื่อหมวดหมู่'),
  type: z.enum(['income', 'expense']),
  icon: z.string().min(1, 'กรุณาเลือกไอคอน')
});

type CategoryForm = z.infer<typeof categorySchema>;

const availableIcons = [
  '💰', '💼', '📈', '💵', '🎯', '🏆', '💎', '🌟',
  '🍔', '🚗', '💡', '🎮', '🛍️', '🏥', '📚', '💸',
  '🏠', '👕', '✈️', '📱', '🎬', '🍕', '☕', '⛽',
  '💳', '🎁', '🧾', '📊', '⚡', '🔧', '🎨', '🧘'
];

const Categories = () => {
  const { toast } = useToast();
  const { categories, addCategory, updateCategory, deleteCategory } = useFirebaseData();
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const form = useForm<CategoryForm>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: '',
      type: 'expense',
      icon: '📁'
    }
  });

  const editForm = useForm<CategoryForm>({
    resolver: zodResolver(categorySchema)
  });

  const incomeCategories = categories.filter(cat => cat.type === 'income');
  const expenseCategories = categories.filter(cat => cat.type === 'expense');

  const onAddSubmit = async (data: CategoryForm) => {
    try {
      await addCategory({
        name: data.name,
        type: data.type,
        icon: data.icon
      });
      toast({
        title: 'สำเร็จ',
        description: 'เพิ่มหมวดหมู่เรียบร้อยแล้ว'
      });
      setIsAddDialogOpen(false);
      form.reset();
    } catch (error) {
      toast({
        title: 'เกิดข้อผิดพลาด',
        description: 'ไม่สามารถเพิ่มหมวดหมู่ได้',
        variant: 'destructive'
      });
    }
  };

  const onEditSubmit = async (data: CategoryForm) => {
    if (!editingCategory) return;

    try {
      await updateCategory(editingCategory.id, data);
      toast({
        title: 'สำเร็จ',
        description: 'แก้ไขหมวดหมู่เรียบร้อยแล้ว'
      });
      setIsEditDialogOpen(false);
      setEditingCategory(null);
    } catch (error) {
      toast({
        title: 'เกิดข้อผิดพลาด',
        description: 'ไม่สามารถแก้ไขหมวดหมู่ได้',
        variant: 'destructive'
      });
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    editForm.reset({
      name: category.name,
      type: category.type,
      icon: category.icon || '📁'
    });
    setIsEditDialogOpen(true);
  };

  const handleDelete = async (categoryId: string) => {
    try {
      await deleteCategory(categoryId);
      toast({
        title: 'สำเร็จ',
        description: 'ลบหมวดหมู่เรียบร้อยแล้ว'
      });
    } catch (error) {
      toast({
        title: 'เกิดข้อผิดพลาด',
        description: 'ไม่สามารถลบหมวดหมู่ได้',
        variant: 'destructive'
      });
    }
  };

  const CategoryCard = ({ category }: { category: Category }) => (
    <div className="flex items-center justify-between p-3 bg-card border rounded-lg">
      <div className="flex items-center space-x-3">
        <span className="text-xl">{category.icon}</span>
        <span className="font-medium">{category.name}</span>
      </div>
      <div className="flex items-center space-x-2">
        <Button
          size="sm"
          variant="outline"
          onClick={() => handleEdit(category)}
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
                คุณแน่ใจหรือไม่ที่จะลบหมวดหมู่ "{category.name}" การดำเนินการนี้ไม่สามารถย้อนกลับได้
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
              <AlertDialogAction onClick={() => handleDelete(category.id)}>
                ลบ
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );

  const CategoryForm = ({ form, onSubmit }: { form: any; onSubmit: (data: CategoryForm) => void }) => (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                    <RadioGroupItem value="income" id="income" />
                    <Label htmlFor="income" className="text-green-600 font-medium">
                      รายรับ
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="expense" id="expense" />
                    <Label htmlFor="expense" className="text-red-600 font-medium">
                      รายจ่าย
                    </Label>
                  </div>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>ชื่อหมวดหมู่</FormLabel>
              <FormControl>
                <Input placeholder="ใส่ชื่อหมวดหมู่" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="icon"
          render={({ field }) => (
            <FormItem>
              <FormLabel>ไอคอน</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="max-h-60">
                  {availableIcons.map((icon) => (
                    <SelectItem key={icon} value={icon}>
                      <span className="text-lg">{icon}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full">
          บันทึก
        </Button>
      </form>
    </Form>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground flex items-center space-x-2">
          <Settings className="h-8 w-8" />
          <span>จัดการหมวดหมู่</span>
        </h1>
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              เพิ่มหมวดหมู่
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>เพิ่มหมวดหมู่ใหม่</DialogTitle>
            </DialogHeader>
            <CategoryForm form={form} onSubmit={onAddSubmit} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Income Categories */}
        <Card>
          <CardHeader>
            <CardTitle className="text-green-600">หมวดหมู่รายรับ</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {incomeCategories.length > 0 ? (
              incomeCategories.map(category => (
                <CategoryCard key={category.id} category={category} />
              ))
            ) : (
              <p className="text-muted-foreground text-center py-4">
                ยังไม่มีหมวดหมู่รายรับ
              </p>
            )}
          </CardContent>
        </Card>

        {/* Expense Categories */}
        <Card>
          <CardHeader>
            <CardTitle className="text-red-600">หมวดหมู่รายจ่าย</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {expenseCategories.length > 0 ? (
              expenseCategories.map(category => (
                <CategoryCard key={category.id} category={category} />
              ))
            ) : (
              <p className="text-muted-foreground text-center py-4">
                ยังไม่มีหมวดหมู่รายจ่าย
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>แก้ไขหมวดหมู่</DialogTitle>
          </DialogHeader>
          <CategoryForm form={editForm} onSubmit={onEditSubmit} />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Categories;