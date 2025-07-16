import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MyAccount } from "@/types/transaction";

const formSchema = z.object({
  name: z.string().min(2, {
    message: "ชื่อกระเป๋าเงินต้องมีอย่างน้อย 2 ตัวอักษร",
  }),
  description: z.string().optional(),
});

interface AccountFormProps {
  onSubmit: (values: z.infer<typeof formSchema>) => void;
  defaultValues?: MyAccount;
  onCancel: () => void;
  isEditing?: boolean;
}

export function AccountForm({ onSubmit, defaultValues, onCancel, isEditing = false }: AccountFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: defaultValues?.name ?? "",
      description: defaultValues?.description ?? "",
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>ชื่อกระเป๋าเงิน</FormLabel>
              <FormControl>
                <Input placeholder="เช่น กระเป๋าเงินหลัก" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>รายละเอียดกระเป๋าเงิน</FormLabel>
              <FormControl>
                <Textarea placeholder="รายละเอียดเพิ่มเติม (ไม่บังคับ)" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-center gap-4 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            ยกเลิก
          </Button>
          <Button type="submit">
            {isEditing ? "แก้กระเป๋าเงิน" : "เพิ่มกระเป๋าเงิน"}
          </Button>
        </div>
      </form>
    </Form>
  );
}