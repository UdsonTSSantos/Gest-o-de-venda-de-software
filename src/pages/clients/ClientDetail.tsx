import { useParams, Link } from 'react-router-dom'
import { useState } from 'react'
import useMainStore from '@/stores/useMainStore'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Plus, Package, Edit, Trash, Calendar } from 'lucide-react'
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
import { Switch } from '@/components/ui/switch'
import { ClientSoftwareLicense, MonthlyFee } from '@/types'

export default function ClientDetail() {
  const { id } = useParams()
  const {
    clients,
    softwares,
    occurrences,
    financials,
    addSoftwareToClient,
    updateClient,
    updateClientSoftwareLicense,
    addMonthlyFeeToClient,
    updateMonthlyFee,
    deleteMonthlyFee,
  } = useMainStore()
  const { toast } = useToast()

  const client = clients.find((c) => c.id === id)
  const clientOccurrences = occurrences.filter((o) => o.clientId === id)
  const clientFinancials = financials.filter((f) => f.clientId === id)

  // Software Dialog State
  const [isSoftwareDialogOpen, setIsSoftwareDialogOpen] = useState(false)
  const [editingLicense, setEditingLicense] =
    useState<ClientSoftwareLicense | null>(null)
  const [selectedSoftware, setSelectedSoftware] = useState('')
  const [selectedType, setSelectedType] = useState<
    'Unitary' | 'Network' | 'Cloud' | 'Web'
  >('Unitary')
  const [price, setPrice] = useState(0)

  // Monthly Fee Dialog State
  const [isFeeDialogOpen, setIsFeeDialogOpen] = useState(false)
  const [editingFee, setEditingFee] = useState<MonthlyFee | null>(null)
  const [feeDescription, setFeeDescription] = useState('')
  const [feeValue, setFeeValue] = useState(0)
  const [feeDueDay, setFeeDueDay] = useState(10)
  const [feeActive, setFeeActive] = useState(true)

  if (!client) return <div className="p-8">Cliente não encontrado</div>

  // --- Software Logic ---
  const openNewSoftware = () => {
    setEditingLicense(null)
    setSelectedSoftware('')
    setSelectedType('Unitary')
    setPrice(0)
    setIsSoftwareDialogOpen(true)
  }

  const openEditSoftware = (license: ClientSoftwareLicense) => {
    setEditingLicense(license)
    setSelectedSoftware(license.softwareId)
    setSelectedType(license.type)
    setPrice(license.price)
    setIsSoftwareDialogOpen(true)
  }

  const handleSoftwareSelect = (val: string) => {
    setSelectedSoftware(val)
    const soft = softwares.find((s) => s.id === val)
    if (soft) {
      if (selectedType === 'Unitary') setPrice(soft.priceUnitary)
      if (selectedType === 'Network') setPrice(soft.priceNetwork)
      if (selectedType === 'Cloud') setPrice(soft.priceCloud)
    }
  }

  const handleTypeSelect = (val: 'Unitary' | 'Network' | 'Cloud' | 'Web') => {
    setSelectedType(val)
    const soft = softwares.find((s) => s.id === selectedSoftware)
    if (soft) {
      if (val === 'Unitary') setPrice(soft.priceUnitary)
      else if (val === 'Network') setPrice(soft.priceNetwork)
      else if (val === 'Cloud') setPrice(soft.priceCloud)
      // Web might not have a preset price, keep as is
    }
  }

  const handleSaveSoftware = () => {
    const soft = softwares.find((s) => s.id === selectedSoftware)
    if (soft) {
      if (editingLicense) {
        updateClientSoftwareLicense(client.id, editingLicense.id, {
          softwareId: soft.id,
          softwareName: soft.name,
          type: selectedType,
          price: price,
        })
        toast({ title: 'Licença atualizada' })
      } else {
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
      }
      setIsSoftwareDialogOpen(false)
    }
  }

  // --- Monthly Fee Logic ---
  const openNewFee = () => {
    setEditingFee(null)
    setFeeDescription('')
    setFeeValue(0)
    setFeeDueDay(10)
    setFeeActive(true)
    setIsFeeDialogOpen(true)
  }

  const openEditFee = (fee: MonthlyFee) => {
    setEditingFee(fee)
    setFeeDescription(fee.description)
    setFeeValue(fee.value)
    setFeeDueDay(fee.dueDay)
    setFeeActive(fee.active)
    setIsFeeDialogOpen(true)
  }

  const handleSaveFee = () => {
    const data = {
      description: feeDescription,
      value: feeValue,
      dueDay: feeDueDay,
      active: feeActive,
    }
    if (editingFee) {
      updateMonthlyFee(client.id, editingFee.id, data)
      toast({ title: 'Mensalidade atualizada' })
    } else {
      addMonthlyFeeToClient(client.id, data)
      toast({ title: 'Mensalidade criada' })
    }
    setIsFeeDialogOpen(false)
  }

  const handleDeleteFee = (feeId: string) => {
    if (confirm('Excluir esta mensalidade?')) {
      deleteMonthlyFee(client.id, feeId)
      toast({ title: 'Mensalidade removida' })
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
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="software">Softwares</TabsTrigger>
          <TabsTrigger value="fees">Mensalidades</TabsTrigger>
          <TabsTrigger value="occurrences">Ocorrências</TabsTrigger>
          <TabsTrigger value="financial">Histórico Financeiro</TabsTrigger>
        </TabsList>

        <TabsContent value="software" className="mt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Softwares Contratados</CardTitle>
              <Button onClick={openNewSoftware} className="bg-indigo-600">
                <Plus className="mr-2 h-4 w-4" /> Adicionar Software
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Software</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Data Aquisição</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
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
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditSoftware(license)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {client.softwareLicenses.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={5}
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

          <Dialog
            open={isSoftwareDialogOpen}
            onOpenChange={setIsSoftwareDialogOpen}
          >
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingLicense ? 'Editar Licença' : 'Adicionar Licença'}
                </DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label>Software</Label>
                  <Select
                    onValueChange={handleSoftwareSelect}
                    value={selectedSoftware}
                  >
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
                  <Label>Categoria</Label>
                  <Select
                    value={selectedType}
                    onValueChange={(v: any) => handleTypeSelect(v)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Unitary">Unitário</SelectItem>
                      <SelectItem value="Network">Rede</SelectItem>
                      <SelectItem value="Cloud">Cloud</SelectItem>
                      <SelectItem value="Web">Web</SelectItem>
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
                <Button onClick={handleSaveSoftware} className="bg-indigo-600">
                  Salvar
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </TabsContent>

        <TabsContent value="fees" className="mt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Mensalidades Recorrentes</CardTitle>
              <Button onClick={openNewFee} className="bg-emerald-600">
                <Plus className="mr-2 h-4 w-4" /> Nova Mensalidade
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Dia Vencimento</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[100px]">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {client.monthlyFees?.map((fee) => (
                    <TableRow key={fee.id}>
                      <TableCell>{fee.description}</TableCell>
                      <TableCell>Dia {fee.dueDay}</TableCell>
                      <TableCell>R$ {fee.value.toFixed(2)}</TableCell>
                      <TableCell>
                        <Badge variant={fee.active ? 'secondary' : 'outline'}>
                          {fee.active ? 'Ativo' : 'Inativo'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEditFee(fee)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteFee(fee.id)}
                          >
                            <Trash className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {(client.monthlyFees?.length || 0) === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="text-center h-24 text-muted-foreground"
                      >
                        Nenhuma mensalidade cadastrada.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Dialog open={isFeeDialogOpen} onOpenChange={setIsFeeDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingFee ? 'Editar Mensalidade' : 'Nova Mensalidade'}
                </DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label>Descrição</Label>
                  <Input
                    value={feeDescription}
                    onChange={(e) => setFeeDescription(e.target.value)}
                    placeholder="Ex: Manutenção Sistema"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Valor (R$)</Label>
                    <Input
                      type="number"
                      value={feeValue}
                      onChange={(e) => setFeeValue(Number(e.target.value))}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Dia Vencimento</Label>
                    <Input
                      type="number"
                      min="1"
                      max="31"
                      value={feeDueDay}
                      onChange={(e) => setFeeDueDay(Number(e.target.value))}
                    />
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="active"
                    checked={feeActive}
                    onCheckedChange={setFeeActive}
                  />
                  <Label htmlFor="active">Ativo</Label>
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleSaveFee} className="bg-emerald-600">
                  Salvar
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
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
