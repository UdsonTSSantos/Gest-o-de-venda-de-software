export interface User {
  id: string
  name: string
  email: string
  role: 'admin' | 'user'
  active: boolean
  avatar?: string // Keeping for type compatibility
}

export interface Client {
  id: string
  name: string
  cnpj: string
  contactName: string
  email: string
  whatsapp: string
  active: boolean
  address: string
  softwareLicenses: ClientSoftwareLicense[]
  monthlyFees: MonthlyFee[]
  createdAt: string
}

export interface Software {
  id: string
  name: string
  version: string
  priceUnitary: number
  priceNetwork: number
  priceCloud: number
  updatePrice: number
  cloudUpdatePrice: number
  monthlyFee: number
}

export interface ClientSoftwareLicense {
  id: string
  clientId?: string
  softwareId: string
  softwareName: string
  type: 'Unitary' | 'Network' | 'Cloud' | 'Web'
  acquisitionDate: string
  price: number
  returned: boolean
}

export interface MonthlyFee {
  id: string
  clientId?: string
  description: string
  value: number
  dueDate: string
  active: boolean
}

export interface Service {
  id: string
  name: string
  description: string
  priceClient: number
  priceNonClient: number
}

export type OccurrenceStatus =
  | 'aberta'
  | 'em_andamento'
  | 'aguardando_cliente'
  | 'resolvida'
  | 'cancelada'

export interface Occurrence {
  id: string
  clientId: string
  clientName: string
  solicitor: string
  title: string
  description: string
  status: OccurrenceStatus
  openingDate: string
  deadline: string
  closingDate?: string
  closedBy?: string
}

export type PaymentMethod =
  | 'Nubank Fisica'
  | 'Nubank Jurídica'
  | 'Caixa'
  | 'Mercado Pago'
  | 'Dinheiro'
  | 'Crédito'

export interface FinancialEntry {
  id: string
  type: 'receita' | 'despesa'
  description: string
  category: string
  value: number
  date: string
  dueDate?: string
  clientId?: string
  clientName?: string
  supplierId?: string
  supplierName?: string
  paymentMethod?: PaymentMethod
  observation?: string
  licenseId?: string
}

export interface CompanyInfo {
  id?: string
  name: string
  cnpj: string
  address: string
  phone: string
  email: string
  logoUrl?: string
}

export interface ExpenseCategory {
  id: string
  name: string
}

export interface Supplier {
  id: string
  name: string
  contact: string
  phone: string
  email: string
}
