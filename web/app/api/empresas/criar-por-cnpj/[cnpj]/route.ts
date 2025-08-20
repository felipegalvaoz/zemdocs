import { NextRequest, NextResponse } from 'next/server'
import { apiClient } from '@/lib/api-client'

// POST /api/empresas/criar-por-cnpj/[cnpj] - Criar empresa consultando CNPJ na API
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ cnpj: string }> }
) {
  try {
    const { cnpj } = await params

    const response = await apiClient.post(`/empresas/criar-por-cnpj/${cnpj}`)

    if (!response.ok) {
      const errorData = await response.json()
      return NextResponse.json(
        { error: errorData.error || 'Erro ao criar empresa por CNPJ' },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error('Erro ao criar empresa por CNPJ:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
