"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Building2, Users, TrendingUp, MapPin } from "lucide-react"
import { useEffect, useState } from "react"

interface EmpresasStats {
  total: number
  ativas: number
  novasEsteAno: number
  porUF: { [key: string]: number }
}

export function EmpresasStats() {
  const [stats, setStats] = useState<EmpresasStats>({
    total: 0,
    ativas: 0,
    novasEsteAno: 0,
    porUF: {}
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // TODO: Substituir por chamada real à API
        // const response = await fetch('/api/v1/empresas/stats')
        // const data = await response.json()
        
        // Dados simulados
        const mockData = {
          total: 1247,
          ativas: 1189,
          novasEsteAno: 89,
          porUF: {
            "MA": 856,
            "SP": 234,
            "RJ": 89,
            "MG": 68
          }
        }
        
        setStats(mockData)
      } catch (error) {
        console.error('Erro ao buscar estatísticas de empresas:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  if (loading) {
    return (
      <>
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Carregando...</CardTitle>
              <div className="h-4 w-4 bg-muted rounded animate-pulse" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">---</div>
              <p className="text-xs text-muted-foreground">
                Buscando dados...
              </p>
            </CardContent>
          </Card>
        ))}
      </>
    )
  }

  const percentualAtivas = ((stats.ativas / stats.total) * 100).toFixed(1)
  const principalUF = Object.entries(stats.porUF).sort(([,a], [,b]) => b - a)[0]

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total de Empresas</CardTitle>
          <Building2 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.total.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">
            Empresas cadastradas
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Empresas Ativas</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.ativas.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">
            {percentualAtivas}% do total
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Novas Este Ano</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.novasEsteAno}</div>
          <p className="text-xs text-muted-foreground">
            Empresas abertas em 2024
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Principal UF</CardTitle>
          <MapPin className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{principalUF?.[0] || "---"}</div>
          <p className="text-xs text-muted-foreground">
            {principalUF?.[1] || 0} empresas
          </p>
        </CardContent>
      </Card>
    </>
  )
}
