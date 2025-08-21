"use client"

import { useId, useMemo, useRef, useState, useEffect, useCallback } from "react"
import {
  Column,
  ColumnDef,
  ColumnFiltersState,
  FilterFn,
  flexRender,
  getCoreRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  PaginationState,
  SortingState,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table"
import {
  ArrowLeftToLineIcon,
  ArrowRightToLineIcon,
  ChevronFirstIcon,
  ChevronLastIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CircleXIcon,
  Columns3Icon,
  EllipsisIcon,
  FilterIcon,
  PinOffIcon,
  PlusIcon,
  TrashIcon,
  Eye,
  Edit,
  Search,
} from "lucide-react"
import Link from "next/link"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
} from "@/components/ui/pagination"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"
import { DateRangePicker } from "@/components/ui/date-range-picker"
import { DateRange } from "react-day-picker"
import { useEmpresas, type Empresa } from "@/hooks/use-empresas"
import { CSSProperties } from "react"

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

// Função de filtro personalizada para múltiplas colunas
const multiColumnFilterFn: FilterFn<Empresa> = (row, _columnId, value) => {
  const searchValue = value.toLowerCase()
  const cnpj = row.getValue("cnpj") as string
  const razaoSocial = row.getValue("razao_social") as string
  const nomeFantasia = row.getValue("nome_fantasia") as string

  return (
    cnpj?.toLowerCase().includes(searchValue) ||
    razaoSocial?.toLowerCase().includes(searchValue) ||
    nomeFantasia?.toLowerCase().includes(searchValue)
  )
}

// Função de filtro para situação cadastral (suporta múltiplos valores)
const situacaoFilterFn: FilterFn<Empresa> = (row, _columnId, filterValue: string[]) => {
  if (!filterValue?.length) return true
  const situacao = row.getValue("situacao_cadastral") as string
  return filterValue.includes(situacao)
}

// Função de filtro para porte (suporta múltiplos valores)
const porteFilterFn: FilterFn<Empresa> = (row, _columnId, filterValue: string[]) => {
  if (!filterValue?.length) return true
  const porte = row.getValue("porte") as string
  return filterValue.includes(porte)
}

// Função de filtro para UF (suporta múltiplos valores)
const ufFilterFn: FilterFn<Empresa> = (row, _columnId, filterValue: string[]) => {
  if (!filterValue?.length) return true
  const uf = row.getValue("uf") as string
  return filterValue.includes(uf)
}

// Função para obter variante do badge de situação
const getSituacaoVariant = (situacao: string) => {
  switch (situacao?.toLowerCase()) {
    case "ativa":
      return "default" as const
    case "suspensa":
      return "secondary" as const
    case "inapta":
      return "destructive" as const
    case "baixada":
      return "outline" as const
    default:
      return "secondary" as const
  }
}

// Função para formatar data (evita problemas de hidratação)
const formatDate = (dateString: string) => {
  if (!dateString) return "-"

  try {
    // Parse da string de data diretamente (formato YYYY-MM-DD)
    const parts = dateString.split('-')
    if (parts.length !== 3) return "-"

    const year = parts[0]
    const month = parts[1]
    const day = parts[2]

    // Valida se são números válidos
    if (!year || !month || !day) return "-"

    return `${day}/${month}/${year}`
  } catch (error) {
    return "-"
  }
}

// Função para formatar moeda (evita problemas de hidratação)
const formatCurrency = (value?: number) => {
  if (!value || value === 0) return "-"

  // Formata manualmente para evitar problemas de locale
  const formatted = value.toFixed(2).replace('.', ',')
  const parts = formatted.split(',')

  // Adiciona pontos para milhares
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.')

  return `R$ ${parts.join(',')}`
}



