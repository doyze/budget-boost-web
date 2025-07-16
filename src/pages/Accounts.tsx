import { MyAccount } from '../types/transaction';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { PlusCircle, Pencil, Trash2, Wallet, Landmark, CreditCard } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { AccountForm } from '@/components/AccountForm';
import { useState } from 'react';
import { getAccounts, createAccount, updateAccount, deleteAccount } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { z } from 'zod';
import { useAuth } from '@/hooks/useAuth';

const formSchema = z.object({
  name: z.string().min(2, {
    message: "ชื่อกระเป๋าเงินต้องมีอย่างน้อย 2 ตัวอักษร",
  }),
  description: z.string().optional(),
});

const Accounts = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { toast } = useToast();

  const { data: myAccounts, error, isLoading } = useQuery({
    queryKey: ['accounts'],
    queryFn: getAccounts,
    select: (res) => res.data,
  });

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<MyAccount | undefined>(
    undefined
  );



  const createMutation = useMutation({
    mutationFn: (values: z.infer<typeof formSchema>) => {
      if (!user) throw new Error('User not logged in');
      return createAccount(values, user.id);
    },
    onSuccess: () => {
      toast({ title: 'สร้างกระเป๋าเงินสำเร็จแล้ว' });
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      setCreateDialogOpen(false);
    },
    onError: (error) => {
      toast({ title: 'เกิดข้อผิดพลาดในการสร้างกระเป๋าเงิน', description: error.message });
    },
  });

  const handleCreate = (values: z.infer<typeof formSchema>) => {
    createMutation.mutate(values);
  };

  const updateMutation = useMutation({
    mutationFn: (values: z.infer<typeof formSchema>) => {
      if (!selectedAccount) throw new Error('No account selected');
      return updateAccount(values, selectedAccount.id);
    },
    onSuccess: () => {
      toast({ title: 'อัปเดตกระเป๋าเงินสำเร็จแล้ว' });
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      setEditDialogOpen(false);
      setSelectedAccount(undefined);
    },
    onError: (error) => {
      toast({ title: 'เกิดข้อผิดพลาดในการอัปเดตกระเป๋าเงิน', description: error.message });
    },
  });

  const handleUpdate = (values: z.infer<typeof formSchema>) => {
    updateMutation.mutate(values);
  };

  const deleteMutation = useMutation({
    mutationFn: deleteAccount,
    onSuccess: () => {
      toast({ title: 'ลบกระเป๋าเงินสำเร็จแล้ว' });
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
    },
    onError: (error) => {
      toast({ title: 'เกิดข้อผิดพลาดในการลบกระเป๋าเงิน', description: error.message });
    },
  });

  const handleDelete = (accountId: number) => {
    deleteMutation.mutate(accountId);
  };

  const getAccountIcon = () => {
    return <Wallet className="h-8 w-8 text-muted-foreground" />;
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-1/2" />
              </CardContent>
              <CardFooter className="flex justify-center gap-4 pt-2">
                <Skeleton className="h-10 w-20" />
                <Skeleton className="h-10 w-20" />
              </CardFooter>
            </Card>
          ))}
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-center py-10">
          <h2 className="text-xl font-semibold">เกิดข้อผิดพลาดในการโหลดกระเป๋าเงิน</h2>
          <p className="text-muted-foreground">{error.message}</p>
        </div>
      );
    }

    if (!myAccounts || myAccounts.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 py-12 text-center">
          <Wallet className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">ยังไม่มีกระเป๋าเงิน</h3>
          <p className="mt-2 text-sm text-gray-500">เริ่มต้นด้วยการเพิ่มกระเป๋าเงินใหม่</p>
          <DialogTrigger asChild>
            <Button className="mt-4">
              <PlusCircle className="mr-2 h-4 w-4" />
              เพิ่มกระเป๋าเงิน
            </Button>
          </DialogTrigger>
        </div>
      );
    }

    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {myAccounts.map((account) => (
          <Card key={account.id}>
            <CardHeader>
              <CardTitle className="flex justify-between items-start">
                <div className="flex items-center gap-4">
                  {getAccountIcon()}
                  <div>
                    <p>{account.name}</p>
                    {account.description && (
                      <p className="text-sm font-normal text-muted-foreground">{account.description}</p>
                    )}
                  </div>
                </div>
              </CardTitle>
            </CardHeader>
            <CardFooter className="flex justify-end gap-2">
              <Dialog open={editDialogOpen && selectedAccount?.id === account.id} onOpenChange={(isOpen) => {
                if (!isOpen) {
                  setSelectedAccount(undefined);
                }
                setEditDialogOpen(isOpen);
              }}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" onClick={() => setSelectedAccount(account)}>
                    <Pencil className="h-4 w-4 mr-2" /> แก้ไข
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>แก้ไขกระเป๋าเงิน</DialogTitle>
                  </DialogHeader>
                  <AccountForm onSubmit={handleUpdate} defaultValues={account} onCancel={() => setEditDialogOpen(false)} isEditing={true} />
                </DialogContent>
              </Dialog>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm">
                    <Trash2 className="h-4 w-4 mr-2" /> ลบ
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>คุณแน่ใจหรือไม่?</AlertDialogTitle>
                    <AlertDialogDescription>
                      การกระทำนี้ไม่สามารถยกเลิกได้ กระเป๋าเงินนี้จะถูกลบอย่างถาวร
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
                    <AlertDialogAction onClick={() => handleDelete(account.id)}>ดำเนินการต่อ</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">กระเป๋าเงินของฉัน</h1>
        <DialogTrigger asChild>
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            เพิ่มกระเป๋าเงิน
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>เพิ่มกระเป๋าเงินใหม่</DialogTitle>
          </DialogHeader>
          <AccountForm onSubmit={handleCreate} onCancel={() => setCreateDialogOpen(false)} />
        </DialogContent>
      </div>
      {renderContent()}
    </Dialog>
  );
};

export default Accounts;