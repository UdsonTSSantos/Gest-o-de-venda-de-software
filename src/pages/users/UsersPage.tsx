import { useState } from 'react'
import useMainStore from '@/stores/useMainStore'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { useToast } from '@/hooks/use-toast'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Plus } from 'lucide-react'

const userSchema = z.object({
  name: z.string().min(2),
  email: z
    .string()
    .email()
    .endsWith('@ast7.com.br', 'Email deve ser @ast7.com.br'),
  role: z.enum(['admin', 'user']),
})

export default function UsersPage() {
  const { users, addUser, toggleUserStatus } = useMainStore()
  const { toast } = useToast()
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const form = useForm<z.infer<typeof userSchema>>({
    resolver: zodResolver(userSchema),
    defaultValues: { name: '', email: '', role: 'user' },
  })

  const onSubmit = (data: z.infer<typeof userSchema>) => {
    addUser({
      ...data,
      active: true,
      avatar: `https://img.usecurling.com/ppl/thumbnail?gender=male&seed=${Math.floor(Math.random() * 100)}`,
    })
    toast({ title: 'Usuário criado' })
    setIsDialogOpen(false)
    form.reset()
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-slate-900">
          Usuários do Sistema
        </h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-indigo-600">
              <Plus className="mr-2 h-4 w-4" /> Novo Usuário
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adicionar Usuário</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email (@ast7.com.br)</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Função</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="admin">Administrador</SelectItem>
                          <SelectItem value="user">Usuário Comum</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button type="submit">Criar Usuário</Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Função</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ação</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((u) => (
                <TableRow key={u.id}>
                  <TableCell className="font-medium flex items-center gap-2">
                    <img src={u.avatar} className="w-8 h-8 rounded-full" />{' '}
                    {u.name}
                  </TableCell>
                  <TableCell>{u.email}</TableCell>
                  <TableCell>
                    {u.role === 'admin' ? 'Administrador' : 'Usuário'}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={u.active ? 'secondary' : 'outline'}
                      className={
                        u.active
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'text-slate-500'
                      }
                    >
                      {u.active ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleUserStatus(u.id)}
                    >
                      {u.active ? 'Desativar' : 'Ativar'}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