// Definição das colunas da tabela
const createColumns = (refreshEmpresas: () => Promise<void>): ColumnDef<Empresa>[] => [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Selecionar todas"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Selecionar linha"
      />
    ),
    size: 28,
    enableSorting: false,
    enableHiding: false,
    enablePinning: true,
  },
  {
    header: "CNPJ",
    accessorKey: "cnpj",
    cell: ({ row }) => (
      <div className="font-mono text-sm min-w-0">{row.getValue("cnpj")}</div>
    ),
    size: 160,
    filterFn: multiColumnFilterFn,
    enableHiding: false,
    enablePinning: true,
  },
  {
    header: "Razão Social",
    accessorKey: "razao_social",
    cell: ({ row }) => (
      <div className="font-medium min-w-0 truncate">
        {row.getValue("razao_social")}
      </div>
    ),
    size: 250,
    filterFn: multiColumnFilterFn,
    enableHiding: false,
    enablePinning: true,
  },
  {
    header: "Nome Fantasia",
    accessorKey: "nome_fantasia",
    cell: ({ row }) => (
      <div className="min-w-0 truncate">
        {row.getValue("nome_fantasia") || "-"}
      </div>
    ),
    size: 200,
    filterFn: multiColumnFilterFn,
  },
  {
    header: "Situação",
    accessorKey: "situacao_cadastral",
    cell: ({ row }) => (
      <Badge variant={getSituacaoVariant(row.getValue("situacao_cadastral"))}>
        {row.getValue("situacao_cadastral")}
      </Badge>
    ),
    size: 100,
    filterFn: situacaoFilterFn,
  },
  {
    header: "Porte",
    accessorKey: "porte",
    cell: ({ row }) => (
      <div className="text-sm min-w-0 truncate">{row.getValue("porte")}</div>
    ),
    size: 140,
    filterFn: porteFilterFn,
  },
  {
    header: "Localização",
    accessorKey: "municipio",
    cell: ({ row }) => (
      <div className="text-sm min-w-0 truncate">
        {row.getValue("municipio")}/{row.original.endereco?.uf || 'N/A'}
      </div>
    ),
    size: 160,
  },
  {
    header: "UF",
    accessorKey: "uf",
    cell: ({ row }) => (
      <div className="text-sm font-medium">{row.getValue("uf")}</div>
    ),
    size: 60,
    filterFn: ufFilterFn,
  },
  {
    header: "Data Abertura",
    accessorKey: "data_abertura",
    cell: ({ row }) => (
      <div className="text-sm font-mono">{formatDate(row.getValue("data_abertura"))}</div>
    ),
    size: 120,
  },
  {
    header: "Capital Social",
    accessorKey: "capital_social",
    cell: ({ row }) => (
      <div className="text-sm font-medium min-w-0 truncate">
        {formatCurrency(row.getValue("capital_social"))}
      </div>
    ),
    size: 130,
  },
  {
    id: "actions",
    header: "Ações",
    cell: ({ row }) => <RowActions row={row} refreshEmpresas={refreshEmpresas} />,
    size: 80,
    enableSorting: false,
    enableHiding: false,
  },
]

