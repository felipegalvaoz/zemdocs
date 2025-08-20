"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, TrendingUp } from "lucide-react"
import { useEffect, useState } from "react"

interface DocumentStats {
  total: number
  thisMonth: number
  growth: number
}

export function DocumentStatsCard() {
  const [stats, setStats] = useState<DocumentStats>({
    total: 0,
    thisMonth: 0,
    growth: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simular chamada à API
    const fetchStats = async () => {
      try {
        // TODO: Substituir por chamada real à API
        // const response = await fetch('/api/v1/documents/stats')
        // const data = await response.json()
        
        // Dados simulados
        const mockData = {
          total: 1247,
          thisMonth: 89,
          growth: 12.5
        }
        
        setStats(mockData)
      } catch (error) {
        console.error('Erro ao buscar estatísticas:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  if (loading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total de Documentos</CardTitle>
          <FileText className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">Carregando...</div>
          <p className="text-xs text-muted-foreground">
            Buscando dados...
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Total de Documentos</CardTitle>
        <FileText className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{stats.total.toLocaleString()}</div>
        <p className="text-xs text-muted-foreground">
          <span className="inline-flex items-center">
            <TrendingUp className="h-3 w-3 mr-1" />
            +{stats.thisMonth} este mês
          </span>
        </p>
      </CardContent>
    </Card>
  )
}
