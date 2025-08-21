"use client"

import { Card, CardContent } from "@/components/ui/card"
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
        const response = await fetch('/api/empresas/stats')

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data = await response.json()
        setStats(data)
      } catch (error) {
        console.error('Erro ao buscar estatísticas de empresas:', error)
        // Manter valores padrão em caso de erro
        setStats({
          total: 0,
          ativas: 0,
          novasEsteAno: 0,
          porUF: {}
        })
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
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-lg font-bold">---</div>
                  <p className="text-xs text-muted-foreground">Carregando...</p>
                </div>
                <div className="h-4 w-4 bg-muted rounded animate-pulse" />
              </div>
            </CardContent>
          </Card>
        ))}
      </>
    )
  }

  const percentualAtivas = stats.total > 0 ? ((stats.ativas / stats.total) * 100).toFixed(1) : '0'
  const principalUF = stats.porUF && Object.keys(stats.porUF).length > 0
    ? Object.entries(stats.porUF).sort(([,a], [,b]) => (b as number) - (a as number))[0]
    : ['--', 0]

  return (
    <>
      <Card>
        <CardContent className="p-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-lg font-bold">{stats.total.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Total</p>
            </div>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-lg font-bold">{stats.ativas.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Ativas ({percentualAtivas}%)</p>
            </div>
            <Users className="h-4 w-4 text-muted-foreground" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-lg font-bold">{stats.novasEsteAno}</div>
              <p className="text-xs text-muted-foreground">Novas 2024</p>
            </div>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-lg font-bold">{principalUF?.[0] || "---"}</div>
              <p className="text-xs text-muted-foreground">{principalUF?.[1] || 0} empresas</p>
            </div>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    </>
  )
}
