import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import Layout from './components/Layout'
import { MainProvider } from '@/stores/useMainStore'

import Index from './pages/Index'
import NotFound from './pages/NotFound'
import ClientsList from './pages/clients/ClientsList'
import ClientDetail from './pages/clients/ClientDetail'
import OccurrencesList from './pages/occurrences/OccurrencesList'
import FinancialList from './pages/financial/FinancialList'
import SoftwaresPage from './pages/registries/SoftwaresPage'
import ServicesPage from './pages/registries/ServicesPage'
import CompanyPage from './pages/registries/CompanyPage'
import UsersPage from './pages/users/UsersPage'

const App = () => (
  <MainProvider>
    <BrowserRouter
      future={{ v7_startTransition: false, v7_relativeSplatPath: false }}
    >
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Index />} />

            <Route path="/clients" element={<ClientsList />} />
            <Route path="/clients/:id" element={<ClientDetail />} />

            <Route path="/occurrences" element={<OccurrencesList />} />

            <Route path="/financial" element={<FinancialList />} />

            <Route path="/registries/softwares" element={<SoftwaresPage />} />
            <Route path="/registries/services" element={<ServicesPage />} />
            <Route path="/registries/company" element={<CompanyPage />} />

            <Route path="/users" element={<UsersPage />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </TooltipProvider>
    </BrowserRouter>
  </MainProvider>
)

export default App
