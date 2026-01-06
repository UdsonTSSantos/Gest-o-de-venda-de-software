import { SidebarTrigger } from '@/components/ui/sidebar'
import { Separator } from '@/components/ui/separator'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { useLocation } from 'react-router-dom'
import { Bell, Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import useMainStore from '@/stores/useMainStore'
import { Badge } from '@/components/ui/badge'

export function AppHeader() {
  const location = useLocation()
  const pathSegments = location.pathname.split('/').filter(Boolean)
  const { currentUser, occurrences } = useMainStore()

  // Simple Notification Logic: Count overdue open occurrences
  const today = new Date().toISOString()
  const overdueCount = occurrences.filter(
    (o) =>
      o.status !== 'resolvida' &&
      o.status !== 'cancelada' &&
      o.deadline < today,
  ).length

  return (
    <header className="flex h-16 shrink-0 items-center gap-2 border-b bg-white px-4 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
      <div className="flex items-center gap-2 px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/" className="hidden md:block">
                AST7
              </BreadcrumbLink>
            </BreadcrumbItem>
            {pathSegments.map((segment, index) => (
              <div key={segment} className="flex items-center">
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  {index === pathSegments.length - 1 ? (
                    <BreadcrumbPage className="capitalize">
                      {segment}
                    </BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink
                      href={`/${segment}`}
                      className="capitalize hidden md:block"
                    >
                      {segment}
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
              </div>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <div className="ml-auto flex items-center gap-4">
        <div className="relative hidden md:block w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar..." className="pl-8 h-9" />
        </div>

        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {overdueCount > 0 && (
            <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-600 animate-pulse" />
          )}
        </Button>

        {currentUser?.role === 'admin' && (
          <Badge variant="secondary" className="hidden md:flex">
            Admin
          </Badge>
        )}
      </div>
    </header>
  )
}
