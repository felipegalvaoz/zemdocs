"use client"

import * as React from "react"
import {
  LayoutDashboard,
  FileText,
  Building2,
  Users,
  Settings,
  Receipt,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavProjects } from "@/components/nav-projects"
import { NavUser } from "@/components/nav-user"
import { TeamSwitcher } from "@/components/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"

// Sistema ZemDocs - Documentos Fiscais
const data = {
  user: {
    name: "Administrador",
    email: "admin@zemdocs.com",
    avatar: "",
  },
  teams: [
    {
      name: "ZemDocs",
      logo: Receipt,
      plan: "Sistema de Documentos Fiscais",
    },
  ],
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      title: "Documentos",
      url: "/documents",
      icon: FileText,
    },
    {
      title: "Empresas",
      url: "/empresas",
      icon: Building2,
    },
    {
      title: "Usuários",
      url: "/usuarios",
      icon: Users,
    },
    {
      title: "Configurações",
      url: "/configuracoes",
      icon: Settings,
    },
  ],
  projects: [],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavProjects projects={data.projects} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
