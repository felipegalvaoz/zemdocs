"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign, TrendingUp } from "lucide-react"
import { useEffect, useState } from "react"

interface RevenueStats {
  total: number
  thisMonth: number
  growth: number
}

export function RevenueCard() {
  const [stats, setStats] = useState<RevenueStats>({
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
        // const response = await fetch('/api/v1/documents/revenue')
        // const data = await response.json()
        
        // Dados simulados
        const mockData = {
          total: 2847392.50,
          thisMonth: 234567.89,
          growth: 8.2
        }
        
        setStats(mockData)
      } catch (error) {
        console.error('Erro ao buscar receita:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
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
          <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
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
        <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
        <DollarSign className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{formatCurrency(stats.total)}</div>
        <p className="text-xs text-muted-foreground">
          <span className="inline-flex items-center text-green-600">
            <TrendingUp className="h-3 w-3 mr-1" />
            +{stats.growth}% este mês
          </span>
        </p>
      </CardContent>
    </Card>
  )
}
