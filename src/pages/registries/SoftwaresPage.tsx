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
import { Plus } from 'lucide-react'

const softwareSchema = z.object({
  name: z.string().min(2),
  version: z.string().min(1),
  priceUnitary: z.coerce.number().min(0),
  priceNetwork: z.coerce.number().min(0),
  priceCloud: z.coerce.number().min(0),
})

export default function SoftwaresPage() {
  const { softwares, addSoftware } = useMainStore()
  const { toast } = useToast()
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const form = useForm<z.infer<typeof softwareSchema>>({
    resolver: zodResolver(softwareSchema),
    defaultValues: {
      name: '',
      version: '',
      priceUnitary: 0,
      priceNetwork: 0,
      priceCloud: 0,
    },
  })

  const onSubmit = (data: z.infer<typeof softwareSchema>) => {
    addSoftware(data)
    toast({ title: 'Software adicionado' })
    setIsDialogOpen(false)
    form.reset()
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-slate-900">Softwares</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-indigo-600">
              <Plus className="mr-2 h-4 w-4" /> Novo Software
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Cadastrar Software</DialogTitle>
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
                <DialogFooter>
                  <Button type="submit">Salvar</Button>
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
                <TableHead>Versão</TableHead>
                <TableHead>Unitário</TableHead>
                <TableHead>Rede</TableHead>
                <TableHead>Cloud</TableHead>
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
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
