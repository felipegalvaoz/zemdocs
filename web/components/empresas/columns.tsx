"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Eye, Edit, Trash2, MoreHorizontal } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Empresa } from "@/hooks/use-empresas"

// Função para formatar data
export const formatDate = (dateString?: string) => {
  if (!dateString || dateString === "0001-01-01T00:00:00Z") return "-"
  
  try {
    const parts = dateString.split('-')
    if (parts.length !== 3) return "-"
    const year = parts[0]
    const month = parts[1]
    const day = parts[2]
    if (!year || !month || !day) return "-"
    return `${day}/${month}/${year}`
  } catch {
    return "-"
  }
}

// Função para formatar moeda
export const formatCurrency = (value?: number) => {
  if (!value || value === 0) return "-"
  const formatted = value.toFixed(2).replace('.', ',')
  const parts = formatted.split(',')
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  return `R$ ${parts.join(',')}`
}

// Função para obter variante do badge de situação
export const getSituacaoVariant = (situacao?: string) => {
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

interface CreateColumnsProps {
  mounted: boolean
  onDeleteEmpresa: (empresa: Empresa) => void
}

export const createEmpresasColumns = ({ mounted, onDeleteEmpresa }: CreateColumnsProps): ColumnDef<Empresa>[] => [
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
                onClick={() => onDeleteEmpresa(empresa)}
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
