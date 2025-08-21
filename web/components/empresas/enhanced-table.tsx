"use client"

import { useEffect, useState, useMemo, useCallback } from "react"
import { SortingState } from "@tanstack/react-table"
import { useEmpresas, type Empresa } from "@/hooks/use-empresas"
import { TableHeader } from "./header"
import { DataTable } from "./table"
import { PaginationControls } from "./pagination"
import { createEmpresasColumns } from "./columns"

export default function EmpresasEnhancedTable() {
  const { empresas, loading, paginationInfo, listarEmpresas, excluirEmpresa } = useEmpresas()
  const [sorting, setSorting] = useState<SortingState>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(100)
  const [searchTerm, setSearchTerm] = useState("")
  const [searchInput, setSearchInput] = useState("")
  const [mounted, setMounted] = useState(false)

  // Controlar hidratação para evitar erros de SSR
  useEffect(() => {
    setMounted(true)
  }, [])

  // Debounce para busca
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchTerm(searchInput)
      setCurrentPage(1) // Reset para primeira página ao buscar
    }, 500)

    return () => clearTimeout(timer)
  }, [searchInput])

  // Carregar dados quando página, tamanho da página ou busca mudar
  useEffect(() => {
    if (mounted) {
      listarEmpresas({
        page: currentPage,
        limit: pageSize,
        search: searchTerm || undefined
      })
    }
  }, [mounted, currentPage, pageSize, searchTerm, listarEmpresas])

  // Função para excluir empresa com confirmação
  const handleExcluirEmpresa = useCallback(async (empresa: Empresa) => {
    const confirmacao = window.confirm(
      `⚠️ Confirmar Exclusão\n\nDeseja realmente excluir a empresa:\n\n${empresa.razao_social}\nCNPJ: ${empresa.cnpj}\n\nEsta ação não pode ser desfeita.`
    )

    if (confirmacao) {
      try {
        await excluirEmpresa(empresa.id)
        // Recarregar a página atual
        await listarEmpresas({
          page: currentPage,
          limit: pageSize,
          search: searchTerm || undefined
        })
      } catch (error) {
        console.error('Erro ao excluir empresa:', error)
      }
    }
  }, [excluirEmpresa, currentPage, pageSize, searchTerm, listarEmpresas])

  // Função para limpar busca
  const handleClearSearch = useCallback(() => {
    setSearchInput("")
    setSearchTerm("")
    setCurrentPage(1)
  }, [])

  // Função para navegar entre páginas
  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page)
  }, [])

  // Função para alterar tamanho da página
  const handlePageSizeChange = useCallback((newPageSize: number) => {
    setPageSize(newPageSize)
    setCurrentPage(1) // Reset para primeira página
  }, [])

  // Criar colunas
  const columns = useMemo(() => createEmpresasColumns({
    mounted,
    onDeleteEmpresa: handleExcluirEmpresa
  }), [mounted, handleExcluirEmpresa])

  return (
    <div className="space-y-6">
      {/* Header com ações responsivo */}
      <TableHeader
        loading={loading}
        paginationInfo={paginationInfo}
        searchInput={searchInput}
        onSearchChange={setSearchInput}
        onClearSearch={handleClearSearch}
      />

      {/* Tabela modularizada */}
      <DataTable
        data={empresas}
        columns={columns}
        loading={loading}
        sorting={sorting}
        onSortingChange={setSorting}
        mounted={mounted}
      />

      {/* Paginação modularizada */}
      <PaginationControls
        currentPage={currentPage}
        pageSize={pageSize}
        paginationInfo={paginationInfo}
        loading={loading}
        searchTerm={searchTerm}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
      />

      {/* Footer inspirado no Origin UI */}
      <p className="text-muted-foreground text-center text-sm">
        Tabela otimizada com paginação server-side, busca e ordenação feita com{" "}
        <a
          className="hover:text-foreground underline"
          href="https://tanstack.com/table"
          target="_blank"
          rel="noopener noreferrer"
        >
          TanStack Table
        </a>
      </p>
    </div>
  )
}
