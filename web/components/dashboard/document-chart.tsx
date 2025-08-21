"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { useEffect, useState } from "react"

const chartConfig = {
  documents: {
    label: "Documentos Emitidos",
    color: "hsl(var(--chart-1))",
  },
  revenue: {
    label: "Receita (R$)",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig

interface ChartData {
  month: string
  documents: number
  revenue: number
}

export function DocumentChart() {
  const [chartData, setChartData] = useState<ChartData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simular chamada à API
    const fetchChartData = async () => {
      try {
        // TODO: Substituir por chamada real à API
        // const response = await fetch('/api/v1/documents/chart-data')
        // const data = await response.json()
        
        // Dados simulados
        const mockData = [
          { month: "Jan", documents: 186, revenue: 125000 },
          { month: "Fev", documents: 305, revenue: 200000 },
          { month: "Mar", documents: 237, revenue: 180000 },
          { month: "Abr", documents: 173, revenue: 150000 },
          { month: "Mai", documents: 209, revenue: 190000 },
          { month: "Jun", documents: 214, revenue: 220000 },
          { month: "Jul", documents: 189, revenue: 175000 },
          { month: "Ago", documents: 267, revenue: 245000 },
        ]
        
        setChartData(mockData)
      } catch (error) {
        console.error('Erro ao buscar dados do gráfico:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchChartData()
  }, [])

  if (loading) {
    return (
      <Card className="col-span-4">
        <CardHeader>
          <CardTitle>Evolução Mensal</CardTitle>
          <CardDescription>
            NFS-e emitidas e receita por mês
          </CardDescription>
        </CardHeader>
        <CardContent className="pl-2">
          <div className="h-[350px] flex items-center justify-center">
            <p className="text-muted-foreground">Carregando gráfico...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="col-span-4">
      <CardHeader>
        <CardTitle>Evolução Mensal</CardTitle>
        <CardDescription>
          Documentos emitidos e receita por mês
        </CardDescription>
      </CardHeader>
      <CardContent className="pl-2">
        <ChartContainer config={chartConfig} className="h-[350px] w-full">
          <BarChart accessibilityLayer data={chartData}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
            />
            <YAxis
              yAxisId="left"
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => value.toString()}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`}
            />
            <ChartTooltip 
              content={
                <ChartTooltipContent 
                  formatter={(value, name) => {
                    if (name === 'revenue') {
                      return [
                        new Intl.NumberFormat('pt-BR', {
                          style: 'currency',
                          currency: 'BRL'
                        }).format(value as number),
                        'Receita'
                      ]
                    }
                    return [value, 'NFS-e']
                  }}
                />
              } 
            />
            <Bar
              dataKey="documents"
              fill="var(--color-documents)"
              radius={[4, 4, 0, 0]}
              yAxisId="left"
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
