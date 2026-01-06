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
import { format, isAfter, parseISO } from 'date-fns'
import { Plus, TrendingUp, TrendingDown, DollarSign } from 'lucide-react'

const financialSchema = z.object({
  type: z.literal('despesa'),
  description: z.string().min(3, 'Descrição obrigatória'),
  category: z.string().min(1, 'Categoria obrigatória'),
  value: z.coerce.number().min(0.01, 'Valor inválido'),
  date: z
    .string()
    .refine(
      (val) => !isAfter(parseISO(val), new Date()),
      'Data não pode ser futura',
    ),
  dueDate: z.string().min(1, 'Data de vencimento obrigatória'),
  supplierId: z.string().min(1, 'Fornecedor obrigatório'),
  paymentMethod: z.enum([
    'Nubank Fisica',
    'Nubank Jurídica',
    'Caixa',
    'Mercado Pago',
    'Dinheiro',
    'Crédito',
  ]),
  observation: z.string().optional(),
})

export default function FinancialList() {
  const { financials, expenseCategories, suppliers, addFinancialEntry } =
    useMainStore()
  const { toast } = useToast()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [filterType, setFilterType] = useState('all')

  const form = useForm<z.infer<typeof financialSchema>>({
    resolver: zodResolver(financialSchema),
    defaultValues: {
      type: 'despesa',
      description: '',
      category: '',
      value: 0,
      date: format(new Date(), 'yyyy-MM-dd'),
      dueDate: '',
      supplierId: '',
      paymentMethod: 'Nubank Jurídica',
      observation: '',
    },
  })

  const onSubmit = (data: z.infer<typeof financialSchema>) => {
    const supplier = suppliers.find((s) => s.id === data.supplierId)
    const categoryName =
      expenseCategories.find((c) => c.id === data.category)?.name ||
      data.category

    addFinancialEntry({
      ...data,
      category: categoryName,
      supplierName: supplier?.name,
    })
    toast({
      title: 'Despesa registrada',
      description: `R$ ${data.value} em ${categoryName}`,
    })
    setIsDialogOpen(false)
    form.reset({
      type: 'despesa',
      description: '',
      category: '',
      value: 0,
      date: format(new Date(), 'yyyy-MM-dd'),
      dueDate: '',
      supplierId: '',
      paymentMethod: 'Nubank Jurídica',
      observation: '',
    })
  }

  const filteredFinancials = financials.filter(
    (f) => filterType === 'all' || f.type === filterType,
  )
  const totalIncome = financials
    .filter((f) => f.type === 'receita')
    .reduce((a, b) => a + b.value, 0)
  const totalExpense = financials
    .filter((f) => f.type === 'despesa')
    .reduce((a, b) => a + b.value, 0)
  const balance = totalIncome - totalExpense

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h1 className="text-3xl font-bold text-slate-900">Financeiro</h1>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-rose-600 hover:bg-rose-700">
              <Plus className="mr-2 h-4 w-4" /> Nova Despesa
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Registrar Despesa</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Descrição</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Ex: Conta de Luz" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="value"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Valor (R$)</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Data Competência</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="dueDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Data Vencimento</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Categoria de Despesa</FormLabel>
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
                            {expenseCategories.map((c) => (
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
                    name="supplierId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Fornecedor</FormLabel>
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
                            {suppliers.map((s) => (
                              <SelectItem key={s.id} value={s.id}>
                                {s.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="paymentMethod"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Instituição de Pagamento</FormLabel>
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
                          <SelectItem value="Nubank Fisica">
                            Nubank Fisica
                          </SelectItem>
                          <SelectItem value="Nubank Jurídica">
                            Nubank Jurídica
                          </SelectItem>
                          <SelectItem value="Caixa">Caixa</SelectItem>
                          <SelectItem value="Mercado Pago">
                            Mercado Pago
                          </SelectItem>
                          <SelectItem value="Dinheiro">Dinheiro</SelectItem>
                          <SelectItem value="Crédito">Crédito</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="observation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Observação (Opcional)</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <DialogFooter>
                  <Button type="submit" className="bg-rose-600">
                    Salvar Despesa
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Receitas</CardTitle>
            <TrendingUp className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">
              R$ {totalIncome.toFixed(2)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Despesas</CardTitle>
            <TrendingDown className="h-4 w-4 text-rose-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-rose-600">
              R$ {totalExpense.toFixed(2)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Saldo Líquido</CardTitle>
            <DollarSign className="h-4 w-4 text-indigo-500" />
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${balance >= 0 ? 'text-indigo-600' : 'text-rose-600'}`}
            >
              R$ {balance.toFixed(2)}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Extrato Detalhado</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Vencimento</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Entidade</TableHead>
                <TableHead>Pgto</TableHead>
                <TableHead>Valor</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredFinancials.map((f) => (
                <TableRow key={f.id}>
                  <TableCell>
                    {format(new Date(f.date), 'dd/MM/yyyy')}
                  </TableCell>
                  <TableCell>
                    {f.dueDate
                      ? format(new Date(f.dueDate), 'dd/MM/yyyy')
                      : '-'}
                  </TableCell>
                  <TableCell>
                    {f.type === 'receita' ? (
                      <TrendingUp className="h-4 w-4 text-emerald-500" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-rose-500" />
                    )}
                  </TableCell>
                  <TableCell>{f.description}</TableCell>
                  <TableCell>{f.category}</TableCell>
                  <TableCell>{f.clientName || f.supplierName || '-'}</TableCell>
                  <TableCell>{f.paymentMethod || '-'}</TableCell>
                  <TableCell
                    className={
                      f.type === 'receita'
                        ? 'text-emerald-600'
                        : 'text-rose-600'
                    }
                  >
                    R$ {f.value.toFixed(2)}
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
