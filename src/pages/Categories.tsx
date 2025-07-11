import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Edit, Trash2, Plus, Palette } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useSupabaseData } from '@/hooks/useSupabaseData';
import { Category } from '@/types/transaction';

const categorySchema = z.object({
  name: z.string().min(1, 'กรุณาใส่ชื่อหมวดหมู่'),
  icon: z.string().min(1, 'กรุณาเลือกไอคอน'),
  color: z.string().min(1, 'กรุณาเลือกสี')
});

type CategoryForm = z.infer<typeof categorySchema>;

const EMOJI_OPTIONS = [
  '🍽️', '🚗', '🏠', '💰', '🎬', '🛒', '📱', '⚡', '🏥', '📚',
  '✈️', '🎮', '👕', '🎵', '🏃', '🍕', '☕', '🎁', '💳', '📊'
];

const COLOR_OPTIONS = [
  '#EF4444', '#F97316', '#F59E0B', '#EAB308', '#84CC16',
  '#22C55E', '#10B981', '#14B8A6', '#06B6D4', '#0EA5E9',
  '#3B82F6', '#6366F1', '#8B5CF6', '#A855F7', '#D946EF',
  '#EC4899', '#F43F5E', '#64748B', '#6B7280', '#374151'
];

const Categories = () => {
  const { toast } = useToast();
  const { categories, addCategory, updateCategory, deleteCategory, loading } = useSupabaseData();
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const form = useForm<CategoryForm>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: '',
      icon: '📋',
      color: '#3B82F6'
    }
  });

  const onSubmit = async (data: CategoryForm) => {
    try {
      if (editingCategory) {
        await updateCategory(editingCategory.id, data);
        toast({
          title: 'สำเร็จ',
          description: 'แก้ไขหมวดหมู่เรียบร้อยแล้ว'
        });
      } else {
        await addCategory(data as { name: string; icon: string; color: string });
        toast({
          title: 'สำเร็จ',
          description: 'เพิ่มหมวดหมู่เรียบร้อยแล้ว'
        });
      }
      
      form.reset();
      setEditingCategory(null);
      setIsDialogOpen(false);
    } catch (error) {
      toast({
        title: 'เกิดข้อผิดพลาด',
        description: 'ไม่สามารถบันทึกหมวดหมู่ได้',
        variant: 'destructive'
      });
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    form.reset({
      name: category.name,
      icon: category.icon,
      color: category.color
    });
    setIsDialogOpen(true);
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

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setEditingCategory(null);
    form.reset();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-lg text-muted-foreground">กำลังโหลดข้อมูล...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">จัดการหมวดหมู่</h1>
          <p className="text-muted-foreground">เพิ่ม แก้ไข หรือลบหมวดหมู่สำหรับรายรับรายจ่าย</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              เพิ่มหมวดหมู่
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingCategory ? 'แก้ไขหมวดหมู่' : 'เพิ่มหมวดหมู่ใหม่'}
              </DialogTitle>
              <DialogDescription>
                กรุณาใส่ข้อมูลหมวดหมู่
              </DialogDescription>
            </DialogHeader>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ชื่อหมวดหมู่</FormLabel>
                      <FormControl>
                        <Input placeholder="เช่น อาหาร, เดินทาง" {...field} />
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
                      <div className="grid grid-cols-10 gap-2 p-2 border rounded-md">
                        {EMOJI_OPTIONS.map((emoji) => (
                          <button
                            key={emoji}
                            type="button"
                            onClick={() => field.onChange(emoji)}
                            className={`p-2 text-lg hover:bg-accent rounded ${
                              field.value === emoji ? 'bg-accent' : ''
                            }`}
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="color"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>สี</FormLabel>
                      <div className="grid grid-cols-10 gap-2 p-2 border rounded-md">
                        {COLOR_OPTIONS.map((color) => (
                          <button
                            key={color}
                            type="button"
                            onClick={() => field.onChange(color)}
                            className={`w-8 h-8 rounded-full border-2 ${
                              field.value === color ? 'border-foreground' : 'border-transparent'
                            }`}
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex space-x-2">
                  <Button type="button" variant="outline" onClick={handleDialogClose}>
                    ยกเลิก
                  </Button>
                  <Button type="submit">
                    {editingCategory ? 'แก้ไข' : 'เพิ่ม'}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((category) => (
          <Card key={category.id}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-2xl">{category.icon}</span>
                  <div>
                    <CardTitle className="text-lg">{category.name}</CardTitle>
                    <div 
                      className="w-4 h-4 rounded-full mt-1" 
                      style={{ backgroundColor: category.color }}
                    />
                  </div>
                </div>
                
                <div className="flex items-center space-x-1">
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
                          คุณแน่ใจหรือไม่ที่จะลบหมวดหมู่ "{category.name}" 
                          การดำเนินการนี้ไม่สามารถย้อนกลับได้
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
            </CardHeader>
          </Card>
        ))}
        
        {categories.length === 0 && (
          <Card className="col-span-full">
            <CardContent className="text-center py-12">
              <Palette className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground">ยังไม่มีหมวดหมู่</p>
              <p className="text-sm text-muted-foreground">เริ่มต้นด้วยการเพิ่มหมวดหมู่แรกของคุณ</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Categories;