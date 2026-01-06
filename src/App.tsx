import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import Layout from './components/Layout'
import { MainProvider } from '@/stores/useMainStore'
import useMainStore from '@/stores/useMainStore'

import Index from './pages/Index'
import NotFound from './pages/NotFound'
import Login from './pages/Login'
import ClientsList from './pages/clients/ClientsList'
import ClientDetail from './pages/clients/ClientDetail'
import OccurrencesList from './pages/occurrences/OccurrencesList'
import FinancialList from './pages/financial/FinancialList'
import SoftwaresPage from './pages/registries/SoftwaresPage'
import ServicesPage from './pages/registries/ServicesPage'
import CompanyPage from './pages/registries/CompanyPage'
import ExpenseCategoriesPage from './pages/registries/ExpenseCategoriesPage'
import SuppliersPage from './pages/registries/SuppliersPage'
import UsersPage from './pages/users/UsersPage'
import { Loader2 } from 'lucide-react'

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { currentUser, isLoading } = useMainStore()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    )
  }

  if (!currentUser) {
    return <Navigate to="/login" />
  }

  return <>{children}</>
}

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<Index />} />

        <Route path="/clients" element={<ClientsList />} />
        <Route path="/clients/:id" element={<ClientDetail />} />

        <Route path="/occurrences" element={<OccurrencesList />} />

        <Route path="/financial" element={<FinancialList />} />

        <Route path="/registries/softwares" element={<SoftwaresPage />} />
        <Route path="/registries/services" element={<ServicesPage />} />
        <Route
          path="/registries/expense-categories"
          element={<ExpenseCategoriesPage />}
        />
        <Route path="/registries/suppliers" element={<SuppliersPage />} />
        <Route path="/registries/company" element={<CompanyPage />} />

        <Route path="/users" element={<UsersPage />} />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

const App = () => (
  <MainProvider>
    <BrowserRouter
      future={{ v7_startTransition: false, v7_relativeSplatPath: false }}
    >
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AppRoutes />
      </TooltipProvider>
    </BrowserRouter>
  </MainProvider>
)

export default App
