import React, { createContext, useContext, useState, useEffect } from 'react'
import {
  Client,
  CompanyInfo,
  FinancialEntry,
  Occurrence,
  Service,
  Software,
  User,
  ClientSoftwareLicense,
} from '@/types'
import { format } from 'date-fns'

interface MainState {
  currentUser: User | null
  users: User[]
  clients: Client[]
  occurrences: Occurrence[]
  financials: FinancialEntry[]
  softwares: Software[]
  services: Service[]
  companyInfo: CompanyInfo
}

interface MainActions {
  login: (email: string) => void
  logout: () => void
  addClient: (
    client: Omit<Client, 'id' | 'createdAt' | 'softwareLicenses'>,
  ) => void
  updateClient: (id: string, data: Partial<Client>) => void
  addSoftwareToClient: (
    clientId: string,
    license: Omit<ClientSoftwareLicense, 'id'>,
  ) => void
  addOccurrence: (
    occurrence: Omit<Occurrence, 'id' | 'openingDate' | 'status'>,
  ) => void
  updateOccurrence: (id: string, data: Partial<Occurrence>) => void
  addFinancialEntry: (entry: Omit<FinancialEntry, 'id'>) => void
  addSoftware: (software: Omit<Software, 'id'>) => void
  updateSoftware: (id: string, data: Partial<Software>) => void
  addService: (service: Omit<Service, 'id'>) => void
  updateService: (id: string, data: Partial<Service>) => void
  updateCompanyInfo: (info: CompanyInfo) => void
  addUser: (user: Omit<User, 'id'>) => void
  toggleUserStatus: (id: string) => void
}

const MainContext = createContext<(MainState & MainActions) | null>(null)

// Mock Data
const MOCK_USERS: User[] = [
  {
    id: '1',
    name: 'Admin User',
    email: 'suporte@ast7.com.br',
    role: 'admin',
    active: true,
    avatar: 'https://img.usecurling.com/ppl/thumbnail?gender=male&seed=1',
  },
  {
    id: '2',
    name: 'John Doe',
    email: 'john@ast7.com.br',
    role: 'user',
    active: true,
    avatar: 'https://img.usecurling.com/ppl/thumbnail?gender=male&seed=2',
  },
]

const MOCK_SOFTWARES: Software[] = [
  {
    id: '1',
    name: 'AST7 ERP',
    version: '2.0',
    priceUnitary: 1500,
    priceNetwork: 3000,
    priceCloud: 5000,
  },
  {
    id: '2',
    name: 'AST7 CRM',
    version: '1.5',
    priceUnitary: 800,
    priceNetwork: 1600,
    priceCloud: 2500,
  },
]

const MOCK_SERVICES: Service[] = [
  {
    id: '1',
    name: 'Instalação Remota',
    description: 'Instalação via AnyDesk',
    priceClient: 150,
    priceNonClient: 250,
  },
  {
    id: '2',
    name: 'Visita Técnica',
    description: 'Visita presencial (Capital)',
    priceClient: 300,
    priceNonClient: 500,
  },
]

const MOCK_CLIENTS: Client[] = [
  {
    id: '1',
    name: 'Tech Solutions Ltda',
    cnpj: '12.345.678/0001-90',
    contactName: 'Carlos Silva',
    email: 'carlos@techsolutions.com.br',
    whatsapp: '(11) 98765-4321',
    active: true,
    address: 'Av. Paulista, 1000 - SP',
    softwareLicenses: [
      {
        id: 'l1',
        softwareId: '1',
        softwareName: 'AST7 ERP',
        type: 'Network',
        acquisitionDate: '2023-01-15',
        price: 3000,
      },
    ],
    createdAt: '2023-01-10',
  },
  {
    id: '2',
    name: 'Mercado Feliz',
    cnpj: '98.765.432/0001-10',
    contactName: 'Ana Souza',
    email: 'ana@mercadofeliz.com.br',
    whatsapp: '(21) 91234-5678',
    active: true,
    address: 'Rua das Flores, 50 - RJ',
    softwareLicenses: [],
    createdAt: '2023-06-20',
  },
]

const MOCK_OCCURRENCES: Occurrence[] = [
  {
    id: '101',
    clientId: '1',
    clientName: 'Tech Solutions Ltda',
    solicitor: 'Carlos Silva',
    title: 'Erro ao emitir NFe',
    description: 'Sistema trava ao tentar transmitir nota fiscal.',
    status: 'aberta',
    openingDate: new Date().toISOString(),
    deadline: new Date(Date.now() - 86400000).toISOString(), // Yesterday
  },
  {
    id: '102',
    clientId: '2',
    clientName: 'Mercado Feliz',
    solicitor: 'Ana Souza',
    title: 'Dúvida no Relatório',
    description: 'Como exportar o relatório de vendas?',
    status: 'resolvida',
    openingDate: '2023-11-01T10:00:00',
    deadline: '2023-11-02T10:00:00',
    closingDate: '2023-11-01T14:30:00',
    closedBy: '1',
  },
]

const MOCK_FINANCIALS: FinancialEntry[] = [
  {
    id: '1',
    type: 'receita',
    description: 'Licença AST7 ERP',
    category: 'Venda Software',
    value: 3000,
    date: '2023-01-15',
    clientId: '1',
    clientName: 'Tech Solutions Ltda',
  },
  {
    id: '2',
    type: 'receita',
    description: 'Mensalidade Suporte',
    category: 'Mensalidade',
    value: 500,
    date: '2023-11-05',
    clientId: '1',
    clientName: 'Tech Solutions Ltda',
  },
  {
    id: '3',
    type: 'despesa',
    description: 'Servidor AWS',
    category: 'Infraestrutura',
    value: 200,
    date: '2023-11-10',
  },
]

