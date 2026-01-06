import { useState } from 'react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import useMainStore from '@/stores/useMainStore'
import { BarChart, Bar, LineChart, Line, XAxis, CartesianGrid } from 'recharts'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { format, subMonths, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Link } from 'react-router-dom'
import { Plus, Users, Ticket, DollarSign } from 'lucide-react'

export default function Index() {
  const { clients, financials, occurrences } = useMainStore()
  const [period, setPeriod] = useState<string>(format(new Date(), 'yyyy-MM'))

  // KPIs
  const totalRevenue = financials
    .filter((f) => f.type === 'receita' && f.date.startsWith(period))
    .reduce((acc, curr) => acc + curr.value, 0)

  const newClients = clients.filter((c) =>
    c.createdAt.startsWith(period),
  ).length

  const openOccurrences = occurrences.filter(
    (o) => o.status === 'aberta' || o.status === 'em_andamento',
  ).length

  // Charts Data
  // 1. Sales by Software (Updated to ignore returned licenses)
  const salesBySoftwareData: Record<string, number> = {}
  clients.forEach((c) => {
    c.softwareLicenses.forEach((l) => {
      // Only count if acquired in period and NOT returned
      if (l.acquisitionDate.startsWith(period) && !l.returned) {
        salesBySoftwareData[l.softwareName] =
          (salesBySoftwareData[l.softwareName] || 0) + 1
      }
    })
  })
  const barChartData = Object.entries(salesBySoftwareData).map(
    ([name, value]) => ({ name, value }),
  )
  if (barChartData.length === 0) {
    barChartData.push(
      { name: 'AST7 ERP', value: 0 },
      { name: 'AST7 CRM', value: 0 },
    )
  }

  // 2. Revenue vs Expenses (Last 6 months)
  const lineChartData = []
  for (let i = 5; i >= 0; i--) {
    const d = subMonths(new Date(), i)
    const monthStr = format(d, 'yyyy-MM')
    const monthLabel = format(d, 'MMM', { locale: ptBR })

    const revenue = financials
      .filter((f) => f.type === 'receita' && f.date.startsWith(monthStr))
      .reduce((acc, curr) => acc + curr.value, 0)

    const expense = financials
      .filter((f) => f.type === 'despesa' && f.date.startsWith(monthStr))
      .reduce((acc, curr) => acc + curr.value, 0)

    lineChartData.push({
      month: monthLabel,
      receita: revenue,
      despesa: expense,
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          Dashboard
        </h1>
        <div className="flex items-center gap-2">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-[180px] bg-white">
              <SelectValue placeholder="Selecione o período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2023-01">Janeiro 2023</SelectItem>
              <SelectItem value="2023-06">Junho 2023</SelectItem>
              <SelectItem value="2023-11">Novembro 2023</SelectItem>
              <SelectItem value="2023-12">Dezembro 2023</SelectItem>
              <SelectItem value={format(new Date(), 'yyyy-MM')}>
                Mês Atual
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-white shadow-sm border-l-4 border-l-emerald-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Receita Mensal
            </CardTitle>
            <DollarSign className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R${' '}
              {totalRevenue.toLocaleString('pt-BR', {
                minimumFractionDigits: 2,
              })}
            </div>
            <p className="text-xs text-muted-foreground">
              no período selecionado
            </p>
          </CardContent>
        </Card>
        <Card className="bg-white shadow-sm border-l-4 border-l-indigo-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Novos Clientes
            </CardTitle>
            <Users className="h-4 w-4 text-indigo-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{newClients}</div>
            <p className="text-xs text-muted-foreground">
              +20% em relação ao mês anterior
            </p>
          </CardContent>
        </Card>
        <Card className="bg-white shadow-sm border-l-4 border-l-rose-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Ocorrências Abertas
            </CardTitle>
            <Ticket className="h-4 w-4 text-rose-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{openOccurrences}</div>
            <p className="text-xs text-muted-foreground">Necessitam atenção</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Sales by Software Chart */}
        <Card className="col-span-4 bg-white shadow-sm">
          <CardHeader>
            <CardTitle>Vendas por Software</CardTitle>
            <CardDescription>
              Quantidade de licenças vendidas no período
            </CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <ChartContainer
              config={{
                sales: { label: 'Vendas', color: 'hsl(var(--chart-1))' },
              }}
              className="h-[300px] w-full"
            >
              <BarChart data={barChartData}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis
                  dataKey="name"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent indicator="dashed" />}
                />
                <Bar dataKey="value" fill="var(--color-sales)" radius={4} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Revenue vs Expenses Chart */}
        <Card className="col-span-3 bg-white shadow-sm">
          <CardHeader>
            <CardTitle>Financeiro</CardTitle>
            <CardDescription>
              Receita vs Despesas (Últimos 6 meses)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                receita: { label: 'Receita', color: 'hsl(var(--chart-2))' },
                despesa: { label: 'Despesa', color: 'hsl(var(--destructive))' },
              }}
              className="h-[300px] w-full"
            >
              <LineChart data={lineChartData}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent />}
                />
                <ChartLegend content={<ChartLegendContent />} />
                <Line
                  type="monotone"
                  dataKey="receita"
                  stroke="var(--color-receita)"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="despesa"
                  stroke="var(--color-despesa)"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Button className="w-full bg-indigo-600 hover:bg-indigo-700" asChild>
          <Link to="/clients">
            <Plus className="mr-2 h-4 w-4" /> Novo Cliente
          </Link>
        </Button>
        <Button className="w-full bg-slate-800 hover:bg-slate-900" asChild>
          <Link to="/occurrences">
            <Plus className="mr-2 h-4 w-4" /> Nova Ocorrência
          </Link>
        </Button>
        <Button className="w-full bg-emerald-600 hover:bg-emerald-700" asChild>
          <Link to="/financial">
            <Plus className="mr-2 h-4 w-4" /> Novo Lançamento
          </Link>
        </Button>
      </div>
    </div>
  )
}
