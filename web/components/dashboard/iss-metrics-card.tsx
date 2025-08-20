"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Receipt, Calculator } from "lucide-react"
import { useEffect, useState } from "react"

interface ISSMetrics {
  totalISS: number
  averageRate: number
  monthlyISS: number
  progressToTarget: number
}

export function ISSMetricsCard() {
  const [metrics, setMetrics] = useState<ISSMetrics>({
    totalISS: 0,
    averageRate: 0,
    monthlyISS: 0,
    progressToTarget: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simular chamada à API
    const fetchMetrics = async () => {
      try {
        // TODO: Substituir por chamada real à API
        // const response = await fetch('/api/v1/documents/iss-metrics')
        // const data = await response.json()
        
        // Dados simulados
        const mockData = {
          totalISS: 142567.89,
          averageRate: 3.2,
          monthlyISS: 18750.45,
          progressToTarget: 68
        }
        
        setMetrics(mockData)
      } catch (error) {
        console.error('Erro ao buscar métricas de ISS:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchMetrics()
  }, [])

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  if (loading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Métricas ISS</CardTitle>
          <Receipt className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="text-2xl font-bold">Carregando...</div>
            <div className="space-y-2">
              <div className="h-2 bg-muted rounded animate-pulse" />
              <div className="h-3 bg-muted rounded w-2/3 animate-pulse" />
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Métricas ISS</CardTitle>
        <Receipt className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div>
            <div className="text-2xl font-bold">{formatCurrency(metrics.totalISS)}</div>
            <p className="text-xs text-muted-foreground">
              ISS total arrecadado
            </p>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Meta mensal</span>
              <span className="font-medium">{metrics.progressToTarget}%</span>
            </div>
            <Progress value={metrics.progressToTarget} className="h-2" />
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center">
              <Calculator className="h-3 w-3 mr-1 text-muted-foreground" />
              <span className="text-muted-foreground">Alíquota média</span>
            </div>
            <span className="font-medium">{metrics.averageRate}%</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