export const MainProvider = ({ children }: { children: React.ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(MOCK_USERS[0])
  const [users, setUsers] = useState<User[]>(MOCK_USERS)
  const [clients, setClients] = useState<Client[]>(MOCK_CLIENTS)
  const [occurrences, setOccurrences] = useState<Occurrence[]>(MOCK_OCCURRENCES)
  const [financials, setFinancials] =
    useState<FinancialEntry[]>(MOCK_FINANCIALS)
  const [softwares, setSoftwares] = useState<Software[]>(MOCK_SOFTWARES)
  const [services, setServices] = useState<Service[]>(MOCK_SERVICES)
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo>({
    name: 'AST7 Gestão',
    cnpj: '00.000.000/0001-00',
    address: 'Rua da Inovação, 777',
    phone: '(11) 3333-7777',
    email: 'contato@ast7.com.br',
    logoUrl: 'https://img.usecurling.com/i?q=AST7&shape=outline&color=blue',
  })

  const login = (email: string) => {
    const user = users.find((u) => u.email === email && u.active)
    if (user) setCurrentUser(user)
  }

  const logout = () => setCurrentUser(null)

  const addClient = (
    data: Omit<Client, 'id' | 'createdAt' | 'softwareLicenses'>,
  ) => {
    const newClient: Client = {
      ...data,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString(),
      softwareLicenses: [],
    }
    setClients((prev) => [newClient, ...prev])
  }

  const updateClient = (id: string, data: Partial<Client>) => {
    setClients((prev) => prev.map((c) => (c.id === id ? { ...c, ...data } : c)))
  }

  const addSoftwareToClient = (
    clientId: string,
    license: Omit<ClientSoftwareLicense, 'id'>,
  ) => {
    const newLicense = {
      ...license,
      id: Math.random().toString(36).substr(2, 9),
    }

    // Add license to client
    setClients((prev) =>
      prev.map((c) =>
        c.id === clientId
          ? { ...c, softwareLicenses: [...c.softwareLicenses, newLicense] }
          : c,
      ),
    )

    // Automatically create financial entry
    const client = clients.find((c) => c.id === clientId)
    const entry: FinancialEntry = {
      id: Math.random().toString(36).substr(2, 9),
      type: 'receita',
      description: `Aquisição de Licença: ${license.softwareName} (${license.type})`,
      category: 'Venda Software',
      value: license.price,
      date: new Date().toISOString(), // Today
      clientId: clientId,
      clientName: client?.name,
    }
    setFinancials((prev) => [entry, ...prev])
  }

  const addOccurrence = (
    data: Omit<Occurrence, 'id' | 'openingDate' | 'status'>,
  ) => {
    const newOcc: Occurrence = {
      ...data,
      id: Math.floor(Math.random() * 10000).toString(),
      openingDate: new Date().toISOString(),
      status: 'aberta',
    }
    setOccurrences((prev) => [newOcc, ...prev])
  }

  const updateOccurrence = (id: string, data: Partial<Occurrence>) => {
    setOccurrences((prev) =>
      prev.map((o) => {
        if (o.id === id) {
          const updated = { ...o, ...data }
          // If status changing to resolved, capture closing date and user
          if (data.status === 'resolvida' && o.status !== 'resolvida') {
            updated.closingDate = new Date().toISOString()
            updated.closedBy = currentUser?.id
          }
          return updated
        }
        return o
      }),
    )
  }

  const addFinancialEntry = (entry: Omit<FinancialEntry, 'id'>) => {
    setFinancials((prev) => [
      { ...entry, id: Math.random().toString(36).substr(2, 9) },
      ...prev,
    ])
  }

  const addSoftware = (data: Omit<Software, 'id'>) => {
    setSoftwares((prev) => [
      ...prev,
      { ...data, id: Math.random().toString(36).substr(2, 9) },
    ])
  }

  const updateSoftware = (id: string, data: Partial<Software>) => {
    setSoftwares((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...data } : s)),
    )
  }

  const addService = (data: Omit<Service, 'id'>) => {
    setServices((prev) => [
      ...prev,
      { ...data, id: Math.random().toString(36).substr(2, 9) },
    ])
  }

  const updateService = (id: string, data: Partial<Service>) => {
    setServices((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...data } : s)),
    )
  }

  const updateCompanyInfo = (info: CompanyInfo) => {
    setCompanyInfo(info)
  }

  const addUser = (data: Omit<User, 'id'>) => {
    if (!data.email.endsWith('@ast7.com.br')) {
      alert('Email deve ser @ast7.com.br') // Simple alert, handled better in UI
      return
    }
    setUsers((prev) => [
      ...prev,
      { ...data, id: Math.random().toString(36).substr(2, 9) },
    ])
  }

  const toggleUserStatus = (id: string) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, active: !u.active } : u)),
    )
  }

  return React.createElement(
    MainContext.Provider,
    {
      value: {
        currentUser,
        users,
        clients,
        occurrences,
        financials,
        softwares,
        services,
        companyInfo,
        login,
        logout,
        addClient,
        updateClient,
        addSoftwareToClient,
        addOccurrence,
        updateOccurrence,
        addFinancialEntry,
        addSoftware,
        updateSoftware,
        addService,
        updateService,
        updateCompanyInfo,
        addUser,
        toggleUserStatus,
      },
    },
    children,
  )
}

export default function useMainStore() {
  const context = useContext(MainContext)
  if (!context) {
    throw new Error('useMainStore must be used within a MainProvider')
  }
  return context
}
