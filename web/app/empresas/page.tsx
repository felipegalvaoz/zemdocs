import { AppSidebar } from "@/components/app-sidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"
import { EmpresasAdvancedTable } from "@/components/empresas"
import { EmpresasStats } from "@/components/empresas/empresas-stats"

export default function EmpresasPage() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="overflow-hidden">
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="/dashboard">
                    Dashboard
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Empresas</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0 min-w-0">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">Empresas</h2>
              <p className="text-muted-foreground">
                Gerencie as empresas cadastradas no sistema
              </p>
            </div>
            <Link href="/empresas/nova">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Nova Empresa
              </Button>
            </Link>
          </div>
          <div className="grid auto-rows-min gap-4 md:grid-cols-4">
            <EmpresasStats />
          </div>
          <div className="min-h-[100vh] flex-1 rounded-xl md:min-h-min">
            <EmpresasAdvancedTable />
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
