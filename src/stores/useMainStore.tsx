import React, { createContext, useContext, useState } from 'react'
import {
  Client,
  CompanyInfo,
  FinancialEntry,
  Occurrence,
  Service,
  Software,
  User,
  ClientSoftwareLicense,
  ExpenseCategory,
  Supplier,
  MonthlyFee,
} from '@/types'

interface MainState {
  currentUser: User | null
  users: User[]
  clients: Client[]
  occurrences: Occurrence[]
  financials: FinancialEntry[]
  softwares: Software[]
  services: Service[]
  companyInfo: CompanyInfo
  expenseCategories: ExpenseCategory[]
  suppliers: Supplier[]
}

interface MainActions {
  login: (email: string) => void
  logout: () => void
  addClient: (
    client: Omit<
      Client,
      'id' | 'createdAt' | 'softwareLicenses' | 'monthlyFees'
    >,
  ) => void
  updateClient: (id: string, data: Partial<Client>) => void
  addSoftwareToClient: (
    clientId: string,
    license: Omit<ClientSoftwareLicense, 'id'>,
  ) => void
  updateClientSoftwareLicense: (
    clientId: string,
    licenseId: string,
    data: Partial<ClientSoftwareLicense>,
  ) => void
  addMonthlyFeeToClient: (clientId: string, fee: Omit<MonthlyFee, 'id'>) => void
  updateMonthlyFee: (
    clientId: string,
    feeId: string,
    data: Partial<MonthlyFee>,
  ) => void
  deleteMonthlyFee: (clientId: string, feeId: string) => void
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
  updateUser: (id: string, data: Partial<User>) => void
  deleteUser: (id: string) => void
  toggleUserStatus: (id: string) => void
  addExpenseCategory: (category: Omit<ExpenseCategory, 'id'>) => void
  updateExpenseCategory: (id: string, data: Partial<ExpenseCategory>) => void
  deleteExpenseCategory: (id: string) => void
  addSupplier: (supplier: Omit<Supplier, 'id'>) => void
  updateSupplier: (id: string, data: Partial<Supplier>) => void
  deleteSupplier: (id: string) => void
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
    updatePrice: 300,
    cloudUpdatePrice: 500,
  },
  {
    id: '2',
    name: 'AST7 CRM',
    version: '1.5',
    priceUnitary: 800,
    priceNetwork: 1600,
    priceCloud: 2500,
    updatePrice: 150,
    cloudUpdatePrice: 250,
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
    monthlyFees: [
      {
        id: 'mf1',
        description: 'Manutenção Mensal ERP',
        value: 300,
        dueDay: 10,
        active: true,
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
    monthlyFees: [],
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
    deadline: new Date(Date.now() - 86400000).toISOString(),
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
    paymentMethod: 'Nubank Jurídica',
  },
]

const MOCK_EXPENSE_CATEGORIES: ExpenseCategory[] = [
  { id: '1', name: 'Infraestrutura' },
  { id: '2', name: 'Pessoal' },
  { id: '3', name: 'Material de Escritório' },
]

const MOCK_SUPPLIERS: Supplier[] = [
  {
    id: '1',
    name: 'AWS Services',
    contact: 'Suporte',
    phone: '',
    email: 'support@aws.com',
  },
  {
    id: '2',
    name: 'Papelaria Central',
    contact: 'João',
    phone: '(11) 3333-2222',
    email: 'joao@papelaria.com',
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
  const [expenseCategories, setExpenseCategories] = useState<ExpenseCategory[]>(
    MOCK_EXPENSE_CATEGORIES,
  )
  const [suppliers, setSuppliers] = useState<Supplier[]>(MOCK_SUPPLIERS)

  const login = (email: string) => {
    const user = users.find((u) => u.email === email && u.active)
    if (user) setCurrentUser(user)
  }

  const logout = () => setCurrentUser(null)

  const addClient = (
    data: Omit<Client, 'id' | 'createdAt' | 'softwareLicenses' | 'monthlyFees'>,
  ) => {
    const newClient: Client = {
      ...data,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString(),
      softwareLicenses: [],
      monthlyFees: [],
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
    setClients((prev) =>
      prev.map((c) =>
        c.id === clientId
          ? { ...c, softwareLicenses: [...c.softwareLicenses, newLicense] }
          : c,
      ),
    )
    const client = clients.find((c) => c.id === clientId)
    const entry: FinancialEntry = {
      id: Math.random().toString(36).substr(2, 9),
      type: 'receita',
      description: `Aquisição de Licença: ${license.softwareName} (${license.type})`,
      category: 'Venda Software',
      value: license.price,
      date: new Date().toISOString(),
      clientId: clientId,
      clientName: client?.name,
    }
    setFinancials((prev) => [entry, ...prev])
  }

  const updateClientSoftwareLicense = (
    clientId: string,
    licenseId: string,
    data: Partial<ClientSoftwareLicense>,
  ) => {
    setClients((prev) =>
      prev.map((c) => {
        if (c.id === clientId) {
          return {
            ...c,
            softwareLicenses: c.softwareLicenses.map((l) =>
              l.id === licenseId ? { ...l, ...data } : l,
            ),
          }
        }
        return c
      }),
    )
  }

  const addMonthlyFeeToClient = (
    clientId: string,
    fee: Omit<MonthlyFee, 'id'>,
  ) => {
    const newFee = { ...fee, id: Math.random().toString(36).substr(2, 9) }
    setClients((prev) =>
      prev.map((c) =>
        c.id === clientId
          ? { ...c, monthlyFees: [...c.monthlyFees, newFee] }
          : c,
      ),
    )
  }

  const updateMonthlyFee = (
    clientId: string,
    feeId: string,
    data: Partial<MonthlyFee>,
  ) => {
    setClients((prev) =>
      prev.map((c) => {
        if (c.id === clientId) {
          return {
            ...c,
            monthlyFees: c.monthlyFees.map((f) =>
              f.id === feeId ? { ...f, ...data } : f,
            ),
          }
        }
        return c
      }),
    )
  }

  const deleteMonthlyFee = (clientId: string, feeId: string) => {
    setClients((prev) =>
      prev.map((c) => {
        if (c.id === clientId) {
          return {
            ...c,
            monthlyFees: c.monthlyFees.filter((f) => f.id !== feeId),
          }
        }
        return c
      }),
    )
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
    setUsers((prev) => [
      ...prev,
      { ...data, id: Math.random().toString(36).substr(2, 9) },
    ])
  }

  const updateUser = (id: string, data: Partial<User>) => {
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, ...data } : u)))
  }

  const deleteUser = (id: string) => {
    setUsers((prev) => prev.filter((u) => u.id !== id))
  }

  const toggleUserStatus = (id: string) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, active: !u.active } : u)),
    )
  }

  const addExpenseCategory = (category: Omit<ExpenseCategory, 'id'>) => {
    setExpenseCategories((prev) => [
      ...prev,
      { ...category, id: Math.random().toString(36).substr(2, 9) },
    ])
  }
  const updateExpenseCategory = (
    id: string,
    data: Partial<ExpenseCategory>,
  ) => {
    setExpenseCategories((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...data } : c)),
    )
  }
  const deleteExpenseCategory = (id: string) => {
    setExpenseCategories((prev) => prev.filter((c) => c.id !== id))
  }

  const addSupplier = (supplier: Omit<Supplier, 'id'>) => {
    setSuppliers((prev) => [
      ...prev,
      { ...supplier, id: Math.random().toString(36).substr(2, 9) },
    ])
  }
  const updateSupplier = (id: string, data: Partial<Supplier>) => {
    setSuppliers((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...data } : s)),
    )
  }
  const deleteSupplier = (id: string) => {
    setSuppliers((prev) => prev.filter((s) => s.id !== id))
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
        expenseCategories,
        suppliers,
        login,
        logout,
        addClient,
        updateClient,
        addSoftwareToClient,
        updateClientSoftwareLicense,
        addMonthlyFeeToClient,
        updateMonthlyFee,
        deleteMonthlyFee,
        addOccurrence,
        updateOccurrence,
        addFinancialEntry,
        addSoftware,
        updateSoftware,
        addService,
        updateService,
        updateCompanyInfo,
        addUser,
        updateUser,
        deleteUser,
        toggleUserStatus,
        addExpenseCategory,
        updateExpenseCategory,
        deleteExpenseCategory,
        addSupplier,
        updateSupplier,
        deleteSupplier,
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
