"use client"

import {
  ChevronFirstIcon,
  ChevronLastIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  Loader2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
} from "@/components/ui/pagination"

interface PaginationInfo {
  total: number
  page: number
  pages: number
  limit: number
}

interface PaginationControlsProps {
  currentPage: number
  pageSize: number
  paginationInfo: PaginationInfo
  loading: boolean
  searchTerm?: string
  onPageChange: (page: number) => void
  onPageSizeChange: (size: number) => void
  pageSizeOptions?: number[]
}

export function PaginationControls({
  currentPage,
  pageSize,
  paginationInfo,
  loading,
  searchTerm,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [25, 50, 100, 200]
}: PaginationControlsProps) {
  return (
    <div className="flex items-center justify-between gap-8">
      {/* Seletor de registros por página */}
      <div className="flex items-center gap-3">
        <Label htmlFor="page-size-select" className="max-sm:sr-only">
          Registros por página
        </Label>
        <Select
          value={pageSize.toString()}
          onValueChange={(value) => onPageSizeChange(Number(value))}
        >
          <SelectTrigger id="page-size-select" className="w-fit whitespace-nowrap">
            <SelectValue placeholder="Selecione o número de registros" />
          </SelectTrigger>
          <SelectContent className="[&_*[role=option]]:ps-2 [&_*[role=option]]:pe-8 [&_*[role=option]>span]:start-auto [&_*[role=option]>span]:end-2">
            {pageSizeOptions.map((size) => (
              <SelectItem key={size} value={size.toString()}>
                {size}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Informações da página */}
      <div className="text-muted-foreground flex grow justify-end text-sm whitespace-nowrap">
        {loading ? (
          <div className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            Carregando...
          </div>
        ) : (
          <p className="text-muted-foreground text-sm whitespace-nowrap" aria-live="polite">
            <span className="text-foreground">
              {((currentPage - 1) * pageSize) + 1}
              -
              {Math.min(currentPage * pageSize, paginationInfo.total)}
            </span>{" "}
            de{" "}
            <span className="text-foreground">
              {paginationInfo.total}
            </span>
            {searchTerm && (
              <span className="ml-2 text-blue-600">
                • Filtrado por: &quot;{searchTerm}&quot;
              </span>
            )}
          </p>
        )}
      </div>

      {/* Botões de navegação */}
      <div>
        <Pagination>
          <PaginationContent>
            {/* Primeira página */}
            <PaginationItem>
              <Button
                size="icon"
                variant="outline"
                className="disabled:pointer-events-none disabled:opacity-50"
                onClick={() => onPageChange(1)}
                disabled={currentPage === 1 || loading}
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
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1 || loading}
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
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === paginationInfo.pages || loading}
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
                onClick={() => onPageChange(paginationInfo.pages)}
                disabled={currentPage === paginationInfo.pages || loading}
                aria-label="Ir para última página"
              >
                <ChevronLastIcon size={16} aria-hidden="true" />
              </Button>
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  )
}
