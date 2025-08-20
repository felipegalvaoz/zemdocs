import { useState, useCallback } from 'react'
import { toast } from 'sonner'

export interface Empresa {
  id: number
  cnpj: string
  razao_social: string
  nome_fantasia: string
  data_abertura: string
  porte: string
  situacao_cadastral: string
  atividade_principal: string
  email: string
  telefone: string
  endereco: {
    logradouro: string
    numero: string
    complemento: string
    cep: string
    bairro: string
    municipio: string
    uf: string
  }
}

export interface EmpresaCreateRequest {
  // Dados básicos
  cnpj: string
  inscricao_estadual: string
  inscricao_municipal: string
  razao_social: string
  nome_fantasia: string
  data_abertura: string
  porte: string
  natureza_juridica: string
  atividade_principal: string
  situacao_cadastral: string

  // Endereço
  logradouro: string
  numero: string
  complemento: string
  cep: string
  bairro: string
  municipio: string
  uf: string

  // Contato
  email: string
  telefone: string

  // Dados adicionais
  capital_social: number
  simples_nacional: boolean
  mei: boolean
  ativa: boolean
}

export interface EmpresaUpdateRequest {
  razao_social: string
  nome_fantasia: string
  email: string
  telefone: string
  ativa: boolean
}

export interface CNPJData {
  updated: string
  taxId: string
  alias: string
  founded: string
  head: boolean
  company: {
    id: number
    name: string
    equity: number
    size: {
      id: number
      acronym: string
      text: string
    }
    nature: {
      id: number
      text: string
    }
    simples: {
      optant: boolean
      since: string
    }
    simei: {
      optant: boolean
      since: string
    }
    members: Array<{
      since: string
      person: {
        id: string
        type: string
        name: string
        taxId: string
        age: string
      }
      role: {
        id: number
        text: string
      }
    }>
  }
  statusDate: string
  status: {
    id: number
    text: string
  }
  address: {
    municipality: number
    street: string
    number: string
    district: string
    city: string
    state: string
    details: string
    zip: string
    country: {
      id: number
      name: string
    }
  }
  mainActivity: {
    id: number
    text: string
  }
  phones: Array<{
    type: string
    area: string
    number: string
  }>
  emails: Array<{
    ownership: string
    address: string
    domain: string
  }>
  sideActivities: Array<{
    id: number
    text: string
  }>
  registrations: Array<{
    number: string
    state: string
    enabled: boolean
    statusDate: string
    status: {
      id: number
      text: string
    }
    type: {
      id: number
      text: string
    }
  }>
}

