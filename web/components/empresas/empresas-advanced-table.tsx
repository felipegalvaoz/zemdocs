"use client"

import { useId, useMemo, useRef, useState } from "react"
import {
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
  ChevronDownIcon,
  ChevronFirstIcon,
  ChevronLastIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronUpIcon,
  CircleXIcon,
  Columns3Icon,
  EllipsisIcon,
  FilterIcon,
  PlusIcon,
  TrashIcon,
  Eye,
  Edit,
  Search,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
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

// Interface para Empresa
interface Empresa {
  id: number
  cnpj: string
  razao_social: string
  nome_fantasia: string
  situacao_cadastral: string
  porte: string
  municipio: string
  uf: string
  data_abertura: string
  email?: string
  telefone?: string
  atividade_principal?: string
  capital_social?: number
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

// Função para formatar data
const formatDate = (dateString: string) => {
  if (!dateString) return "-"
  return new Date(dateString).toLocaleDateString('pt-BR')
}

// Função para formatar moeda
const formatCurrency = (value?: number) => {
  if (!value) return "-"
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value)
}

// Dados mock para demonstração
const mockEmpresas: Empresa[] = [
  {
    id: 1,
    cnpj: "34.194.865/0001-58",
    razao_social: "S. E. L. DE SOUZA SUARES VEICULOS",
    nome_fantasia: "SUARES VEÍCULOS",
    situacao_cadastral: "ATIVA",
    porte: "MICRO EMPRESA",
    municipio: "IMPERATRIZ",
    uf: "MA",
    data_abertura: "2015-03-15",
    email: "contato@suaresveiculos.com.br",
    telefone: "(99) 3524-1234",
    atividade_principal: "Comércio a varejo de automóveis",
    capital_social: 50000
  },
  {
    id: 2,
    cnpj: "12.345.678/0001-90",
    razao_social: "TECH SOLUTIONS LTDA",
    nome_fantasia: "TECH SOLUTIONS",
    situacao_cadastral: "ATIVA",
    porte: "PEQUENO PORTE",
    municipio: "SÃO LUÍS",
    uf: "MA",
    data_abertura: "2020-08-22",
    email: "contato@techsolutions.com.br",
    telefone: "(98) 3234-5678",
    atividade_principal: "Desenvolvimento de software",
    capital_social: 100000
  },
  {
    id: 3,
    cnpj: "98.765.432/0001-10",
    razao_social: "CONSULTORIA XYZ LTDA",
    nome_fantasia: "CONSULTORIA XYZ",
    situacao_cadastral: "SUSPENSA",
    porte: "MICRO EMPRESA",
    municipio: "IMPERATRIZ",
    uf: "MA",
    data_abertura: "2018-11-05",
    email: "contato@consultoriaxyz.com.br",
    telefone: "(99) 3456-7890",
    atividade_principal: "Consultoria empresarial",
    capital_social: 25000
  },
  {
    id: 4,
    cnpj: "11.222.333/0001-44",
    razao_social: "COMERCIO ABC LTDA",
    nome_fantasia: "ABC COMERCIO",
    situacao_cadastral: "INAPTA",
    porte: "MICRO EMPRESA",
    municipio: "TIMON",
    uf: "MA",
    data_abertura: "2017-06-10",
    capital_social: 15000
  },
  {
    id: 5,
    cnpj: "55.666.777/0001-88",
    razao_social: "INDUSTRIA DEF S.A.",
    nome_fantasia: "DEF INDUSTRIA",
    situacao_cadastral: "ATIVA",
    porte: "MEDIO PORTE",
    municipio: "SÃO LUÍS",
    uf: "MA",
    data_abertura: "2010-01-15",
    email: "contato@defindustria.com.br",
    telefone: "(98) 3333-4444",
    atividade_principal: "Fabricação de produtos diversos",
    capital_social: 500000
  }
]

// Definição das colunas da tabela
const columns: ColumnDef<Empresa>[] = [
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
        {row.getValue("municipio")}/{row.original.uf}
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
    cell: ({ row }) => <RowActions row={row} />,
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

  const [sorting, setSorting] = useState<SortingState>([
    {
      id: "razao_social",
      desc: false,
    },
  ])

  const [data, setData] = useState<Empresa[]>(mockEmpresas)
  const [loading] = useState(false)

  // Função para deletar empresas selecionadas
  const handleDeleteRows = () => {
    const selectedRows = table.getSelectedRowModel().rows
    const updatedData = data.filter(
      (item) => !selectedRows.some((row) => row.original.id === item.id)
    )
    setData(updatedData)
    table.resetRowSelection()
  }

  const table = useReactTable({
    data,
    columns,
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

  // Valores únicos para filtros com contadores
  const uniqueSituacoes = useMemo(() => {
    const situacoes = Array.from(new Set(data.map(item => item.situacao_cadastral)))
    return situacoes.sort()
  }, [data])

  const uniquePortes = useMemo(() => {
    const portes = Array.from(new Set(data.map(item => item.porte)))
    return portes.sort()
  }, [data])

  const uniqueUFs = useMemo(() => {
    const ufs = Array.from(new Set(data.map(item => item.uf)))
    return ufs.sort()
  }, [data])

  // Contadores para cada filtro
  const situacaoCounts = useMemo(() => {
    const counts = new Map<string, number>()
    data.forEach(item => {
      const situacao = item.situacao_cadastral
      counts.set(situacao, (counts.get(situacao) || 0) + 1)
    })
    return counts
  }, [data])

  const porteCounts = useMemo(() => {
    const counts = new Map<string, number>()
    data.forEach(item => {
      const porte = item.porte
      counts.set(porte, (counts.get(porte) || 0) + 1)
    })
    return counts
  }, [data])

  const ufCounts = useMemo(() => {
    const counts = new Map<string, number>()
    data.forEach(item => {
      const uf = item.uf
      counts.set(uf, (counts.get(uf) || 0) + 1)
    })
    return counts
  }, [data])

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
    if (inputRef.current) {
      inputRef.current.value = ""
    }
  }

  const hasFilters = table.getState().columnFilters.length > 0
  const selectedRowsCount = table.getSelectedRowModel().rows.length

  return (
    <Card className="w-full min-w-0">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="h-5 w-5" />
          Empresas
        </CardTitle>
        <CardDescription>
          Gerenciar empresas cadastradas no sistema com funcionalidades avançadas
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0 min-w-0">
        {/* Barra de ferramentas */}
        <div className="flex flex-col gap-4 p-6 border-b min-w-0">
          {/* Linha 1: Busca e ações */}
          <div className="flex items-center justify-between gap-4 min-w-0">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              {/* Campo de busca melhorado */}
              <div className="relative flex-1 max-w-sm">
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
                  placeholder="Buscar por CNPJ, razão social ou nome fantasia..."
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
            </div>

            {/* Botões de ação */}
            <div className="flex items-center gap-2">
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

              <Button variant="outline" size="sm">
                <PlusIcon className="h-4 w-4 mr-2" />
                Nova Empresa
              </Button>
            </div>
          </div>

          {/* Linha 2: Filtros */}
          <div className="flex items-center gap-2 flex-wrap min-w-0">
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
        </div>

        {/* Tabela */}
        <div className="overflow-x-auto">
          <Table className="table-fixed" style={{ minWidth: '1400px' }}>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} className="hover:bg-transparent">
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead
                        key={header.id}
                        style={{ width: `${header.getSize()}px` }}
                        className="h-11"
                      >
                        {header.isPlaceholder ? null : header.column.getCanSort() ? (
                          <div
                            className={cn(
                              header.column.getCanSort() &&
                                "flex h-full cursor-pointer items-center justify-between gap-2 select-none"
                            )}
                            onClick={header.column.getToggleSortingHandler()}
                            onKeyDown={(e) => {
                              // Enhanced keyboard handling for sorting
                              if (
                                header.column.getCanSort() &&
                                (e.key === "Enter" || e.key === " ")
                              ) {
                                e.preventDefault()
                                header.column.getToggleSortingHandler()?.(e)
                              }
                            }}
                            tabIndex={header.column.getCanSort() ? 0 : undefined}
                            role={header.column.getCanSort() ? "button" : undefined}
                            aria-label={
                              header.column.getCanSort()
                                ? `Ordenar por ${header.column.columnDef.header as string} ${
                                    header.column.getIsSorted() === "asc"
                                      ? "decrescente"
                                      : "crescente"
                                  }`
                                : undefined
                            }
                          >
                            {flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                            {{
                              asc: (
                                <ChevronUpIcon
                                  className="shrink-0 opacity-60"
                                  size={16}
                                  aria-hidden="true"
                                />
                              ),
                              desc: (
                                <ChevronDownIcon
                                  className="shrink-0 opacity-60"
                                  size={16}
                                  aria-hidden="true"
                                />
                              ),
                            }[header.column.getIsSorted() as string] ?? null}
                          </div>
                        ) : (
                          flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )
                        )}
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
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        className="last:py-0 min-w-0"
                        style={{ width: `${cell.column.getSize()}px` }}
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
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
function RowActions({ row: _row }: { row: any }) {
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
          <DropdownMenuItem>
            <Eye className="mr-2 h-4 w-4" />
            <span>Visualizar</span>
            <DropdownMenuShortcut>⌘V</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Edit className="mr-2 h-4 w-4" />
            <span>Editar</span>
            <DropdownMenuShortcut>⌘E</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <span>Duplicar</span>
            <DropdownMenuShortcut>⌘D</DropdownMenuShortcut>
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
        <DropdownMenuItem className="text-destructive focus:text-destructive">
          <TrashIcon className="mr-2 h-4 w-4" />
          <span>Excluir</span>
          <DropdownMenuShortcut>⌘⌫</DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
