"use client"

import { Button } from "@/components/ui/button"
import { Plus, Download, Upload } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function UserActions() {
  const handleNewUser = () => {
    // TODO: Implementar criação de novo usuário
    console.log("Criar novo usuário")
  }

  const handleExport = () => {
    // TODO: Implementar exportação de usuários
    console.log("Exportar usuários")
  }

  const handleImport = () => {
    // TODO: Implementar importação de usuários
    console.log("Importar usuários")
  }

  return (
    <div className="flex items-center space-x-2">
      <Button onClick={handleNewUser}>
        <Plus className="h-4 w-4 mr-2" />
        Novo Usuário
      </Button>
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline">
            Ações
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Operações</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" />
            Exportar Usuários
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleImport}>
            <Upload className="mr-2 h-4 w-4" />
            Importar Usuários
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
