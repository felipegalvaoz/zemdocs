"use client"

import { useState } from 'react'
import { SidebarProvider } from '@/components/ui/sidebar'

interface SidebarWrapperProps {
  children: React.ReactNode
}

export function SidebarWrapper({ children }: SidebarWrapperProps) {
  // Ler estado do cookie na inicialização (seguindo a abordagem da documentação shadcn/ui)
  const [sidebarState] = useState(() => {
    if (typeof window !== 'undefined') {
      const state = document.cookie
        .split('; ')
        .find(row => row.startsWith('sidebar_state='))
        ?.split('=')[1]

      // Padrão é fechado (false), só abre se cookie for explicitamente "true"
      return state === "true"
    }
    return false // Padrão fechado
  })

  return (
    <SidebarProvider defaultOpen={sidebarState}>
      {children}
    </SidebarProvider>
  )
}