export function useEmpresas() {
  const [loading, setLoading] = useState(false)
  const [empresas, setEmpresas] = useState<Empresa[]>([])

  // Listar empresas
  const listarEmpresas = useCallback(async (params?: {
    limit?: number
    offset?: number
    search?: string
  }) => {
    setLoading(true)
    try {
      const searchParams = new URLSearchParams()
      if (params?.limit) searchParams.set('limit', params.limit.toString())
      if (params?.offset) searchParams.set('offset', params.offset.toString())
      if (params?.search) searchParams.set('search', params.search)

      const response = await fetch(`/api/empresas?${searchParams}`)
      if (!response.ok) {
        throw new Error('Erro ao listar empresas')
      }

      const data = await response.json()
      setEmpresas(data.empresas || [])
      return data
    } catch (error) {
      console.error('Erro ao listar empresas:', error)
      toast.error('Erro ao carregar empresas')
      throw error
    } finally {
      setLoading(false)
    }
  }, [])

  // Buscar empresa por ID
  const buscarEmpresaPorId = useCallback(async (id: number): Promise<Empresa> => {
    setLoading(true)
    try {
      const response = await fetch(`/api/empresas/${id}`)
      if (!response.ok) {
        throw new Error('Empresa não encontrada')
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error('Erro ao buscar empresa:', error)
      toast.error('Erro ao buscar empresa')
      throw error
    } finally {
      setLoading(false)
    }
  }, [])

  // Buscar empresa por CNPJ
  const buscarEmpresaPorCnpj = useCallback(async (cnpj: string): Promise<Empresa> => {
    setLoading(true)
    try {
      // Limpar CNPJ (remover pontos, barras e hífens)
      const cnpjLimpo = cnpj.replace(/\D/g, '')

      const response = await fetch(`/api/empresas/cnpj/${cnpjLimpo}`)
      if (!response.ok) {
        throw new Error('Empresa não encontrada')
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error('Erro ao buscar empresa por CNPJ:', error)
      toast.error('Empresa não encontrada')
      throw error
    } finally {
      setLoading(false)
    }
  }, [])

  // Consultar CNPJ na API externa
  const consultarCnpj = useCallback(async (cnpj: string): Promise<CNPJData> => {
    setLoading(true)
    try {
      // Limpar CNPJ (remover pontos, barras e hífens)
      const cnpjLimpo = cnpj.replace(/\D/g, '')

      const response = await fetch(`/api/empresas/consultar-cnpj/${cnpjLimpo}`)
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao consultar CNPJ')
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error('Erro ao consultar CNPJ:', error)
      toast.error(error instanceof Error ? error.message : 'Erro ao consultar CNPJ')
      throw error
    } finally {
      setLoading(false)
    }
  }, [])

  // Criar empresa
  const criarEmpresa = useCallback(async (empresa: EmpresaCreateRequest): Promise<Empresa> => {
    setLoading(true)
    try {
      const response = await fetch('/api/empresas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(empresa),
      })

      if (!response.ok) {
        const errorData = await response.json()
        let errorMessage = errorData.error || 'Erro ao criar empresa'

        // Verificar se é erro de CNPJ duplicado
        if (errorMessage.includes('duplicate key value violates unique constraint') ||
            errorMessage.includes('empresas_cnpj_key') ||
            errorMessage.includes('já existe')) {
          errorMessage = `⚠️ Empresa já cadastrada!\n\nUma empresa com este CNPJ já está registrada no sistema. Verifique a listagem de empresas ou use um CNPJ diferente.`
        }

        throw new Error(errorMessage)
      }

      const data = await response.json()
      return data
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao criar empresa'

      // Para erros de duplicata, não mostrar toast aqui (será tratado pelo AlertDialog)
      if (!errorMessage.includes('já cadastrada') &&
          !errorMessage.includes('já está registrada') &&
          !errorMessage.includes('já existe') &&
          !errorMessage.includes('duplicate key')) {
        toast.error(errorMessage, {
          duration: 4000,
        })
      }

      throw error
    } finally {
      setLoading(false)
    }
  }, [])

  // Criar empresa por CNPJ
  const criarEmpresaPorCnpj = useCallback(async (cnpj: string): Promise<Empresa> => {
    setLoading(true)
    try {
      // Limpar CNPJ (remover pontos, barras e hífens)
      const cnpjLimpo = cnpj.replace(/\D/g, '')

      const response = await fetch(`/api/empresas/criar-por-cnpj/${cnpjLimpo}`, {
        method: 'POST',
      })

      if (!response.ok) {
        const errorData = await response.json()
        let errorMessage = errorData.error || 'Erro ao criar empresa'

        // Verificar se é erro de CNPJ duplicado
        if (errorMessage.includes('duplicate key value violates unique constraint') ||
            errorMessage.includes('empresas_cnpj_key') ||
            errorMessage.includes('já existe')) {
          errorMessage = `🔍 Empresa já encontrada!\n\nEsta empresa já está cadastrada no sistema. Você pode encontrá-la na listagem de empresas.`
        }

        throw new Error(errorMessage)
      }

      const data = await response.json()
      return data
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao criar empresa'

      // Para erros de duplicata, não mostrar toast aqui (será tratado pelo AlertDialog)
      if (!errorMessage.includes('já encontrada') &&
          !errorMessage.includes('já está cadastrada') &&
          !errorMessage.includes('já existe') &&
          !errorMessage.includes('duplicate key')) {
        toast.error(errorMessage, {
          duration: 4000,
        })
      }

      throw error
    } finally {
      setLoading(false)
    }
  }, [])

  // Atualizar empresa
  const atualizarEmpresa = useCallback(async (id: number, empresa: EmpresaUpdateRequest): Promise<Empresa> => {
    setLoading(true)
    try {
      const response = await fetch(`/api/empresas/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(empresa),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao atualizar empresa')
      }

      const data = await response.json()
      toast.success('Empresa atualizada com sucesso!')
      return data
    } catch (error) {
      console.error('Erro ao atualizar empresa:', error)
      toast.error(error instanceof Error ? error.message : 'Erro ao atualizar empresa')
      throw error
    } finally {
      setLoading(false)
    }
  }, [])

  // Excluir empresa
  const excluirEmpresa = useCallback(async (id: number): Promise<void> => {
    setLoading(true)
    try {
      const response = await fetch(`/api/empresas/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao excluir empresa')
      }

      toast.success('Empresa excluída com sucesso!')
    } catch (error) {
      console.error('Erro ao excluir empresa:', error)
      toast.error(error instanceof Error ? error.message : 'Erro ao excluir empresa')
      throw error
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    loading,
    empresas,
    listarEmpresas,
    buscarEmpresaPorId,
    buscarEmpresaPorCnpj,
    consultarCnpj,
    criarEmpresa,
    criarEmpresaPorCnpj,
    atualizarEmpresa,
    excluirEmpresa,
  }
}
