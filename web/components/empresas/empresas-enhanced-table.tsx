"use client"

import { CSSProperties, useEffect, useState, useMemo } from "react"
import {
  Column,
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  getPaginationRowModel,
  PaginationState,
} from "@tanstack/react-table"
import {
  ArrowLeftToLineIcon,
  ArrowRightToLineIcon,
  EllipsisIcon,
  PinOffIcon,
  ChevronFirstIcon,
  ChevronLastIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  PlusIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  ChevronsUpDownIcon,
  SortAscIcon,
  SortDescIcon,
  Eye,
  Edit,
  Trash2,
  MoreHorizontal,
  Loader2,
} from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
} from "@/components/ui/pagination"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { useEmpresas, type Empresa } from "@/hooks/use-empresas"

// Helper function para estilos de pinning de colunas
const getPinningStyles = (column: Column<Empresa>): CSSProperties => {
  const isPinned = column.getIsPinned()
  return {
    left: isPinned === "left" ? `${column.getStart("left")}px` : undefined,
    right: isPinned === "right" ? `${column.getAfter("right")}px` : undefined,
    position: isPinned ? "sticky" : "relative",
    width: column.getSize(),
    zIndex: isPinned ? 1 : 0,
  }
}

// Helper function para ícone de ordenação
const getSortingIcon = (column: Column<Empresa>) => {
  const sortDirection = column.getIsSorted()
  if (sortDirection === "asc") {
    return <ArrowUpIcon className="h-4 w-4" />
  }
  if (sortDirection === "desc") {
    return <ArrowDownIcon className="h-4 w-4" />
  }
  return <ChevronsUpDownIcon className="h-4 w-4 opacity-50" />
}

// Componente de Loading Skeleton para as linhas da tabela
const TableRowSkeleton = ({ columnsCount }: { columnsCount: number }) => (
  <TableRow>
    {Array.from({ length: columnsCount }).map((_, index) => (
      <TableCell key={index} className="py-2 px-2">
        <Skeleton className="h-4 w-full" />
      </TableCell>
    ))}
  </TableRow>
)

// Função para formatar data
const formatDate = (dateString?: string) => {
  if (!dateString || dateString === "0001-01-01T00:00:00Z") return "-"
  
  try {
    const parts = dateString.split('-')
    if (parts.length !== 3) return "-"
    const year = parts[0]
    const month = parts[1]
    const day = parts[2]
    if (!year || !month || !day) return "-"
    return `${day}/${month}/${year}`
  } catch (error) {
    return "-"
  }
}

// Função para formatar moeda
const formatCurrency = (value?: number) => {
  if (!value || value === 0) return "-"
  const formatted = value.toFixed(2).replace('.', ',')
  const parts = formatted.split(',')
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  return `R$ ${parts.join(',')}`
}

// Função para obter variante do badge de situação
const getSituacaoVariant = (situacao?: string) => {
  switch (situacao?.toLowerCase()) {
    case "ativa":
      return "default"
    case "suspensa":
      return "destructive"
    case "inapta":
      return "secondary"
    default:
      return "outline"
  }
}

