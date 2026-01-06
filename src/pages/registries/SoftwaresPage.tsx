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
import { Software } from '@/types'

const softwareSchema = z.object({
  name: z.string().min(2),
  version: z.string().min(1),
  priceUnitary: z.coerce.number().min(0),
  priceNetwork: z.coerce.number().min(0),
  priceCloud: z.coerce.number().min(0),
  updatePrice: z.coerce.number().min(0),
  cloudUpdatePrice: z.coerce.number().min(0),
  monthlyFee: z.coerce.number().min(0),
})

export default function SoftwaresPage() {
  const { softwares, addSoftware, updateSoftware } = useMainStore()
  const { toast } = useToast()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingSoftware, setEditingSoftware] = useState<Software | null>(null)

  const form = useForm<z.infer<typeof softwareSchema>>({
    resolver: zodResolver(softwareSchema),
    defaultValues: {
      name: '',
      version: '',
      priceUnitary: 0,
      priceNetwork: 0,
      priceCloud: 0,
      updatePrice: 0,
      cloudUpdatePrice: 0,
      monthlyFee: 0,
    },
  })

  const openNew = () => {
    setEditingSoftware(null)
    form.reset({
      name: '',
      version: '',
      priceUnitary: 0,
      priceNetwork: 0,
      priceCloud: 0,
      updatePrice: 0,
      cloudUpdatePrice: 0,
      monthlyFee: 0,
    })
    setIsDialogOpen(true)
  }

  const openEdit = (software: Software) => {
    setEditingSoftware(software)
    form.reset({
      name: software.name,
      version: software.version,
      priceUnitary: software.priceUnitary,
      priceNetwork: software.priceNetwork,
      priceCloud: software.priceCloud,
      updatePrice: software.updatePrice,
      cloudUpdatePrice: software.cloudUpdatePrice,
      monthlyFee: software.monthlyFee || 0,
    })
    setIsDialogOpen(true)
  }

  const onSubmit = async (data: z.infer<typeof softwareSchema>) => {
    if (editingSoftware) {
      await updateSoftware(editingSoftware.id, data)
      toast({ title: 'Software atualizado' })
    } else {
      await addSoftware(data)
      toast({ title: 'Software adicionado' })
    }
    setIsDialogOpen(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-slate-900">Softwares</h1>
        <Button onClick={openNew} className="bg-indigo-600">
          <Plus className="mr-2 h-4 w-4" /> Novo Software
        </Button>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingSoftware ? 'Editar Software' : 'Cadastrar Software'}
            </DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
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
                  name="version"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Versão</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-3 gap-2">
                <FormField
                  control={form.control}
                  name="priceUnitary"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Unitário (R$)</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="priceNetwork"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Rede (R$)</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="priceCloud"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cloud (R$)</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-3 gap-2">
                <FormField
                  control={form.control}
                  name="updatePrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Valor Atualização (R$)</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="cloudUpdatePrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Atualização Cloud (R$)</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="monthlyFee"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mensalidade Base (R$)</FormLabel>
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
                <TableHead>Versão</TableHead>
                <TableHead>Unitário</TableHead>
                <TableHead>Rede</TableHead>
                <TableHead>Cloud</TableHead>
                <TableHead>Atualização</TableHead>
                <TableHead>Att. Cloud</TableHead>
                <TableHead>Mensalidade</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {softwares.map((s) => (
                <TableRow key={s.id}>
                  <TableCell>{s.name}</TableCell>
                  <TableCell>{s.version}</TableCell>
                  <TableCell>R$ {s.priceUnitary}</TableCell>
                  <TableCell>R$ {s.priceNetwork}</TableCell>
                  <TableCell>R$ {s.priceCloud}</TableCell>
                  <TableCell>R$ {s.updatePrice}</TableCell>
                  <TableCell>R$ {s.cloudUpdatePrice}</TableCell>
                  <TableCell>R$ {s.monthlyFee || 0}</TableCell>
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
