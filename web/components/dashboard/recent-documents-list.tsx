"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useEffect, useState } from "react"

interface DocumentItem {
  id: string
  document_type: string
  numero_documento: string
  razao_social_emitente: string
  razao_social_destinatario: string
  valor_nota: number
  data_emissao: string
  status: string
}

export function RecentDocumentsList() {
  const [documentList, setDocumentList] = useState<DocumentItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchRecentDocuments = async () => {
      try {
        const response = await fetch('/api/documents/recent')
        const data = await response.json()

        setDocumentList(data.documents || [])
      } catch (error) {
        console.error('Erro ao buscar documentos recentes:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchRecentDocuments()
  }, [])

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const getInitials = (name: string) => {
    if (!name || typeof name !== 'string') {
      return 'ND' // "Não Definido"
    }
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .substring(0, 2)
      .toUpperCase()
  }

  if (loading) {
    return (
      <Card className="col-span-3">
        <CardHeader>
          <CardTitle>NFS-e Recentes</CardTitle>
          <CardDescription>
            Últimas notas fiscais emitidas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <div className="w-9 h-9 bg-muted rounded-full animate-pulse" />
                <div className="space-y-1 flex-1">
                  <div className="h-4 bg-muted rounded animate-pulse" />
                  <div className="h-3 bg-muted rounded w-2/3 animate-pulse" />
                </div>
                <div className="h-4 bg-muted rounded w-16 animate-pulse" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="col-span-3">
      <CardHeader>
        <CardTitle>Documentos Recentes</CardTitle>
        <CardDescription>
          Últimos documentos fiscais emitidos
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {documentList.map((document) => (
            <div key={document.id} className="flex items-center space-x-4">
              <Avatar className="h-9 w-9">
                <AvatarFallback className="text-xs">
                  {getInitials(document.razao_social_emitente)}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-1 flex-1 min-w-0">
                <p className="text-sm font-medium leading-none truncate">
                  {document.document_type || 'N/A'} {document.numero_documento || 'N/A'}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {document.razao_social_destinatario || 'Não informado'}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatDate(document.data_emissao)}
                </p>
              </div>
              <div className="text-right space-y-1">
                <div className="text-sm font-medium">
                  {formatCurrency(document.valor_nota)}
                </div>
                <Badge variant="secondary" className="text-xs">
                  {document.status}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
