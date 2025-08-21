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
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { SidebarWrapper } from "@/components/sidebar-wrapper"
import { DocumentStatsCard } from "@/components/dashboard/document-stats-card"
import { RevenueCard } from "@/components/dashboard/revenue-card"
import { MonthlyGrowthCard } from "@/components/dashboard/monthly-growth-card"
import { DocumentChart } from "@/components/dashboard/document-chart"
import { RecentDocumentsList } from "@/components/dashboard/recent-documents-list"

export default function Page() {
  return (
    <SidebarWrapper>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="#">
                    Building Your Application
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Data Fetching</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <div className="grid auto-rows-min gap-4 md:grid-cols-3">
            <DocumentStatsCard />
            <RevenueCard />
            <MonthlyGrowthCard />
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <DocumentChart />
            <RecentDocumentsList />
          </div>
        </div>
      </SidebarInset>
    </SidebarWrapper>
  )
}
