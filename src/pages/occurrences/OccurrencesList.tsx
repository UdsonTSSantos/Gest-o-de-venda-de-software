import { useState } from 'react'
import useMainStore from '@/stores/useMainStore'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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
import { format, isBefore, parseISO } from 'date-fns'
import { Plus, Filter } from 'lucide-react'

const occurrenceSchema = z.object({
  clientId: z.string().min(1, 'Selecione um cliente'),
  solicitor: z.string().min(2, 'Solicitante obrigatório'),
  title: z.string().min(5, 'Título muito curto'),
  description: z.string().min(10, 'Descrição detalhada necessária'),
  deadline: z.string().min(1, 'Prazo obrigatório'),
})

export default function OccurrencesList() {
  const { occurrences, clients, addOccurrence, updateOccurrence } =
    useMainStore()
  const { toast } = useToast()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [statusFilter, setStatusFilter] = useState<string>('all')

  const form = useForm<z.infer<typeof occurrenceSchema>>({
    resolver: zodResolver(occurrenceSchema),
    defaultValues: {
      clientId: '',
      solicitor: '',
      title: '',
      description: '',
      deadline: '',
    },
  })

  const onSubmit = (data: z.infer<typeof occurrenceSchema>) => {
    const client = clients.find((c) => c.id === data.clientId)
    if (client) {
      addOccurrence({ ...data, clientName: client.name })
      toast({
        title: 'Ocorrência Aberta',
        description: `Ticket criado para ${client.name}`,
      })
      setIsDialogOpen(false)
      form.reset()
    }
  }

  const handleStatusChange = (id: string, newStatus: any) => {
    updateOccurrence(id, { status: newStatus })
    toast({
      title: 'Status Atualizado',
      description: `Ocorrência #${id} movida para ${newStatus}`,
    })
  }

  const filteredOccurrences = occurrences.filter((occ) => {
    if (statusFilter !== 'all' && occ.status !== statusFilter) return false
    return true
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h1 className="text-3xl font-bold text-slate-900">Ocorrências</h1>

        <div className="flex gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px] bg-white">
              <SelectValue placeholder="Filtrar Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="aberta">Aberta</SelectItem>
              <SelectItem value="em_andamento">Em Andamento</SelectItem>
              <SelectItem value="aguardando_cliente">
                Aguardando Cliente
              </SelectItem>
              <SelectItem value="resolvida">Resolvida</SelectItem>
            </SelectContent>
          </Select>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-rose-600 hover:bg-rose-700">
                <Plus className="mr-2 h-4 w-4" /> Nova Ocorrência
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Abrir Chamado</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-4"
                >
                  <FormField
                    control={form.control}
                    name="clientId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cliente</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione..." />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {clients.map((c) => (
                              <SelectItem key={c.id} value={c.id}>
                                {c.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="solicitor"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Solicitante</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Título</FormLabel>
                        <FormControl>
                          <Input {...field} />
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
                        <FormLabel>Descrição</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="deadline"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Prazo</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <DialogFooter>
                    <Button type="submit" className="bg-rose-600">
                      Abrir Ticket
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tickets Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">ID</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Título</TableHead>
                <TableHead>Prazo</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ação</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOccurrences.map((occ) => {
                const isLate =
                  occ.status !== 'resolvida' &&
                  isBefore(parseISO(occ.deadline), new Date())
                return (
                  <TableRow key={occ.id}>
                    <TableCell className="font-mono">#{occ.id}</TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">{occ.clientName}</span>
                        <span className="text-xs text-muted-foreground">
                          {occ.solicitor}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>{occ.title}</TableCell>
                    <TableCell
                      className={isLate ? 'text-rose-600 font-bold' : ''}
                    >
                      {format(parseISO(occ.deadline), 'dd/MM/yyyy')}
                      {isLate && (
                        <span className="ml-2 text-xs bg-rose-100 px-1 rounded">
                          Atrasado
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={
                          occ.status === 'resolvida'
                            ? 'bg-emerald-100 text-emerald-800'
                            : occ.status === 'em_andamento'
                              ? 'bg-amber-100 text-amber-800'
                              : occ.status === 'aberta'
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-slate-100'
                        }
                      >
                        {occ.status.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Select
                        defaultValue={occ.status}
                        onValueChange={(val) => handleStatusChange(occ.id, val)}
                      >
                        <SelectTrigger className="h-8 w-[130px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="aberta">Aberta</SelectItem>
                          <SelectItem value="em_andamento">
                            Em Andamento
                          </SelectItem>
                          <SelectItem value="aguardando_cliente">
                            Aguardando
                          </SelectItem>
                          <SelectItem value="resolvida">Resolvida</SelectItem>
                          <SelectItem value="cancelada">Cancelada</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
