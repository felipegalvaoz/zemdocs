"use client"

import { Loader2, PlusIcon } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { SearchBar } from "./search"

interface PaginationInfo {
  total: number
  page: number
  pages: number
  limit: number
}

interface TableHeaderProps {
  loading: boolean
  paginationInfo: PaginationInfo
  searchInput: string
  onSearchChange: (value: string) => void
  onClearSearch: () => void
}

export function TableHeader({
  loading,
  paginationInfo,
  searchInput,
  onSearchChange,
  onClearSearch
}: TableHeaderProps) {
  return (
    <div className="flex flex-col gap-4">
      {/* Título e botão de nova empresa */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold tracking-tight">Empresas</h2>
            {loading && (
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            )}
          </div>
          <p className="text-muted-foreground">
            Gerencie as empresas cadastradas no sistema com paginação otimizada
            {loading && " • Carregando..."}
          </p>
        </div>
        <Button asChild className="w-full sm:w-auto" disabled={loading}>
          <Link href="/empresas/nova">
            <PlusIcon className="mr-2 h-4 w-4" />
            Nova Empresa
          </Link>
        </Button>
      </div>

      {/* Barra de busca e informações */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <SearchBar
          searchInput={searchInput}
          onSearchChange={onSearchChange}
          onClearSearch={onClearSearch}
          placeholder="Buscar por CNPJ, razão social ou nome fantasia..."
        />
        
        <div className="text-sm text-muted-foreground">
          {loading ? (
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Carregando empresas...
            </div>
          ) : (
            <>
              Página {paginationInfo.page} de {paginationInfo.pages} • {paginationInfo.total} empresa(s) total
            </>
          )}
        </div>
      </div>
    </div>
  )
}
