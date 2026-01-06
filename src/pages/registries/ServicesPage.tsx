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
} from '@/components/ui/form'
import { useToast } from '@/hooks/use-toast'
import { Plus, Edit } from 'lucide-react'
import { Service } from '@/types'

const serviceSchema = z.object({
  name: z.string().min(2),
  description: z.string().min(2),
  priceClient: z.coerce.number().min(0),
  priceNonClient: z.coerce.number().min(0),
})

export default function ServicesPage() {
  const { services, addService, updateService } = useMainStore()
  const { toast } = useToast()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingService, setEditingService] = useState<Service | null>(null)

  const form = useForm<z.infer<typeof serviceSchema>>({
    resolver: zodResolver(serviceSchema),
    defaultValues: {
      name: '',
      description: '',
      priceClient: 0,
      priceNonClient: 0,
    },
  })

  const openNew = () => {
    setEditingService(null)
    form.reset({
      name: '',
      description: '',
      priceClient: 0,
      priceNonClient: 0,
    })
    setIsDialogOpen(true)
  }

  const openEdit = (service: Service) => {
    setEditingService(service)
    form.reset({
      name: service.name,
      description: service.description,
      priceClient: service.priceClient,
      priceNonClient: service.priceNonClient,
    })
    setIsDialogOpen(true)
  }

  const onSubmit = (data: z.infer<typeof serviceSchema>) => {
    if (editingService) {
      updateService(editingService.id, data)
      toast({ title: 'Serviço atualizado' })
    } else {
      addService(data)
      toast({ title: 'Serviço adicionado' })
    }
    setIsDialogOpen(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-slate-900">Serviços</h1>
        <Button onClick={openNew} className="bg-indigo-600">
          <Plus className="mr-2 h-4 w-4" /> Novo Serviço
        </Button>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingService ? 'Editar Serviço' : 'Cadastrar Serviço'}
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
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descrição</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="priceClient"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Preço Cliente</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="priceNonClient"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Preço Não-Cliente</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
              <DialogFooter>
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
                <TableHead>Descrição</TableHead>
                <TableHead>Preço Cliente</TableHead>
                <TableHead>Preço Não-Cliente</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {services.map((s) => (
                <TableRow key={s.id}>
                  <TableCell>{s.name}</TableCell>
                  <TableCell>{s.description}</TableCell>
                  <TableCell>R$ {s.priceClient}</TableCell>
                  <TableCell>R$ {s.priceNonClient}</TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openEdit(s)}
                    >
                      <Edit className="h-4 w-4" />
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
