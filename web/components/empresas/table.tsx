"use client"

import { CSSProperties } from "react"
import {
  Column,
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  OnChangeFn,
} from "@tanstack/react-table"
import {
  ArrowLeftToLineIcon,
  ArrowRightToLineIcon,
  EllipsisIcon,
  PinOffIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  ChevronsUpDownIcon,
  SortAscIcon,
  SortDescIcon,
} from "lucide-react"

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
import { Skeleton } from "@/components/ui/skeleton"
import { Empresa } from "@/hooks/use-empresas"

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

interface DataTableProps {
  data: Empresa[]
  columns: ColumnDef<Empresa>[]
  loading: boolean
  sorting: SortingState
  onSortingChange: OnChangeFn<SortingState>
  mounted: boolean
}

export function DataTable({
  data,
  columns,
  loading,
  sorting,
  onSortingChange,
  mounted
}: DataTableProps) {
  const table = useReactTable({
    data,
    columns,
    columnResizeMode: "onChange",
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange,
    state: {
      sorting,
    },
    enableSortingRemoval: false,
    initialState: {
      columnPinning: {
        left: ["razao_social"], // Fixa a coluna "Empresa" à esquerda por padrão
      },
    },
  })

  return (
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
              Array.from({ length: 10 }).map((_, index) => (
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
  )
}
