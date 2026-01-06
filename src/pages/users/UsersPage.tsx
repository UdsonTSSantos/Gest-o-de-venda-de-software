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
import { Plus, Edit } from 'lucide-react'
import { User } from '@/types'

const userSchema = z.object({
  name: z.string().min(2),
  email: z
    .string()
    .email()
    .endsWith('@ast7.com.br', 'Email deve ser @ast7.com.br'),
  role: z.enum(['admin', 'user']),
})

export default function UsersPage() {
  const { users, addUser, updateUser, deleteUser, toggleUserStatus } =
    useMainStore()
  const { toast } = useToast()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)

  const form = useForm<z.infer<typeof userSchema>>({
    resolver: zodResolver(userSchema),
    defaultValues: { name: '', email: '', role: 'user' },
  })

  const openNew = () => {
    setEditingUser(null)
    form.reset({ name: '', email: '', role: 'user' })
    setIsDialogOpen(true)
  }

  const openEdit = (user: User) => {
    setEditingUser(user)
    form.reset({ name: user.name, email: user.email, role: user.role })
    setIsDialogOpen(true)
  }

  const onSubmit = (data: z.infer<typeof userSchema>) => {
    if (editingUser) {
      updateUser(editingUser.id, data)
      toast({ title: 'Usuário atualizado' })
    } else {
      addUser({
        ...data,
        active: true,
      })
      toast({ title: 'Usuário criado' })
    }
    setIsDialogOpen(false)
  }

  const handleDelete = (id: string) => {
    const userToDelete = users.find((u) => u.id === id)
    const adminCount = users.filter((u) => u.role === 'admin').length

    if (userToDelete?.role === 'admin' && adminCount <= 1) {
      toast({
        title: 'Erro',
        description: 'Não é possível excluir o único administrador.',
        variant: 'destructive',
      })
      return
    }

    if (confirm('Tem certeza que deseja excluir este usuário?')) {
      deleteUser(id)
      toast({ title: 'Usuário excluído' })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-slate-900">
          Usuários do Sistema
        </h1>
        <Button onClick={openNew} className="bg-indigo-600">
          <Plus className="mr-2 h-4 w-4" /> Novo Usuário
        </Button>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingUser ? 'Editar Usuário' : 'Adicionar Usuário'}
            </DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
              <DialogFooter className="flex justify-between items-center">
                {editingUser && (
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={() => {
                      setIsDialogOpen(false)
                      handleDelete(editingUser.id)
                    }}
                  >
                    Excluir
                  </Button>
                )}
                <Button type="submit">Salvar</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

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
                  <TableCell className="font-medium">{u.name}</TableCell>
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
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleUserStatus(u.id)}
                      >
                        {u.active ? 'Desativar' : 'Ativar'}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEdit(u)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
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