export default function EmpresasAdvancedTable() {
  const id = useId()
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  })
  const inputRef = useRef<HTMLInputElement>(null)

  // Estados para novos filtros
  const [dateRange, setDateRange] = useState<DateRange | undefined>()
  const [cnpjEmitente, setCnpjEmitente] = useState("")
  const [cnpjDestinatario, setCnpjDestinatario] = useState("")

  const [sorting, setSorting] = useState<SortingState>([
    {
      id: "razao_social",
      desc: false,
    },
  ])

  // Hook para gerenciar empresas
  const { empresas, loading, listarEmpresas, excluirEmpresa } = useEmpresas()
  const [data, setData] = useState<Empresa[]>([])

  // Carregar dados das empresas
  useEffect(() => {
    const loadEmpresas = async () => {
      try {
        await listarEmpresas({ limit: 100, offset: 0 })
      } catch (error) {
        console.error('Erro ao carregar empresas:', error)
      }
    }

    loadEmpresas()
  }, [listarEmpresas])

  // Atualizar dados quando empresas mudarem
  useEffect(() => {
    if (empresas.length > 0) {
      setData(empresas)
    }
  }, [empresas])

  // Função para recarregar a lista de empresas
  const refreshEmpresas = useCallback(async () => {
    try {
      await listarEmpresas({ limit: 100, offset: 0 })
    } catch (error) {
      console.error('Erro ao recarregar empresas:', error)
    }
  }, [listarEmpresas])

  // Criar colunas com a função de refresh
  const columns = useMemo(() => createColumns(refreshEmpresas), [refreshEmpresas])

  // Aplicar filtros personalizados aos dados
  const filteredData = useMemo(() => {
    let filtered = data

    // Filtro por intervalo de datas
    if (dateRange?.from || dateRange?.to) {
      filtered = filtered.filter((empresa) => {
        if (!empresa.data_abertura) return false

        const dataAbertura = new Date(empresa.data_abertura)

        // Comparação com data de início (00:00:00)
        if (dateRange.from) {
          const dataInicio = new Date(dateRange.from)
          dataInicio.setHours(0, 0, 0, 0)
          if (dataAbertura < dataInicio) return false
        }

        // Comparação com data de fim (23:59:59)
        if (dateRange.to) {
          const dataFim = new Date(dateRange.to)
          dataFim.setHours(23, 59, 59, 999)
          if (dataAbertura > dataFim) return false
        }

        return true
      })
    }

    // Filtro por CNPJ Emitente (busca no CNPJ da empresa)
    if (cnpjEmitente) {
      const cnpjLimpo = cnpjEmitente.replace(/\D/g, '')
      if (cnpjLimpo) {
        filtered = filtered.filter((empresa) => {
          const empresaCnpj = empresa.cnpj.replace(/\D/g, '')
          return empresaCnpj.includes(cnpjLimpo)
        })
      }
    }

    // Filtro por CNPJ Destinatário (busca no CNPJ da empresa)
    if (cnpjDestinatario) {
      const cnpjLimpo = cnpjDestinatario.replace(/\D/g, '')
      if (cnpjLimpo) {
        filtered = filtered.filter((empresa) => {
          const empresaCnpj = empresa.cnpj.replace(/\D/g, '')
          return empresaCnpj.includes(cnpjLimpo)
        })
      }
    }

    return filtered
  }, [data, dateRange, cnpjEmitente, cnpjDestinatario])

  // Função para deletar empresas selecionadas
  const handleDeleteRows = async () => {
    const selectedRows = table.getSelectedRowModel().rows

    try {
      // Excluir cada empresa selecionada
      for (const row of selectedRows) {
        await excluirEmpresa(row.original.id)
      }

      // Atualizar dados locais
      const updatedData = data.filter(
        (item) => !selectedRows.some((row) => row.original.id === item.id)
      )
      setData(updatedData)
      table.resetRowSelection()

      // Recarregar lista
      await listarEmpresas({ limit: 100, offset: 0 })
    } catch (error) {
      console.error('Erro ao excluir empresas:', error)
    }
  }

  const table = useReactTable({
    data: filteredData,
    columns,
    columnResizeMode: "onChange",
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    enableSortingRemoval: false,
    getPaginationRowModel: getPaginationRowModel(),
    onPaginationChange: setPagination,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getFilteredRowModel: getFilteredRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    state: {
      sorting,
      pagination,
      columnFilters,
      columnVisibility,
    },
  })

  // Valores únicos para filtros com contadores (baseado nos dados filtrados para mostrar contagens atuais)
  const uniqueSituacoes = useMemo(() => {
    const situacoes = Array.from(new Set(data.map(item => item.situacao_cadastral)))
    return situacoes.sort()
  }, [data])

  const uniquePortes = useMemo(() => {
    const portes = Array.from(new Set(data.map(item => item.porte)))
    return portes.sort()
  }, [data])

  const uniqueUFs = useMemo(() => {
    const ufs = Array.from(new Set(data.map(item => item.endereco?.uf).filter(Boolean)))
    return ufs.sort()
  }, [data])

  // Contadores para cada filtro (baseado nos dados filtrados para mostrar contagens atuais)
  const situacaoCounts = useMemo(() => {
    const counts = new Map<string, number>()
    filteredData.forEach(item => {
      const situacao = item.situacao_cadastral
      counts.set(situacao, (counts.get(situacao) || 0) + 1)
    })
    return counts
  }, [filteredData])

  const porteCounts = useMemo(() => {
    const counts = new Map<string, number>()
    filteredData.forEach(item => {
      const porte = item.porte
      counts.set(porte, (counts.get(porte) || 0) + 1)
    })
    return counts
  }, [filteredData])

  const ufCounts = useMemo(() => {
    const counts = new Map<string, number>()
    filteredData.forEach(item => {
      const uf = item.endereco?.uf
      if (uf) {
        counts.set(uf, (counts.get(uf) || 0) + 1)
      }
    })
    return counts
  }, [filteredData])

  // Estados para filtros selecionados
  const selectedSituacoes = (table.getColumn("situacao_cadastral")?.getFilterValue() as string[]) || []
  const selectedPortes = (table.getColumn("porte")?.getFilterValue() as string[]) || []
  const selectedUFs = (table.getColumn("uf")?.getFilterValue() as string[]) || []

  // Funções para manipular filtros múltiplos
  const handleSituacaoChange = (checked: boolean, value: string) => {
    const currentFilter = table.getColumn("situacao_cadastral")?.getFilterValue() as string[] || []
    let newFilterValue = [...currentFilter]

    if (checked) {
      newFilterValue.push(value)
    } else {
      const index = newFilterValue.indexOf(value)
      if (index > -1) {
        newFilterValue.splice(index, 1)
      }
    }

    table.getColumn("situacao_cadastral")?.setFilterValue(
      newFilterValue.length ? newFilterValue : undefined
    )
  }

  const handlePorteChange = (checked: boolean, value: string) => {
    const currentFilter = table.getColumn("porte")?.getFilterValue() as string[] || []
    let newFilterValue = [...currentFilter]

    if (checked) {
      newFilterValue.push(value)
    } else {
      const index = newFilterValue.indexOf(value)
      if (index > -1) {
        newFilterValue.splice(index, 1)
      }
    }

    table.getColumn("porte")?.setFilterValue(
      newFilterValue.length ? newFilterValue : undefined
    )
  }

  const handleUFChange = (checked: boolean, value: string) => {
    const currentFilter = table.getColumn("uf")?.getFilterValue() as string[] || []
    let newFilterValue = [...currentFilter]

    if (checked) {
      newFilterValue.push(value)
    } else {
      const index = newFilterValue.indexOf(value)
      if (index > -1) {
        newFilterValue.splice(index, 1)
      }
    }

    table.getColumn("uf")?.setFilterValue(
      newFilterValue.length ? newFilterValue : undefined
    )
  }

  // Função para limpar filtros
  const clearFilters = () => {
    table.resetColumnFilters()
    setDateRange(undefined)
    setCnpjEmitente("")
    setCnpjDestinatario("")
    if (inputRef.current) {
      inputRef.current.value = ""
    }
  }

  const hasFilters = table.getState().columnFilters.length > 0 ||
                     dateRange !== undefined ||
                     cnpjEmitente !== "" ||
                     cnpjDestinatario !== ""
  const selectedRowsCount = table.getSelectedRowModel().rows.length

  return (
    <Card className="w-full min-w-0">
      <CardContent className="p-0 min-w-0">
        {/* Barra de ferramentas */}
        <div className="border-b min-w-0">
          {/* Linha principal: Busca e Ações */}
          <div className="flex items-center justify-between gap-4 p-4 min-w-0">
            {/* Campo de busca */}
            <div className="relative flex-1 min-w-64 max-w-sm">
              <Input
                id={`${id}-input`}
                ref={inputRef}
                className={cn(
                  "peer w-full ps-9",
                  Boolean(table.getColumn("cnpj")?.getFilterValue()) && "pe-9"
                )}
                value={(table.getColumn("cnpj")?.getFilterValue() ?? "") as string}
                onChange={(e) => {
                  table.getColumn("cnpj")?.setFilterValue(e.target.value)
                }}
                placeholder="Buscar por CNPJ, razão social..."
                type="text"
                aria-label="Buscar empresas"
              />
              <div className="text-muted-foreground/80 pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 peer-disabled:opacity-50">
                <Search size={16} aria-hidden="true" />
              </div>
              {Boolean(table.getColumn("cnpj")?.getFilterValue()) && (
                <button
                  className="text-muted-foreground/80 hover:text-foreground focus-visible:border-ring focus-visible:ring-ring/50 absolute inset-y-0 end-0 flex h-full w-9 items-center justify-center rounded-e-md transition-[color,box-shadow] outline-none focus:z-10 focus-visible:ring-[3px] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
                  aria-label="Limpar busca"
                  onClick={() => {
                    table.getColumn("cnpj")?.setFilterValue("")
                    if (inputRef.current) {
                      inputRef.current.focus()
                    }
                  }}
                >
                  <CircleXIcon size={16} aria-hidden="true" />
                </button>
              )}
            </div>

            {/* Botões de ação */}
            <div className="flex items-center gap-2">
              <Link href="/empresas/nova">
                <Button size="sm" className="gap-2">
                  <PlusIcon className="h-4 w-4" />
                  Nova Empresa
                </Button>
              </Link>
              {selectedRowsCount > 0 && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm" className="gap-2">
                      <TrashIcon className="h-4 w-4" />
                      Excluir
                      <span className="bg-background text-muted-foreground/70 -me-1 inline-flex h-5 max-h-full items-center rounded border px-1 font-[inherit] text-[0.625rem] font-medium">
                        {selectedRowsCount}
                      </span>
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <div className="flex flex-col gap-2 max-sm:items-center sm:flex-row sm:gap-4">
                      <div
                        className="flex size-9 shrink-0 items-center justify-center rounded-full border border-destructive/20 bg-destructive/10"
                        aria-hidden="true"
                      >
                        <TrashIcon className="text-destructive opacity-80" size={16} />
                      </div>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          Tem certeza que deseja excluir?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          Esta ação não pode ser desfeita. Isso excluirá permanentemente{" "}
                          {selectedRowsCount} {selectedRowsCount === 1 ? "empresa selecionada" : "empresas selecionadas"}.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                    </div>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDeleteRows} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                        Excluir
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
          </div>

          {/* Acordeon para Filtros Avançados */}
          <Accordion type="single" collapsible className="border-t">
            <AccordionItem value="filters" className="border-b-0">
              <AccordionTrigger className="px-4 py-3 hover:no-underline text-sm">
                <div className="flex items-center gap-2">
                  <FilterIcon className="h-4 w-4" />
                  <span>Filtros Avançados</span>
                  {(selectedSituacoes.length > 0 || selectedPortes.length > 0 || selectedUFs.length > 0 || dateRange || cnpjEmitente || cnpjDestinatario) && (
                    <Badge variant="secondary" className="text-xs">
                      {selectedSituacoes.length + selectedPortes.length + selectedUFs.length +
                       (dateRange ? 1 : 0) + (cnpjEmitente ? 1 : 0) + (cnpjDestinatario ? 1 : 0)} ativo{(selectedSituacoes.length + selectedPortes.length + selectedUFs.length +
                       (dateRange ? 1 : 0) + (cnpjEmitente ? 1 : 0) + (cnpjDestinatario ? 1 : 0)) > 1 ? 's' : ''}
                    </Badge>
                  )}
                  {filteredData.length !== data.length && (
                    <Badge variant="outline" className="text-xs">
                      {filteredData.length} de {data.length}
                    </Badge>
                  )}
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4 pt-2">
                <div className="flex items-center gap-3 flex-wrap">
                  {/* Filtro por Data */}
                  <DateRangePicker
                    date={dateRange}
                    onDateChange={setDateRange}
                    placeholder="Período"
                  />

                  {/* Filtro por CNPJ Emitente */}
                  <div className="relative">
                    <Input
                      placeholder="CNPJ Emitente"
                      value={cnpjEmitente}
                      onChange={(e) => {
                        // Aplicar máscara de CNPJ
                        let value = e.target.value.replace(/\D/g, '')
                        if (value.length <= 14) {
                          value = value.replace(/^(\d{2})(\d)/, '$1.$2')
                          value = value.replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
                          value = value.replace(/\.(\d{3})(\d)/, '.$1/$2')
                          value = value.replace(/(\d{4})(\d)/, '$1-$2')
                          setCnpjEmitente(value)
                        }
                      }}
                      className="w-44"
                      maxLength={18}
                    />
                  </div>

                  {/* Filtro por CNPJ Destinatário */}
                  <div className="relative">
                    <Input
                      placeholder="CNPJ Destinatário"
                      value={cnpjDestinatario}
                      onChange={(e) => {
                        // Aplicar máscara de CNPJ
                        let value = e.target.value.replace(/\D/g, '')
                        if (value.length <= 14) {
                          value = value.replace(/^(\d{2})(\d)/, '$1.$2')
                          value = value.replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
                          value = value.replace(/\.(\d{3})(\d)/, '.$1/$2')
                          value = value.replace(/(\d{4})(\d)/, '$1-$2')
                          setCnpjDestinatario(value)
                        }
                      }}
                      className="w-44"
                      maxLength={18}
                    />
                  </div>

                  {/* Separador */}
                  <div className="h-6 w-px bg-border" />

                  {/* Filtro por Situação */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <FilterIcon className="h-4 w-4" />
                  Situação
                  {selectedSituacoes.length > 0 && (
                    <span className="bg-background text-muted-foreground/70 -me-1 inline-flex h-5 max-h-full items-center rounded border px-1 font-[inherit] text-[0.625rem] font-medium">
                      {selectedSituacoes.length}
                    </span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto min-w-48 p-3" align="start">
                <div className="space-y-3">
                  <div className="text-muted-foreground text-xs font-medium">
                    Situação Cadastral
                  </div>
                  <div className="space-y-3">
                    {uniqueSituacoes.map((situacao, i) => (
                      <div key={situacao} className="flex items-center gap-2">
                        <Checkbox
                          id={`${id}-situacao-${i}`}
                          checked={selectedSituacoes.includes(situacao)}
                          onCheckedChange={(checked: boolean) =>
                            handleSituacaoChange(checked, situacao)
                          }
                        />
                        <Label
                          htmlFor={`${id}-situacao-${i}`}
                          className="flex grow justify-between gap-2 font-normal"
                        >
                          {situacao}{" "}
                          <span className="text-muted-foreground ms-2 text-xs">
                            {situacaoCounts.get(situacao)}
                          </span>
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              </PopoverContent>
            </Popover>

            {/* Filtro por Porte */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <FilterIcon className="h-4 w-4" />
                  Porte
                  {selectedPortes.length > 0 && (
                    <span className="bg-background text-muted-foreground/70 -me-1 inline-flex h-5 max-h-full items-center rounded border px-1 font-[inherit] text-[0.625rem] font-medium">
                      {selectedPortes.length}
                    </span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto min-w-48 p-3" align="start">
                <div className="space-y-3">
                  <div className="text-muted-foreground text-xs font-medium">
                    Porte da Empresa
                  </div>
                  <div className="space-y-3">
                    {uniquePortes.map((porte, i) => (
                      <div key={porte} className="flex items-center gap-2">
                        <Checkbox
                          id={`${id}-porte-${i}`}
                          checked={selectedPortes.includes(porte)}
                          onCheckedChange={(checked: boolean) =>
                            handlePorteChange(checked, porte)
                          }
                        />
                        <Label
                          htmlFor={`${id}-porte-${i}`}
                          className="flex grow justify-between gap-2 font-normal"
                        >
                          {porte}{" "}
                          <span className="text-muted-foreground ms-2 text-xs">
                            {porteCounts.get(porte)}
                          </span>
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              </PopoverContent>
            </Popover>

            {/* Filtro por UF */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <FilterIcon className="h-4 w-4" />
                  UF
                  {selectedUFs.length > 0 && (
                    <span className="bg-background text-muted-foreground/70 -me-1 inline-flex h-5 max-h-full items-center rounded border px-1 font-[inherit] text-[0.625rem] font-medium">
                      {selectedUFs.length}
                    </span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto min-w-48 p-3" align="start">
                <div className="space-y-3">
                  <div className="text-muted-foreground text-xs font-medium">
                    Estado
                  </div>
                  <div className="space-y-3">
                    {uniqueUFs.map((uf, i) => (
                      <div key={uf} className="flex items-center gap-2">
                        <Checkbox
                          id={`${id}-uf-${i}`}
                          checked={selectedUFs.includes(uf)}
                          onCheckedChange={(checked: boolean) =>
                            handleUFChange(checked, uf)
                          }
                        />
                        <Label
                          htmlFor={`${id}-uf-${i}`}
                          className="flex grow justify-between gap-2 font-normal"
                        >
                          {uf}{" "}
                          <span className="text-muted-foreground ms-2 text-xs">
                            {ufCounts.get(uf)}
                          </span>
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              </PopoverContent>
            </Popover>

            {/* Controle de visibilidade de colunas */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <Columns3Icon className="h-4 w-4" />
                  Colunas
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>Mostrar colunas</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {table
                  .getAllColumns()
                  .filter((column) => column.getCanHide())
                  .map((column) => {
                    return (
                      <DropdownMenuCheckboxItem
                        key={column.id}
                        className="capitalize"
                        checked={column.getIsVisible()}
                        onCheckedChange={(value) =>
                          column.toggleVisibility(!!value)
                        }
                      >
                        {column.columnDef.header as string}
                      </DropdownMenuCheckboxItem>
                    )
                  })}
              </DropdownMenuContent>
            </DropdownMenu>

                  {/* Limpar filtros */}
                  {hasFilters && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearFilters}
                      className="gap-2"
                    >
                      <CircleXIcon className="h-4 w-4" />
                      Limpar filtros
                    </Button>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>

        {/* Tabela */}
        <div className="overflow-x-auto border rounded-lg">
          <Table
            className="[&_td]:border-border [&_th]:border-border table-fixed border-separate border-spacing-0 [&_tfoot_td]:border-t [&_th]:border-b [&_tr]:border-none [&_tr:not(:last-child)_td]:border-b"
            style={{
              width: table.getTotalSize(),
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
                        className="[&[data-pinned][data-last-col]]:border-border data-pinned:bg-muted/90 relative h-12 truncate border-t data-pinned:backdrop-blur-xs [&:not([data-pinned]):has(+[data-pinned])_div.cursor-col-resize:last-child]:opacity-0 [&[data-last-col=left]_div.cursor-col-resize:last-child]:opacity-0 [&[data-pinned=left][data-last-col=left]]:border-r [&[data-pinned=right]:last-child_div.cursor-col-resize:last-child]:opacity-0 [&[data-pinned=right][data-last-col=right]]:border-l"
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
                          <span className="truncate">
                            {header.isPlaceholder
                              ? null
                              : flexRender(
                                  header.column.columnDef.header,
                                  header.getContext()
                                )}
                          </span>
                          {/* Pin/Unpin column controls */}
                          {!header.isPlaceholder &&
                            header.column.getCanPin() &&
                            (header.column.getIsPinned() ? (
                              <Button
                                size="icon"
                                variant="ghost"
                                className="-mr-1 size-7 shadow-none"
                                onClick={() => header.column.pin(false)}
                                aria-label={`Desafixar coluna ${header.column.columnDef.header as string}`}
                                title={`Desafixar coluna ${header.column.columnDef.header as string}`}
                              >
                                <PinOffIcon
                                  className="opacity-60"
                                  size={16}
                                  aria-hidden="true"
                                />
                              </Button>
                            ) : (
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    className="-mr-1 size-7 shadow-none"
                                    aria-label={`Opções de fixação para coluna ${header.column.columnDef.header as string}`}
                                    title={`Opções de fixação para coluna ${header.column.columnDef.header as string}`}
                                  >
                                    <EllipsisIcon
                                      className="opacity-60"
                                      size={16}
                                      aria-hidden="true"
                                    />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem
                                    onClick={() => header.column.pin("left")}
                                  >
                                    <ArrowLeftToLineIcon
                                      size={16}
                                      className="opacity-60"
                                      aria-hidden="true"
                                    />
                                    Fixar à esquerda
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => header.column.pin("right")}
                                  >
                                    <ArrowRightToLineIcon
                                      size={16}
                                      className="opacity-60"
                                      aria-hidden="true"
                                    />
                                    Fixar à direita
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            ))}
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
              {table.getRowModel().rows?.length ? (
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
                          className="[&[data-pinned][data-last-col]]:border-border data-pinned:bg-background/90 truncate data-pinned:backdrop-blur-xs [&[data-pinned=left][data-last-col=left]]:border-r [&[data-pinned=right][data-last-col=right]]:border-l py-3 px-3"
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
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    {loading ? "Carregando..." : "Nenhuma empresa encontrada."}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Paginação */}
        <div className="flex items-center justify-between gap-4 p-6 border-t bg-muted/30 min-w-0 flex-wrap">
          {/* Seletor de itens por página */}
          <div className="flex items-center gap-3">
            <Label htmlFor={`${id}-page-size`} className="max-sm:sr-only text-sm">
              Linhas por página
            </Label>
            <Select
              value={table.getState().pagination.pageSize.toString()}
              onValueChange={(value) => {
                table.setPageSize(Number(value))
              }}
            >
              <SelectTrigger id={`${id}-page-size`} className="w-fit whitespace-nowrap">
                <SelectValue placeholder="Selecionar número de resultados" />
              </SelectTrigger>
              <SelectContent className="[&_*[role=option]]:ps-2 [&_*[role=option]]:pe-8 [&_*[role=option]>span]:start-auto [&_*[role=option]>span]:end-2">
                {[5, 10, 25, 50].map((pageSize) => (
                  <SelectItem key={pageSize} value={pageSize.toString()}>
                    {pageSize}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Informações da página */}
          <div className="text-muted-foreground flex justify-end text-sm whitespace-nowrap min-w-0">
            <p
              className="text-muted-foreground text-sm whitespace-nowrap"
              aria-live="polite"
            >
              <span className="text-foreground">
                {table.getState().pagination.pageIndex *
                  table.getState().pagination.pageSize +
                  1}
                -
                {Math.min(
                  Math.max(
                    table.getState().pagination.pageIndex *
                      table.getState().pagination.pageSize +
                      table.getState().pagination.pageSize,
                    0
                  ),
                  table.getRowCount()
                )}
              </span>{" "}
              de{" "}
              <span className="text-foreground">
                {table.getRowCount().toString()}
              </span>
              {selectedRowsCount > 0 && (
                <span className="ml-4">
                  ({selectedRowsCount} selecionada{selectedRowsCount !== 1 ? "s" : ""})
                </span>
              )}
            </p>
          </div>

          {/* Botões de paginação */}
          <div>
            <Pagination>
              <PaginationContent>
                {/* Primeira página */}
                <PaginationItem>
                  <Button
                    size="icon"
                    variant="outline"
                    className="disabled:pointer-events-none disabled:opacity-50"
                    onClick={() => table.firstPage()}
                    disabled={!table.getCanPreviousPage()}
                    aria-label="Ir para primeira página"
                  >
                    <ChevronFirstIcon size={16} aria-hidden="true" />
                  </Button>
                </PaginationItem>
                {/* Página anterior */}
                <PaginationItem>
                  <Button
                    size="icon"
                    variant="outline"
                    className="disabled:pointer-events-none disabled:opacity-50"
                    onClick={() => table.previousPage()}
                    disabled={!table.getCanPreviousPage()}
                    aria-label="Ir para página anterior"
                  >
                    <ChevronLeftIcon size={16} aria-hidden="true" />
                  </Button>
                </PaginationItem>
                {/* Próxima página */}
                <PaginationItem>
                  <Button
                    size="icon"
                    variant="outline"
                    className="disabled:pointer-events-none disabled:opacity-50"
                    onClick={() => table.nextPage()}
                    disabled={!table.getCanNextPage()}
                    aria-label="Ir para próxima página"
                  >
                    <ChevronRightIcon size={16} aria-hidden="true" />
                  </Button>
                </PaginationItem>
                {/* Última página */}
                <PaginationItem>
                  <Button
                    size="icon"
                    variant="outline"
                    className="disabled:pointer-events-none disabled:opacity-50"
                    onClick={() => table.lastPage()}
                    disabled={!table.getCanNextPage()}
                    aria-label="Ir para última página"
                  >
                    <ChevronLastIcon size={16} aria-hidden="true" />
                  </Button>
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Componente para ações da linha
function RowActions({ row: _row, refreshEmpresas }: { row: any; refreshEmpresas: () => Promise<void> }) {
  const { excluirEmpresa } = useEmpresas()
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    try {
      setIsDeleting(true)
      await excluirEmpresa(_row.original.id)
      // O toast de sucesso já é exibido pelo hook useEmpresas
      // Recarregar a lista de empresas
      await refreshEmpresas()
    } catch (error) {
      console.error('Erro ao excluir empresa:', error)
      // O toast de erro já é exibido pelo hook useEmpresas
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className="flex justify-end">
          <Button
            size="icon"
            variant="ghost"
            className="shadow-none h-8 w-8"
            aria-label="Ações da empresa"
          >
            <EllipsisIcon size={16} aria-hidden="true" />
          </Button>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link href={`/empresas/${_row.original.id}`}>
              <Eye className="mr-2 h-4 w-4" />
              <span>Visualizar</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href={`/empresas/${_row.original.id}/editar`}>
              <Edit className="mr-2 h-4 w-4" />
              <span>Editar</span>
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem>
            <span>Exportar dados</span>
            <DropdownMenuShortcut>⌘X</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>Mais opções</DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent>
                <DropdownMenuItem>Histórico de alterações</DropdownMenuItem>
                <DropdownMenuItem>Documentos relacionados</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Configurações avançadas</DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem>Compartilhar</DropdownMenuItem>
          <DropdownMenuItem>Adicionar aos favoritos</DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onSelect={(e) => e.preventDefault()}
            >
              <TrashIcon className="mr-2 h-4 w-4" />
              <span>Excluir</span>
              <DropdownMenuShortcut>⌘⌫</DropdownMenuShortcut>
            </DropdownMenuItem>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja excluir a empresa "{_row.original.nome_fantasia || _row.original.razao_social}"?
                Esta ação não pode ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                disabled={isDeleting}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {isDeleting ? 'Excluindo...' : 'Excluir'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
