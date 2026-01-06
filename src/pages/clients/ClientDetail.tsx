import { useParams, Link } from 'react-router-dom'
import { useState } from 'react'
import useMainStore from '@/stores/useMainStore'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Plus, Package } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useToast } from '@/hooks/use-toast'
import { format } from 'date-fns'

export default function ClientDetail() {
  const { id } = useParams()
  const {
    clients,
    softwares,
    occurrences,
    financials,
    addSoftwareToClient,
    updateClient,
  } = useMainStore()
  const { toast } = useToast()

  const client = clients.find((c) => c.id === id)
  const clientOccurrences = occurrences.filter((o) => o.clientId === id)
  const clientFinancials = financials.filter((f) => f.clientId === id)

  const [isSoftwareDialogOpen, setIsSoftwareDialogOpen] = useState(false)
  const [selectedSoftware, setSelectedSoftware] = useState('')
  const [selectedType, setSelectedType] = useState<
    'Unitary' | 'Network' | 'Cloud'
  >('Unitary')
  const [price, setPrice] = useState(0)

  if (!client) return <div className="p-8">Cliente não encontrado</div>

  const handleSoftwareSelect = (val: string) => {
    setSelectedSoftware(val)
    const soft = softwares.find((s) => s.id === val)
    if (soft) {
      if (selectedType === 'Unitary') setPrice(soft.priceUnitary)
      if (selectedType === 'Network') setPrice(soft.priceNetwork)
      if (selectedType === 'Cloud') setPrice(soft.priceCloud)
    }
  }

  const handleTypeSelect = (val: 'Unitary' | 'Network' | 'Cloud') => {
    setSelectedType(val)
    const soft = softwares.find((s) => s.id === selectedSoftware)
    if (soft) {
      if (val === 'Unitary') setPrice(soft.priceUnitary)
      if (val === 'Network') setPrice(soft.priceNetwork)
      if (val === 'Cloud') setPrice(soft.priceCloud)
    }
  }

  const handleAddSoftware = () => {
    const soft = softwares.find((s) => s.id === selectedSoftware)
    if (soft) {
      addSoftwareToClient(client.id, {
        softwareId: soft.id,
        softwareName: soft.name,
        type: selectedType,
        acquisitionDate: new Date().toISOString(),
        price: price,
      })
      toast({
        title: 'Sucesso',
        description: 'Licença adicionada e lançamento financeiro criado.',
      })
      setIsSoftwareDialogOpen(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/clients">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-slate-900">{client.name}</h1>
          <p className="text-muted-foreground">
            {client.contactName} - {client.email}
          </p>
        </div>
        <div className="ml-auto flex gap-2">
          <Badge className={client.active ? 'bg-emerald-500' : 'bg-slate-500'}>
            {client.active ? 'Ativo' : 'Inativo'}
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={() => updateClient(client.id, { active: !client.active })}
          >
            {client.active ? 'Desativar' : 'Ativar'}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="software" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="software">Softwares e Licenças</TabsTrigger>
          <TabsTrigger value="occurrences">Ocorrências</TabsTrigger>
          <TabsTrigger value="financial">Histórico Financeiro</TabsTrigger>
        </TabsList>

        <TabsContent value="software" className="mt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Softwares Contratados</CardTitle>
              <Dialog
                open={isSoftwareDialogOpen}
                onOpenChange={setIsSoftwareDialogOpen}
              >
                <DialogTrigger asChild>
                  <Button className="bg-indigo-600">
                    <Plus className="mr-2 h-4 w-4" /> Adicionar Software
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Adicionar Licença</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label>Software</Label>
                      <Select onValueChange={handleSoftwareSelect}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione..." />
                        </SelectTrigger>
                        <SelectContent>
                          {softwares.map((s) => (
                            <SelectItem key={s.id} value={s.id}>
                              {s.name} v{s.version}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label>Tipo de Licença</Label>
                      <Select
                        value={selectedType}
                        onValueChange={(v: any) => handleTypeSelect(v)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Unitary">Unitária</SelectItem>
                          <SelectItem value="Network">Rede</SelectItem>
                          <SelectItem value="Cloud">Cloud</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label>Preço (R$)</Label>
                      <Input
                        type="number"
                        value={price}
                        onChange={(e) => setPrice(Number(e.target.value))}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      onClick={handleAddSoftware}
                      className="bg-indigo-600"
                    >
                      Salvar e Gerar Cobrança
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Software</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Data Aquisição</TableHead>
                    <TableHead>Valor</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {client.softwareLicenses.map((license) => (
                    <TableRow key={license.id}>
                      <TableCell className="font-medium flex items-center gap-2">
                        <Package className="h-4 w-4 text-indigo-500" />{' '}
                        {license.softwareName}
                      </TableCell>
                      <TableCell>{license.type}</TableCell>
                      <TableCell>
                        {format(
                          new Date(license.acquisitionDate),
                          'dd/MM/yyyy',
                        )}
                      </TableCell>
                      <TableCell>R$ {license.price.toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                  {client.softwareLicenses.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        className="text-center h-24 text-muted-foreground"
                      >
                        Nenhuma licença encontrada.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="occurrences" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Ocorrências</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Título</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Abertura</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {clientOccurrences.map((occ) => (
                    <TableRow key={occ.id}>
                      <TableCell className="font-mono">#{occ.id}</TableCell>
                      <TableCell>{occ.title}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            occ.status === 'resolvida'
                              ? 'secondary'
                              : 'destructive'
                          }
                          className={
                            occ.status === 'resolvida'
                              ? 'bg-emerald-100 text-emerald-800'
                              : ''
                          }
                        >
                          {occ.status.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {format(new Date(occ.openingDate), 'dd/MM/yyyy')}
                      </TableCell>
                    </TableRow>
                  ))}
                  {clientOccurrences.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        className="text-center h-24 text-muted-foreground"
                      >
                        Nenhuma ocorrência registrada.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="financial" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Lançamentos Financeiros</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Valor</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {clientFinancials.map((fin) => (
                    <TableRow key={fin.id}>
                      <TableCell>
                        {format(new Date(fin.date), 'dd/MM/yyyy')}
                      </TableCell>
                      <TableCell>{fin.description}</TableCell>
                      <TableCell>{fin.category}</TableCell>
                      <TableCell className="text-emerald-600 font-semibold">
                        + R$ {fin.value.toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))}
                  {clientFinancials.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        className="text-center h-24 text-muted-foreground"
                      >
                        Nenhum registro financeiro.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
