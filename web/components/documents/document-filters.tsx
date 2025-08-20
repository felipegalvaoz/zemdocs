"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Search, Filter, X } from "lucide-react"
import { useState } from "react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface FilterState {
  search: string
  status: string
  competencia: string
  prestador: string
}

export function DocumentFilters() {
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    status: "",
    competencia: "",
    prestador: ""
  })

  const [activeFilters, setActiveFilters] = useState<string[]>([])

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    // Tratar valores especiais como string vazia
    const normalizedValue = (value === "todos" || value === "todas") ? "" : value
    setFilters(prev => ({ ...prev, [key]: normalizedValue }))

    if (normalizedValue && !activeFilters.includes(key)) {
      setActiveFilters(prev => [...prev, key])
    } else if (!normalizedValue && activeFilters.includes(key)) {
      setActiveFilters(prev => prev.filter(f => f !== key))
    }
  }

  const clearFilter = (key: keyof FilterState) => {
    setFilters(prev => ({ ...prev, [key]: "" }))
    setActiveFilters(prev => prev.filter(f => f !== key))
  }

  const clearAllFilters = () => {
    setFilters({
      search: "",
      status: "",
      competencia: "",
      prestador: ""
    })
    setActiveFilters([])
  }

  const getFilterLabel = (key: string) => {
    const labels = {
      search: "Busca",
      status: "Status",
      competencia: "Competência",
      prestador: "Prestador"
    }
    return labels[key as keyof typeof labels] || key
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por número do documento, CNPJ ou razão social..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange("search", e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={filters.status || undefined} onValueChange={(value) => handleFilterChange("status", value || "")}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os status</SelectItem>
                <SelectItem value="Emitida">Emitida</SelectItem>
                <SelectItem value="Cancelada">Cancelada</SelectItem>
                <SelectItem value="Substituída">Substituída</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.competencia || undefined} onValueChange={(value) => handleFilterChange("competencia", value || "")}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Competência" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas</SelectItem>
                <SelectItem value="202408">Agosto/2024</SelectItem>
                <SelectItem value="202407">Julho/2024</SelectItem>
                <SelectItem value="202406">Junho/2024</SelectItem>
                <SelectItem value="202405">Maio/2024</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {activeFilters.length > 0 && (
        <div className="flex items-center space-x-2">
          <span className="text-sm text-muted-foreground">Filtros ativos:</span>
          {activeFilters.map((filterKey) => (
            <Badge key={filterKey} variant="secondary" className="flex items-center space-x-1">
              <span>{getFilterLabel(filterKey)}</span>
              <Button
                variant="ghost"
                size="sm"
                className="h-auto p-0 text-muted-foreground hover:text-foreground"
                onClick={() => clearFilter(filterKey as keyof FilterState)}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllFilters}
            className="text-muted-foreground hover:text-foreground"
          >
            Limpar todos
          </Button>
        </div>
      )}
    </div>
  )
}
