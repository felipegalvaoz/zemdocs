import { NextRequest, NextResponse } from 'next/server'
import { apiClient } from '@/lib/api-client'

// GET /api/empresas/consultar-cnpj/[cnpj] - Consultar CNPJ na API externa
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ cnpj: string }> }
) {
  try {
    const { cnpj } = await params

    const response = await apiClient.get(`/empresas/consultar-cnpj/${cnpj}`)

    if (!response.ok) {
      const errorData = await response.json()
      return NextResponse.json(
        { error: errorData.error || 'Erro ao consultar CNPJ' },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Erro ao consultar CNPJ:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
