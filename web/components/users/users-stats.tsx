"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, UserCheck, UserPlus, Shield } from "lucide-react"
import { useEffect, useState } from "react"

interface UsersStats {
  total: number
  ativos: number
  novosEsteAno: number
  administradores: number
}

export function UsersStats() {
  const [stats, setStats] = useState<UsersStats>({
    total: 0,
    ativos: 0,
    novosEsteAno: 0,
    administradores: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // TODO: Substituir por chamada real à API
        // const response = await fetch('/api/v1/users/stats')
        // const data = await response.json()
        
        // Dados simulados
        const mockData = {
          total: 24,
          ativos: 22,
          novosEsteAno: 8,
          administradores: 3
        }
        
        setStats(mockData)
      } catch (error) {
        console.error('Erro ao buscar estatísticas de usuários:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-4">
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
      </div>
    )
  }

  const percentualAtivos = ((stats.ativos / stats.total) * 100).toFixed(1)

  return (
    <div className="grid gap-4 md:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total de Usuários</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.total}</div>
          <p className="text-xs text-muted-foreground">
            Usuários cadastrados
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Usuários Ativos</CardTitle>
          <UserCheck className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.ativos}</div>
          <p className="text-xs text-muted-foreground">
            {percentualAtivos}% do total
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Novos Este Ano</CardTitle>
          <UserPlus className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.novosEsteAno}</div>
          <p className="text-xs text-muted-foreground">
            Usuários criados em 2024
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Administradores</CardTitle>
          <Shield className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.administradores}</div>
          <p className="text-xs text-muted-foreground">
            Com privilégios admin
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