export default function EmpresasEnhancedTable() {
  const { empresas, loading, listarEmpresas, excluirEmpresa } = useEmpresas()
  const [sorting, setSorting] = useState<SortingState>([])
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  })
  const [mounted, setMounted] = useState(false)

  // Controlar hidratação para evitar erros de SSR
  useEffect(() => {
    setMounted(true)
  }, [])

  // Carregar dados ao montar o componente
  useEffect(() => {
    if (mounted) {
      listarEmpresas()
    }
  }, [mounted, listarEmpresas])

  // Função para excluir empresa com confirmação
  const handleExcluirEmpresa = async (empresa: Empresa) => {
    const confirmacao = window.confirm(
      `⚠️ Confirmar Exclusão\n\nDeseja realmente excluir a empresa:\n\n${empresa.razao_social}\nCNPJ: ${empresa.cnpj}\n\nEsta ação não pode ser desfeita.`
    )

    if (confirmacao) {
      try {
        await excluirEmpresa(empresa.id)
        // Recarregar a lista após exclusão
        await listarEmpresas()
      } catch (error) {
        console.error('Erro ao excluir empresa:', error)
      }
    }
  }

  // Definição das colunas otimizada para empresas com funcionalidades aprimoradas
  const createColumns = (): ColumnDef<Empresa>[] => [
  {
    header: "Empresa",
    accessorKey: "razao_social",
    cell: ({ row }) => (
      <div className="space-y-1 min-w-0">
        <div className="font-semibold text-sm leading-tight truncate">
          {row.getValue("razao_social")}
        </div>
        {row.original.nome_fantasia && (
          <div className="text-xs text-muted-foreground truncate">
            {row.original.nome_fantasia}
          </div>
        )}
      </div>
    ),
    size: 250,
    enablePinning: true,
    enableSorting: true,
  },
  {
    header: "CNPJ",
    accessorKey: "cnpj",
    cell: ({ row }) => (
      <div className="font-mono text-xs text-blue-600 dark:text-blue-400">
        {row.getValue("cnpj")}
      </div>
    ),
    size: 140,
    enablePinning: true,
    enableSorting: true,
  },
  {
    header: "Situação Cadastral",
    accessorKey: "situacao_cadastral",
    cell: ({ row }) => {
      const situacao = row.getValue("situacao_cadastral") as string
      return (
        <Badge variant={getSituacaoVariant(situacao)} className="text-xs">
          {situacao || "N/A"}
        </Badge>
      )
    },
    size: 160,
    enablePinning: true,
    enableSorting: true,
  },
  {
    header: "Status",
    accessorKey: "ativa",
    cell: ({ row }) => {
      const ativa = row.getValue("ativa") as boolean
      return (
        <Badge variant={ativa ? "default" : "secondary"} className="text-xs">
          {ativa ? "Ativa" : "Inativa"}
        </Badge>
      )
    },
    size: 120,
    enablePinning: true,
    enableSorting: true,
  },
  {
    header: "Localização",
    accessorKey: "endereco.municipio",
    cell: ({ row }) => (
      <div className="truncate">
        🇧🇷 {row.original.endereco?.municipio || "N/A"}/{row.original.endereco?.uf || "N/A"}
      </div>
    ),
    size: 180,
    enablePinning: true,
    enableSorting: true,
  },
  {
    header: "Capital Social",
    accessorKey: "capital_social",
    cell: ({ row }) => {
      const amount = row.getValue("capital_social") as number
      return (
        <div className="font-semibold text-green-600 dark:text-green-400">
          {formatCurrency(amount)}
        </div>
      )
    },
    size: 150,
    enablePinning: true,
    enableSorting: true,
  },
  {
    header: "Porte",
    accessorKey: "porte",
    cell: ({ row }) => (
      <div className="text-sm">{row.getValue("porte") as string || "-"}</div>
    ),
    size: 120,
    enablePinning: true,
    enableSorting: true,
  },
  {
    header: "Data Abertura",
    accessorKey: "data_abertura",
    cell: ({ row }) => (
      <div className="text-sm font-mono">{formatDate(row.getValue("data_abertura") as string)}</div>
    ),
    size: 130,
    enablePinning: true,
    enableSorting: true,
  },
  {
    header: "Email",
    accessorKey: "email",
    cell: ({ row }) => (
      <div className="text-sm text-blue-600 dark:text-blue-400 truncate">
        {row.getValue("email") as string || "-"}
      </div>
    ),
    size: 200,
    enablePinning: true,
    enableSorting: true,
  },
  {
    header: "Telefone",
    accessorKey: "telefone",
    cell: ({ row }) => (
      <div className="text-sm font-mono">
        {row.getValue("telefone") as string || "-"}
      </div>
    ),
    size: 140,
    enablePinning: true,
    enableSorting: true,
  },
  {
    header: "Atividade Principal",
    accessorKey: "atividade_principal",
    cell: ({ row }) => (
      <div className="text-sm truncate" title={row.getValue("atividade_principal") as string}>
        {row.getValue("atividade_principal") as string || "Não informado"}
      </div>
    ),
    size: 250,
    enablePinning: true,
    enableSorting: true,
  },
  {
    header: "Natureza Jurídica",
    accessorKey: "natureza_juridica",
    cell: ({ row }) => (
      <div className="text-sm truncate" title={row.getValue("natureza_juridica") as string}>
        {row.getValue("natureza_juridica") as string || "Não informado"}
      </div>
    ),
    size: 200,
    enablePinning: true,
    enableSorting: true,
  },
  {
    header: "Inscrição Estadual",
    accessorKey: "inscricao_estadual",
    cell: ({ row }) => (
      <div className="text-sm font-mono">
        {row.getValue("inscricao_estadual") as string || "-"}
      </div>
    ),
    size: 170,
    enablePinning: true,
    enableSorting: true,
  },
  {
    header: "Regime Tributário",
    accessorKey: "simples_nacional",
    cell: ({ row }) => {
      const simplesNacional = row.original.simples_nacional
      const mei = row.original.mei

      return (
        <div className="flex gap-1">
          {simplesNacional && (
            <Badge variant="outline" className="text-xs">
              Simples
            </Badge>
          )}
          {mei && (
            <Badge variant="outline" className="text-xs">
              MEI
            </Badge>
          )}
          {!simplesNacional && !mei && (
            <span className="text-xs text-muted-foreground">Normal</span>
          )}
        </div>
      )
    },
    size: 170,
    enablePinning: true,
    enableSorting: true,
  },
  {
    header: "Ações",
    id: "actions",
    cell: ({ row }) => {
      const empresa = row.original

      return (
        <div className="flex items-center gap-2">
          {mounted && (
            <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="h-8 w-8 p-0"
                aria-label="Abrir menu de ações"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={`/empresas/${empresa.id}`}>
                  <Eye className="mr-2 h-4 w-4" />
                  Visualizar
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/empresas/${empresa.id}/editar`}>
                  <Edit className="mr-2 h-4 w-4" />
                  Editar
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => handleExcluirEmpresa(empresa)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          )}
        </div>
      )
    },
    size: 100,
    enablePinning: true,
    enableSorting: false,
  },
]

  // Criar colunas
  const columns = useMemo(() => createColumns(), [mounted])

  const table = useReactTable({
    data: empresas,
    columns,
    columnResizeMode: "onChange",
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    state: {
      sorting,
      pagination,
    },
    enableSortingRemoval: false,
    initialState: {
      columnPinning: {
        left: ["razao_social"], // Fixa a coluna "Empresa" à esquerda por padrão
      },
    },
  })

  return (
    <div className="space-y-4">
      {/* Header com ações responsivo */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold tracking-tight">Empresas</h2>
            {loading && (
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            )}
          </div>
          <p className="text-muted-foreground">
            Gerencie as empresas cadastradas no sistema com funcionalidades avançadas
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

      {/* Tabela com design aprimorado e responsividade */}
      <div className="rounded-lg border overflow-hidden">
        <div className="overflow-x-auto">
          <Table
            className="[&_td]:border-border [&_th]:border-border table-fixed border-separate border-spacing-0 [&_tfoot_td]:border-t [&_th]:border-b [&_tr]:border-none [&_tr:not(:last-child)_td]:border-b"
            style={{
              width: table.getTotalSize(),
              minWidth: "1200px", // Largura mínima aumentada para melhor visibilidade dos títulos
            }}
          >
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} className="bg-muted/50">
                  {headerGroup.headers.map((header) => {
                    const { column } = header
                    const isPinned = column.getIsPinned()
                    const isLastLeftPinned =
                      isPinned === "left" && column.getIsLastColumn("left")
                    const isFirstRightPinned =
                      isPinned === "right" && column.getIsFirstColumn("right")

                    return (
                      <TableHead
                        key={header.id}
                        className="[&[data-pinned][data-last-col]]:border-border data-pinned:bg-background/95 data-pinned:shadow-sm relative h-8 truncate border-t data-pinned:backdrop-blur-xs [&:not([data-pinned]):has(+[data-pinned])_div.cursor-col-resize:last-child]:opacity-0 [&[data-last-col=left]_div.cursor-col-resize:last-child]:opacity-0 [&[data-pinned=left][data-last-col=left]]:border-r [&[data-pinned=right]:last-child_div.cursor-col-resize:last-child]:opacity-0 [&[data-pinned=right][data-last-col=right]]:border-l"
                        colSpan={header.colSpan}
                        style={{ ...getPinningStyles(column) }}
                        data-pinned={isPinned || undefined}
                        data-last-col={
                          isLastLeftPinned
                            ? "left"
                            : isFirstRightPinned
                              ? "right"
                              : undefined
                        }
                      >
                        <div className="flex items-center justify-between gap-2">
                          {/* Cabeçalho ordenável */}
                          <div
                            className={`flex items-center gap-2 ${
                              column.getCanSort() ? "cursor-pointer select-none" : ""
                            }`}
                            onClick={column.getCanSort() ? column.getToggleSortingHandler() : undefined}
                          >
                            <span className="truncate">
                              {header.isPlaceholder
                                ? null
                                : flexRender(
                                    header.column.columnDef.header,
                                    header.getContext()
                                  )}
                            </span>
                            {column.getCanSort() && getSortingIcon(column)}
                          </div>

                          {/* Menu aprimorado da coluna */}
                          {!header.isPlaceholder && (
                            mounted ? (
                              <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="-mr-1 size-7 shadow-none"
                                  aria-label={`Opções da coluna ${header.column.columnDef.header as string}`}
                                  title={`Opções da coluna ${header.column.columnDef.header as string}`}
                                >
                                  <EllipsisIcon
                                    className="opacity-60"
                                    size={16}
                                    aria-hidden="true"
                                  />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                {/* Opções de ordenação */}
                                {column.getCanSort() && (
                                  <>
                                    <DropdownMenuItem
                                      onClick={() => column.toggleSorting(false)}
                                      disabled={column.getIsSorted() === "asc"}
                                    >
                                      <SortAscIcon
                                        size={16}
                                        className="opacity-60"
                                        aria-hidden="true"
                                      />
                                      Ordenar crescente
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() => column.toggleSorting(true)}
                                      disabled={column.getIsSorted() === "desc"}
                                    >
                                      <SortDescIcon
                                        size={16}
                                        className="opacity-60"
                                        aria-hidden="true"
                                      />
                                      Ordenar decrescente
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                  </>
                                )}

                                {/* Opções de fixação */}
                                {column.getCanPin() && (
                                  <>
                                    {column.getIsPinned() ? (
                                      <DropdownMenuItem
                                        onClick={() => column.pin(false)}
                                      >
                                        <PinOffIcon
                                          size={16}
                                          className="opacity-60"
                                          aria-hidden="true"
                                        />
                                        Desafixar coluna
                                      </DropdownMenuItem>
                                    ) : (
                                      <>
                                        <DropdownMenuItem
                                          onClick={() => column.pin("left")}
                                        >
                                          <ArrowLeftToLineIcon
                                            size={16}
                                            className="opacity-60"
                                            aria-hidden="true"
                                          />
                                          Fixar à esquerda
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                          onClick={() => column.pin("right")}
                                        >
                                          <ArrowRightToLineIcon
                                            size={16}
                                            className="opacity-60"
                                            aria-hidden="true"
                                          />
                                          Fixar à direita
                                        </DropdownMenuItem>
                                      </>
                                    )}
                                  </>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                            ) : (
                              <div className="size-7" /> // Placeholder para manter layout
                            )
                          )}

                          {/* Handle de redimensionamento */}
                          {header.column.getCanResize() && (
                            <div
                              {...{
                                onDoubleClick: () => header.column.resetSize(),
                                onMouseDown: header.getResizeHandler(),
                                onTouchStart: header.getResizeHandler(),
                                className:
                                  "absolute top-0 h-full w-4 cursor-col-resize user-select-none touch-none -right-2 z-10 flex justify-center before:absolute before:w-px before:inset-y-0 before:bg-border before:-translate-x-px",
                              }}
                            />
                          )}
                        </div>
                      </TableHead>
                    )
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {loading ? (
                // Mostrar skeleton enquanto carrega
                Array.from({ length: pagination.pageSize }).map((_, index) => (
                  <TableRowSkeleton key={`skeleton-${index}`} columnsCount={columns.length} />
                ))
              ) : table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                  >
                    {row.getVisibleCells().map((cell) => {
                      const { column } = cell
                      const isPinned = column.getIsPinned()
                      const isLastLeftPinned =
                        isPinned === "left" && column.getIsLastColumn("left")
                      const isFirstRightPinned =
                        isPinned === "right" && column.getIsFirstColumn("right")

                      return (
                        <TableCell
                          key={cell.id}
                          className="[&[data-pinned][data-last-col]]:border-border data-pinned:bg-background/90 truncate data-pinned:backdrop-blur-xs [&[data-pinned=left][data-last-col=left]]:border-r [&[data-pinned=right][data-last-col=right]]:border-l py-2 px-2"
                          style={{ ...getPinningStyles(column) }}
                          data-pinned={isPinned || undefined}
                          data-last-col={
                            isLastLeftPinned
                              ? "left"
                              : isFirstRightPinned
                                ? "right"
                                : undefined
                          }
                        >
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCell>
                      )
                    })}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24 text-center">
                    Nenhuma empresa encontrada.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Paginação aprimorada */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          {loading ? (
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Carregando empresas...
            </div>
          ) : (
            <>
              Mostrando {table.getRowModel().rows.length} de {empresas.length} empresa(s)
              {empresas.length > 0 && (
                <span className="ml-2 text-green-600">
                  • Dados em cache
                </span>
              )}
            </>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => table.setPageIndex(0)}
                  disabled={!table.getCanPreviousPage()}
                >
                  <ChevronFirstIcon className="h-4 w-4" />
                </Button>
              </PaginationItem>
              <PaginationItem>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                >
                  <ChevronLeftIcon className="h-4 w-4" />
                </Button>
              </PaginationItem>
              <PaginationItem>
                <span className="text-sm">
                  Página {table.getState().pagination.pageIndex + 1} de{" "}
                  {table.getPageCount()}
                </span>
              </PaginationItem>
              <PaginationItem>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                >
                  <ChevronRightIcon className="h-4 w-4" />
                </Button>
              </PaginationItem>
              <PaginationItem>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                  disabled={!table.getCanNextPage()}
                >
                  <ChevronLastIcon className="h-4 w-4" />
                </Button>
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </div>

      {/* Footer inspirado no Origin UI */}
      <p className="text-muted-foreground text-center text-sm">
        Tabela aprimorada com ordenação, fixação e paginação feita com{" "}
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
