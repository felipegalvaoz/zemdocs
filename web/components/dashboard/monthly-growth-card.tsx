"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Activity, TrendingUp, TrendingDown } from "lucide-react"
import { useEffect, useState } from "react"

interface GrowthStats {
  percentage: number
  isPositive: boolean
  comparison: string
}

export function MonthlyGrowthCard() {
  const [stats, setStats] = useState<GrowthStats>({
    percentage: 0,
    isPositive: true,
    comparison: ""
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simular chamada à API
    const fetchStats = async () => {
      try {
        // TODO: Substituir por chamada real à API
        // const response = await fetch('/api/v1/documents/growth')
        // const data = await response.json()
        
        // Dados simulados
        const mockData = {
          percentage: 15.3,
          isPositive: true,
          comparison: "vs mês anterior"
        }
        
        setStats(mockData)
      } catch (error) {
        console.error('Erro ao buscar crescimento:', error)
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
          <CardTitle className="text-sm font-medium">Crescimento</CardTitle>
          <Activity className="h-4 w-4 text-muted-foreground" />
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

  const TrendIcon = stats.isPositive ? TrendingUp : TrendingDown
  const trendColor = stats.isPositive ? "text-green-600" : "text-red-600"
  const sign = stats.isPositive ? "+" : ""

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Crescimento</CardTitle>
        <Activity className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          <span className={trendColor}>
            {sign}{stats.percentage}%
          </span>
        </div>
        <p className="text-xs text-muted-foreground">
          <span className={`inline-flex items-center ${trendColor}`}>
            <TrendIcon className="h-3 w-3 mr-1" />
            {stats.comparison}
          </span>
        </p>
      </CardContent>
    </Card>
  )
}
