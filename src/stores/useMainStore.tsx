import React, { createContext, useContext, useEffect, useState } from 'react'
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
import { supabase } from '@/lib/supabase/client'

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
  isLoading: boolean
}

interface MainActions {
  login: (email: string, password?: string) => Promise<void>
  logout: () => Promise<void>
  addClient: (
    client: Omit<
      Client,
      'id' | 'createdAt' | 'softwareLicenses' | 'monthlyFees'
    >,
  ) => Promise<void>
  updateClient: (id: string, data: Partial<Client>) => Promise<void>
  addSoftwareToClient: (
    clientId: string,
    license: Omit<ClientSoftwareLicense, 'id'>,
  ) => Promise<void>
  updateClientSoftwareLicense: (
    clientId: string,
    licenseId: string,
    data: Partial<ClientSoftwareLicense>,
  ) => Promise<void>
  deleteClientSoftwareLicense: (
    clientId: string,
    licenseId: string,
  ) => Promise<void>
  addMonthlyFeeToClient: (
    clientId: string,
    fee: Omit<MonthlyFee, 'id'>,
  ) => Promise<void>
  updateMonthlyFee: (
    clientId: string,
    feeId: string,
    data: Partial<MonthlyFee>,
  ) => Promise<void>
  deleteMonthlyFee: (clientId: string, feeId: string) => Promise<void>
  addOccurrence: (
    occurrence: Omit<Occurrence, 'id' | 'openingDate' | 'status'>,
  ) => Promise<void>
  updateOccurrence: (id: string, data: Partial<Occurrence>) => Promise<void>
  deleteOccurrence: (id: string) => Promise<void>
  addFinancialEntry: (entry: Omit<FinancialEntry, 'id'>) => Promise<void>
  updateFinancialEntry: (
    id: string,
    data: Partial<FinancialEntry>,
  ) => Promise<void>
  deleteFinancialEntry: (id: string) => Promise<void>
  addSoftware: (software: Omit<Software, 'id'>) => Promise<void>
  updateSoftware: (id: string, data: Partial<Software>) => Promise<void>
  addService: (service: Omit<Service, 'id'>) => Promise<void>
  updateService: (id: string, data: Partial<Service>) => Promise<void>
  deleteService: (id: string) => Promise<void>
  updateCompanyInfo: (info: CompanyInfo) => Promise<void>
  addUser: (user: Omit<User, 'id'>) => Promise<void>
  updateUser: (id: string, data: Partial<User>) => Promise<void>
  deleteUser: (id: string) => Promise<void>
  toggleUserStatus: (id: string) => Promise<void>
  addExpenseCategory: (category: Omit<ExpenseCategory, 'id'>) => Promise<void>
  updateExpenseCategory: (
    id: string,
    data: Partial<ExpenseCategory>,
  ) => Promise<void>
  deleteExpenseCategory: (id: string) => Promise<void>
  addSupplier: (supplier: Omit<Supplier, 'id'>) => Promise<void>
  updateSupplier: (id: string, data: Partial<Supplier>) => Promise<void>
  deleteSupplier: (id: string) => Promise<void>
}

const MainContext = createContext<(MainState & MainActions) | null>(null)

