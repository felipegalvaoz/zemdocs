import { NextRequest, NextResponse } from 'next/server'
import { apiClient } from '@/lib/api-client'

// GET /api/empresas/cnpj/[cnpj] - Buscar empresa por CNPJ
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ cnpj: string }> }
) {
  try {
    const { cnpj } = await params

    const response = await apiClient.get(`/empresas/cnpj/${cnpj}`)

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json(
          { error: 'Empresa não encontrada' },
          { status: 404 }
        )
      }
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Erro ao buscar empresa por CNPJ:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
