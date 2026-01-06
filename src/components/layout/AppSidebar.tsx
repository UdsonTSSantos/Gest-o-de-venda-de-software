import { Link, useLocation } from 'react-router-dom'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from '@/components/ui/sidebar'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import {
  Home,
  Users,
  Ticket,
  DollarSign,
  Briefcase,
  Package,
  Building,
  Shield,
  ChevronRight,
  LogOut,
  Tag,
  Truck,
} from 'lucide-react'
import useMainStore from '@/stores/useMainStore'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'

export function AppSidebar() {
  const { pathname } = useLocation()
  const { companyInfo, currentUser, logout } = useMainStore()

  const isActive = (path: string) =>
    pathname === path || pathname.startsWith(path + '/')

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link to="/">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-indigo-600 text-sidebar-primary-foreground">
                  <Building className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">
                    {companyInfo.name}
                  </span>
                  <span className="truncate text-xs">Gestão Empresarial</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={pathname === '/'}
                tooltip="Dashboard"
              >
                <Link to="/">
                  <Home />
                  <span>Dashboard</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>

            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={isActive('/clients')}
                tooltip="Clientes"
              >
                <Link to="/clients">
                  <Users />
                  <span>Clientes</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>

            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={isActive('/occurrences')}
                tooltip="Ocorrências"
              >
                <Link to="/occurrences">
                  <Ticket />
                  <span>Ocorrências</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>

            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={isActive('/financial')}
                tooltip="Financeiro"
              >
                <Link to="/financial">
                  <DollarSign />
                  <span>Financeiro</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>

            <Collapsible
              asChild
              defaultOpen={isActive('/registries')}
              className="group/collapsible"
            >
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton tooltip="Cadastros">
                    <Briefcase />
                    <span>Cadastros</span>
                    <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarMenuSub>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton
                        asChild
                        isActive={isActive('/registries/softwares')}
                      >
                        <Link to="/registries/softwares">
                          <Package className="mr-2 h-4 w-4" />
                          <span>Softwares</span>
                        </Link>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton
                        asChild
                        isActive={isActive('/registries/services')}
                      >
                        <Link to="/registries/services">
                          <Briefcase className="mr-2 h-4 w-4" />
                          <span>Serviços</span>
                        </Link>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton
                        asChild
                        isActive={isActive('/registries/expense-categories')}
                      >
                        <Link to="/registries/expense-categories">
                          <Tag className="mr-2 h-4 w-4" />
                          <span>Categorias de Despesa</span>
                        </Link>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton
                        asChild
                        isActive={isActive('/registries/suppliers')}
                      >
                        <Link to="/registries/suppliers">
                          <Truck className="mr-2 h-4 w-4" />
                          <span>Fornecedores</span>
                        </Link>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton
                        asChild
                        isActive={isActive('/registries/company')}
                      >
                        <Link to="/registries/company">
                          <Building className="mr-2 h-4 w-4" />
                          <span>Empresa</span>
                        </Link>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>

            {currentUser?.role === 'admin' && (
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={isActive('/users')}
                  tooltip="Usuários"
                >
                  <Link to="/users">
                    <Shield />
                    <span>Usuários</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="flex items-center gap-3 p-2 rounded-md bg-sidebar-accent/50 mb-2 overflow-hidden">
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage
                  src={currentUser?.avatar}
                  alt={currentUser?.name}
                />
                <AvatarFallback className="rounded-lg">CN</AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">
                  {currentUser?.name}
                </span>
                <span className="truncate text-xs">{currentUser?.email}</span>
              </div>
            </div>
            <Button
              variant="ghost"
              className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              onClick={logout}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sair
            </Button>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
