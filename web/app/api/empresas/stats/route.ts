import { NextResponse } from 'next/server'

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:8080'
const API_TOKEN = process.env.API_TOKEN || '69415f14b56ccabe8cc5ec8cf5d5a2d2dc2ac66f0bb9859484dd5f8ce7ae2d2a'

interface Empresa {
  id: number
  cnpj: string
  razao_social: string
  nome_fantasia: string
  situacao_cadastral: string
  porte: string
  municipio: string
  uf: string
  data_abertura: string
  ativa: boolean
}

// GET /api/empresas/stats - Obter estatísticas das empresas
export async function GET() {
  try {
    // Buscar todas as empresas para calcular estatísticas
    const response = await fetch(`${API_BASE_URL}/api/v1/empresas?limit=1000&offset=0`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_TOKEN}`,
      },
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    const empresas: Empresa[] = data.empresas || []

    // Calcular estatísticas
    const total = empresas.length
    const ativas = empresas.filter(emp => emp.situacao_cadastral === 'ATIVA' || emp.ativa).length

    // Calcular empresas novas este ano (2024)
    const anoAtual = new Date().getFullYear()
    const novasEsteAno = empresas.filter(emp => {
      if (!emp.data_abertura) return false
      const anoAbertura = new Date(emp.data_abertura).getFullYear()
      return anoAbertura === anoAtual
    }).length

    // Calcular distribuição por UF
    const porUF: Record<string, number> = {}
    empresas.forEach(emp => {
      if (emp.uf) {
        porUF[emp.uf] = (porUF[emp.uf] || 0) + 1
      }
    })

    const stats = {
      total,
      ativas,
      novasEsteAno,
      porUF
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Erro ao obter estatísticas das empresas:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