export const MainProvider = ({ children }: { children: React.ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [users, setUsers] = useState<User[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [occurrences, setOccurrences] = useState<Occurrence[]>([])
  const [financials, setFinancials] = useState<FinancialEntry[]>([])
  const [softwares, setSoftwares] = useState<Software[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo>({
    name: 'AST7 Gestão',
    cnpj: '',
    address: '',
    phone: '',
    email: '',
  })
  const [expenseCategories, setExpenseCategories] = useState<ExpenseCategory[]>(
    [],
  )
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Fetch all data
  const fetchData = async () => {
    setIsLoading(true)
    try {
      const [
        { data: clientsData },
        { data: licensesData },
        { data: feesData },
        { data: usersData },
        { data: occurrencesData },
        { data: financialsData },
        { data: softwaresData },
        { data: servicesData },
        { data: companyData },
        { data: expensesData },
        { data: suppliersData },
      ] = await Promise.all([
        supabase.from('clients').select('*'),
        supabase.from('client_software_licenses').select('*'),
        supabase.from('client_monthly_fees').select('*'),
        supabase.from('profiles').select('*'), // Changed from users to profiles
        supabase.from('occurrences').select('*'),
        supabase.from('financial_entries').select('*'),
        supabase.from('softwares').select('*'),
        supabase.from('services').select('*'),
        supabase.from('company_info').select('*').single(),
        supabase.from('expense_categories').select('*'),
        supabase.from('suppliers').select('*'),
      ])

      // Map Clients with sub-tables
      const mappedClients = (clientsData || []).map((c: any) => ({
        id: c.id,
        name: c.name,
        cnpj: c.cnpj,
        contactName: c.contact_name,
        email: c.email,
        whatsapp: c.whatsapp,
        active: c.active,
        address: c.address,
        createdAt: c.created_at,
        softwareLicenses: (licensesData || [])
          .filter((l: any) => l.client_id === c.id)
          .map((l: any) => ({
            id: l.id,
            softwareId: l.software_id,
            softwareName: l.software_name,
            type: l.type,
            acquisitionDate: l.acquisition_date,
            price: l.price,
            returned: l.returned,
          })),
        monthlyFees: (feesData || [])
          .filter((f: any) => f.client_id === c.id)
          .map((f: any) => ({
            id: f.id,
            description: f.description,
            value: f.value,
            dueDate: f.due_date,
            active: f.active,
          })),
      }))
      setClients(mappedClients)

      // Map other tables
      if (usersData) setUsers(usersData)
      if (occurrencesData) {
        setOccurrences(
          occurrencesData.map((o: any) => ({
            id: o.id,
            clientId: o.client_id,
            clientName: o.client_name,
            solicitor: o.solicitor,
            title: o.title,
            description: o.description,
            status: o.status,
            openingDate: o.opening_date,
            deadline: o.deadline,
            closingDate: o.closing_date,
            closedBy: o.closed_by,
          })),
        )
      }
      if (financialsData) {
        setFinancials(
          financialsData.map((f: any) => ({
            id: f.id,
            type: f.type,
            description: f.description,
            category: f.category,
            value: f.value,
            date: f.date,
            dueDate: f.due_date,
            clientId: f.client_id,
            clientName: f.client_name,
            supplierId: f.supplier_id,
            supplierName: f.supplier_name,
            paymentMethod: f.payment_method,
            observation: f.observation,
            licenseId: f.license_id,
          })),
        )
      }
      if (softwaresData) {
        setSoftwares(
          softwaresData.map((s: any) => ({
            id: s.id,
            name: s.name,
            version: s.version,
            priceUnitary: s.price_unitary,
            priceNetwork: s.price_network,
            priceCloud: s.price_cloud,
            updatePrice: s.update_price,
            cloudUpdatePrice: s.cloud_update_price,
            monthlyFee: s.monthly_fee,
          })),
        )
      }
      if (servicesData) {
        setServices(
          servicesData.map((s: any) => ({
            id: s.id,
            name: s.name,
            description: s.description,
            priceClient: s.price_client,
            priceNonClient: s.price_non_client,
          })),
        )
      }
      if (companyData) {
        setCompanyInfo({
          id: companyData.id,
          name: companyData.name,
          cnpj: companyData.cnpj,
          address: companyData.address,
          phone: companyData.phone,
          email: companyData.email,
          logoUrl: companyData.logo_url,
        })
      }
      if (expensesData) setExpenseCategories(expensesData)
      if (suppliersData) setSuppliers(suppliersData)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Auth Listener
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        if (!session.user.email?.endsWith('@ast7.com.br')) {
          supabase.auth.signOut()
          alert('Acesso restrito a @ast7.com.br')
          return
        }
        const isAdmin = session.user.email === 'suporte@ast7.com.br'
        setCurrentUser({
          id: session.user.id,
          name: session.user.user_metadata?.name || 'Usuário',
          email: session.user.email,
          role: isAdmin ? 'admin' : 'user',
          active: true,
        })
        fetchData()
      }
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        if (!session.user.email?.endsWith('@ast7.com.br')) {
          supabase.auth.signOut()
          return
        }
        const isAdmin = session.user.email === 'suporte@ast7.com.br'
        setCurrentUser({
          id: session.user.id,
          name: session.user.user_metadata?.name || 'Usuário',
          email: session.user.email!,
          role: isAdmin ? 'admin' : 'user',
          active: true,
        })
        fetchData()
      } else {
        setCurrentUser(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const login = async (email: string, password?: string) => {
    if (!password) throw new Error('Password required')
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) throw error
  }

  const logout = async () => {
    await supabase.auth.signOut()
    setCurrentUser(null)
  }

  // --- CRUD Operations ---

  const addClient = async (
    data: Omit<Client, 'id' | 'createdAt' | 'softwareLicenses' | 'monthlyFees'>,
  ) => {
    const payload = {
      name: data.name,
      cnpj: data.cnpj,
      contact_name: data.contactName,
      email: data.email,
      whatsapp: data.whatsapp,
      address: data.address,
      active: data.active,
    }
    const { error } = await supabase.from('clients').insert(payload)
    if (error) throw error
    await fetchData()
  }

  const updateClient = async (id: string, data: Partial<Client>) => {
    const payload: any = {}
    if (data.name) payload.name = data.name
    if (data.cnpj) payload.cnpj = data.cnpj
    if (data.contactName) payload.contact_name = data.contactName
    if (data.email) payload.email = data.email
    if (data.whatsapp) payload.whatsapp = data.whatsapp
    if (data.address) payload.address = data.address
    if (data.active !== undefined) payload.active = data.active

    const { error } = await supabase
      .from('clients')
      .update(payload)
      .eq('id', id)
    if (error) throw error
    await fetchData()
  }

  const addSoftwareToClient = async (
    clientId: string,
    license: Omit<ClientSoftwareLicense, 'id'>,
  ) => {
    // 1. Add License
    const licensePayload = {
      client_id: clientId,
      software_id: license.softwareId,
      software_name: license.softwareName,
      type: license.type,
      acquisition_date: license.acquisitionDate,
      price: license.price,
      returned: false,
    }
    const { data: licenseData, error: lError } = await supabase
      .from('client_software_licenses')
      .insert(licensePayload)
      .select()
      .single()

    if (lError) throw lError

    // 2. Add Revenue
    const client = clients.find((c) => c.id === clientId)
    const financialPayload = {
      type: 'receita',
      description: `Aquisição de Licença: ${license.softwareName} (${license.type})`,
      category: 'Venda Software',
      value: license.price,
      date: new Date().toISOString(),
      client_id: clientId,
      client_name: client?.name,
      license_id: licenseData.id,
    }
    const { error: fError } = await supabase
      .from('financial_entries')
      .insert(financialPayload)

    if (fError) throw fError
    await fetchData()
  }

  const updateClientSoftwareLicense = async (
    clientId: string,
    licenseId: string,
    data: Partial<ClientSoftwareLicense>,
  ) => {
    const payload: any = {}
    if (data.softwareId) payload.software_id = data.softwareId
    if (data.softwareName) payload.software_name = data.softwareName
    if (data.type) payload.type = data.type
    if (data.price) payload.price = data.price
    if (data.returned !== undefined) payload.returned = data.returned

    const { error } = await supabase
      .from('client_software_licenses')
      .update(payload)
      .eq('id', licenseId)

    if (error) throw error

    // If returned, remove associated revenue
    if (data.returned === true) {
      await supabase
        .from('financial_entries')
        .delete()
        .eq('license_id', licenseId)
    }

    await fetchData()
  }

  const deleteClientSoftwareLicense = async (
    clientId: string,
    licenseId: string,
  ) => {
    const { error } = await supabase
      .from('client_software_licenses')
      .delete()
      .eq('id', licenseId)
    if (error) throw error
    // Also remove financial
    await supabase
      .from('financial_entries')
      .delete()
      .eq('license_id', licenseId)
    await fetchData()
  }

  const addMonthlyFeeToClient = async (
    clientId: string,
    fee: Omit<MonthlyFee, 'id'>,
  ) => {
    const payload = {
      client_id: clientId,
      description: fee.description,
      value: fee.value,
      due_date: fee.dueDate,
      active: fee.active,
    }
    const { error } = await supabase.from('client_monthly_fees').insert(payload)
    if (error) throw error
    await fetchData()
  }

  const updateMonthlyFee = async (
    clientId: string,
    feeId: string,
    data: Partial<MonthlyFee>,
  ) => {
    const payload: any = {}
    if (data.description) payload.description = data.description
    if (data.value) payload.value = data.value
    if (data.dueDate) payload.due_date = data.dueDate
    if (data.active !== undefined) payload.active = data.active

    const { error } = await supabase
      .from('client_monthly_fees')
      .update(payload)
      .eq('id', feeId)
    if (error) throw error
    await fetchData()
  }

  const deleteMonthlyFee = async (clientId: string, feeId: string) => {
    const { error } = await supabase
      .from('client_monthly_fees')
      .delete()
      .eq('id', feeId)
    if (error) throw error
    await fetchData()
  }

  const addOccurrence = async (
    data: Omit<Occurrence, 'id' | 'openingDate' | 'status'>,
  ) => {
    const payload = {
      client_id: data.clientId,
      client_name: data.clientName,
      solicitor: data.solicitor,
      title: data.title,
      description: data.description,
      status: 'aberta',
      opening_date: new Date().toISOString(),
      deadline: data.deadline,
    }
    const { error } = await supabase.from('occurrences').insert(payload)
    if (error) throw error
    await fetchData()
  }

  const updateOccurrence = async (id: string, data: Partial<Occurrence>) => {
    const payload: any = {}
    if (data.title) payload.title = data.title
    if (data.description) payload.description = data.description
    if (data.status) payload.status = data.status
    if (data.deadline) payload.deadline = data.deadline
    if (data.status === 'resolvida') {
      payload.closing_date = new Date().toISOString()
      payload.closed_by = currentUser?.id
    }

    const { error } = await supabase
      .from('occurrences')
      .update(payload)
      .eq('id', id)
    if (error) throw error
    await fetchData()
  }

  const deleteOccurrence = async (id: string) => {
    const { error } = await supabase.from('occurrences').delete().eq('id', id)
    if (error) throw error
    await fetchData()
  }

  const addFinancialEntry = async (entry: Omit<FinancialEntry, 'id'>) => {
    const payload = {
      type: entry.type,
      description: entry.description,
      category: entry.category,
      value: entry.value,
      date: entry.date,
      due_date: entry.dueDate,
      client_id: entry.clientId,
      client_name: entry.clientName,
      supplier_id: entry.supplierId,
      supplier_name: entry.supplierName,
      payment_method: entry.paymentMethod,
      observation: entry.observation,
      license_id: entry.licenseId,
    }
    const { error } = await supabase.from('financial_entries').insert(payload)
    if (error) throw error
    await fetchData()
  }

  const updateFinancialEntry = async (
    id: string,
    data: Partial<FinancialEntry>,
  ) => {
    const payload: any = {}
    if (data.description) payload.description = data.description
    if (data.category) payload.category = data.category
    if (data.value) payload.value = data.value
    if (data.date) payload.date = data.date
    if (data.dueDate) payload.due_date = data.dueDate
    if (data.paymentMethod) payload.payment_method = data.paymentMethod
    if (data.observation) payload.observation = data.observation
    if (data.supplierName) payload.supplier_name = data.supplierName
    if (data.supplierId) payload.supplier_id = data.supplierId

    const { error } = await supabase
      .from('financial_entries')
      .update(payload)
      .eq('id', id)
    if (error) throw error
    await fetchData()
  }

  const deleteFinancialEntry = async (id: string) => {
    const { error } = await supabase
      .from('financial_entries')
      .delete()
      .eq('id', id)
    if (error) throw error
    await fetchData()
  }

  const addSoftware = async (data: Omit<Software, 'id'>) => {
    const payload = {
      name: data.name,
      version: data.version,
      price_unitary: data.priceUnitary,
      price_network: data.priceNetwork,
      price_cloud: data.priceCloud,
      update_price: data.updatePrice,
      cloud_update_price: data.cloudUpdatePrice,
      monthly_fee: data.monthlyFee,
    }
    const { error } = await supabase.from('softwares').insert(payload)
    if (error) throw error
    await fetchData()
  }

  const updateSoftware = async (id: string, data: Partial<Software>) => {
    const payload: any = {}
    if (data.name) payload.name = data.name
    if (data.version) payload.version = data.version
    if (data.priceUnitary !== undefined)
      payload.price_unitary = data.priceUnitary
    if (data.priceNetwork !== undefined)
      payload.price_network = data.priceNetwork
    if (data.priceCloud !== undefined) payload.price_cloud = data.priceCloud
    if (data.updatePrice !== undefined) payload.update_price = data.updatePrice
    if (data.cloudUpdatePrice !== undefined)
      payload.cloud_update_price = data.cloudUpdatePrice
    if (data.monthlyFee !== undefined) payload.monthly_fee = data.monthlyFee

    const { error } = await supabase
      .from('softwares')
      .update(payload)
      .eq('id', id)
    if (error) throw error
    await fetchData()
  }

  const addService = async (data: Omit<Service, 'id'>) => {
    const payload = {
      name: data.name,
      description: data.description,
      price_client: data.priceClient,
      price_non_client: data.priceNonClient,
    }
    const { error } = await supabase.from('services').insert(payload)
    if (error) throw error
    await fetchData()
  }

  const updateService = async (id: string, data: Partial<Service>) => {
    const payload: any = {}
    if (data.name) payload.name = data.name
    if (data.description) payload.description = data.description
    if (data.priceClient !== undefined) payload.price_client = data.priceClient
    if (data.priceNonClient !== undefined)
      payload.price_non_client = data.priceNonClient
    const { error } = await supabase
      .from('services')
      .update(payload)
      .eq('id', id)
    if (error) throw error
    await fetchData()
  }

  const deleteService = async (id: string) => {
    const { error } = await supabase.from('services').delete().eq('id', id)
    if (error) throw error
    await fetchData()
  }

  const updateCompanyInfo = async (info: CompanyInfo) => {
    const payload = {
      name: info.name,
      cnpj: info.cnpj,
      address: info.address,
      phone: info.phone,
      email: info.email,
      logo_url: info.logoUrl,
    }
    // Assume only 1 row
    const { error } = await supabase
      .from('company_info')
      .update(payload)
      .eq('id', info.id)
    if (error) throw error
    await fetchData()
  }

  const addUser = async (data: Omit<User, 'id'>) => {
    // Note: Creating user in Supabase auth usually requires backend logic or service key to skip email confirmation if wanted,
    // or just standard signUp. For now, assuming just inserting into 'profiles' table which is a public profile table linked to auth.
    // Real auth user creation happens via Login page signUp or Admin function if allowed.
    // For this scope, we update the `profiles` table. The Auth part is handled by `supabase.auth.signUp`.
    // Since we can't create Auth User from client side without logging out current user (or using Edge Function), we just manage metadata here.
    const { error } = await supabase.from('profiles').insert(data)
    if (error) throw error
    await fetchData()
  }

  const updateUser = async (id: string, data: Partial<User>) => {
    const { error } = await supabase.from('profiles').update(data).eq('id', id)
    if (error) throw error
    await fetchData()
  }

  const deleteUser = async (id: string) => {
    const { error } = await supabase.from('profiles').delete().eq('id', id)
    if (error) throw error
    await fetchData()
  }

  const toggleUserStatus = async (id: string) => {
    const user = users.find((u) => u.id === id)
    if (user) {
      const { error } = await supabase
        .from('profiles')
        .update({ active: !user.active })
        .eq('id', id)
      if (error) throw error
      await fetchData()
    }
  }

  const addExpenseCategory = async (category: Omit<ExpenseCategory, 'id'>) => {
    const { error } = await supabase
      .from('expense_categories')
      .insert({ name: category.name })
    if (error) throw error
    await fetchData()
  }
  const updateExpenseCategory = async (
    id: string,
    data: Partial<ExpenseCategory>,
  ) => {
    const { error } = await supabase
      .from('expense_categories')
      .update(data)
      .eq('id', id)
    if (error) throw error
    await fetchData()
  }
  const deleteExpenseCategory = async (id: string) => {
    const { error } = await supabase
      .from('expense_categories')
      .delete()
      .eq('id', id)
    if (error) throw error
    await fetchData()
  }

  const addSupplier = async (supplier: Omit<Supplier, 'id'>) => {
    const { error } = await supabase.from('suppliers').insert(supplier)
    if (error) throw error
    await fetchData()
  }
  const updateSupplier = async (id: string, data: Partial<Supplier>) => {
    const { error } = await supabase.from('suppliers').update(data).eq('id', id)
    if (error) throw error
    await fetchData()
  }
  const deleteSupplier = async (id: string) => {
    const { error } = await supabase.from('suppliers').delete().eq('id', id)
    if (error) throw error
    await fetchData()
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
        isLoading,
        login,
        logout,
        addClient,
        updateClient,
        addSoftwareToClient,
        updateClientSoftwareLicense,
        deleteClientSoftwareLicense,
        addMonthlyFeeToClient,
        updateMonthlyFee,
        deleteMonthlyFee,
        addOccurrence,
        updateOccurrence,
        deleteOccurrence,
        addFinancialEntry,
        updateFinancialEntry,
        deleteFinancialEntry,
        addSoftware,
        updateSoftware,
        addService,
        updateService,
        deleteService,
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
