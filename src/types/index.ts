export interface User {
  id: string
  name: string
  email: string
  role: 'admin' | 'user'
  active: boolean
  avatar?: string
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
  createdAt: string
}

export interface Software {
  id: string
  name: string
  version: string
  priceUnitary: number
  priceNetwork: number
  priceCloud: number
}

export interface ClientSoftwareLicense {
  id: string
  softwareId: string
  softwareName: string
  type: 'Unitary' | 'Network' | 'Cloud'
  acquisitionDate: string
  price: number
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

export interface FinancialEntry {
  id: string
  type: 'receita' | 'despesa'
  description: string
  category: string
  value: number
  date: string
  clientId?: string // Optional, linked to client
  clientName?: string
}

export interface CompanyInfo {
  name: string
  cnpj: string
  address: string
  phone: string
  email: string
  logoUrl?: string
}
