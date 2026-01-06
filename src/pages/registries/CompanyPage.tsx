import useMainStore from '@/stores/useMainStore'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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

const companySchema = z.object({
  name: z.string().min(2),
  cnpj: z.string().min(14),
  address: z.string().min(5),
  phone: z.string().min(8),
  email: z.string().email(),
  logoUrl: z.string().optional(),
})

export default function CompanyPage() {
  const { companyInfo, updateCompanyInfo } = useMainStore()
  const { toast } = useToast()

  const form = useForm<z.infer<typeof companySchema>>({
    resolver: zodResolver(companySchema),
    defaultValues: companyInfo,
  })

  const onSubmit = (data: z.infer<typeof companySchema>) => {
    updateCompanyInfo(data)
    toast({ title: 'Dados atualizados' })
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-slate-900">Dados da Empresa</h1>
      <Card>
        <CardHeader>
          <CardTitle>Informações Gerais</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4 max-w-2xl"
            >
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Razão Social</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="cnpj"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CNPJ</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Telefone</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Endereço</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="logoUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL do Logo</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <div className="flex items-center gap-4 mt-4 p-4 border rounded">
                <span>Preview Logo:</span>
                <img
                  src={form.watch('logoUrl')}
                  alt="Logo Preview"
                  className="h-12 object-contain"
                />
              </div>

              <Button type="submit" className="bg-indigo-600">
                Salvar Alterações
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
