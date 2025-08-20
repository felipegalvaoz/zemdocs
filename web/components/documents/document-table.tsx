"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Eye, Download, MoreHorizontal, FileText } from "lucide-react"
import { useEffect, useState } from "react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface Document {
  id: number
  document_type: string
  numero_documento: string
  codigo_verificacao: string
  razao_social_emitente: string
  razao_social_destinatario: string
  valor_nota: number
  data_emissao: string
  status: string
  competencia: string
}

export function DocumentTable() {
  const [documentList, setDocumentList] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        // TODO: Substituir por chamada real à API
        // const response = await fetch('/api/v1/documents')
        // const data = await response.json()

        // Dados simulados
        const mockData: Document[] = [
          {
            id: 1,
            document_type: "NFS-e",
            numero_documento: "240000065",
            codigo_verificacao: "daa9549a4e9ceadd0b18d84f60a41906",
            razao_social_emitente: "S. E. L. DE SOUZA SUARES VEICULOS",
            razao_social_destinatario: "BANCO VOTORANTIM S.A.",
            valor_nota: 12525.54,
            data_emissao: "2024-08-22T09:44:48Z",
            status: "Emitida",
            competencia: "202408"
          },
          {
            id: 2,
            document_type: "NF-e",
            numero_documento: "240000064",
            codigo_verificacao: "abc123def456ghi789jkl012mno345pqr",
            razao_social_emitente: "TECH SOLUTIONS LTDA",
            razao_social_destinatario: "EMPRESA ABC LTDA",
            valor_nota: 8750.00,
            data_emissao: "2024-08-21T14:30:22Z",
            status: "Emitida",
            competencia: "202408"
          },
          {
            id: 3,
            document_type: "NFS-e",
            numero_documento: "240000063",
            codigo_verificacao: "xyz789abc123def456ghi789jkl012mno",
            razao_social_emitente: "CONSULTORIA XYZ",
            razao_social_destinatario: "INDUSTRIA DEF S.A.",
            valor_nota: 15200.75,
            data_emissao: "2024-08-21T11:15:10Z",
            status: "Emitida",
            competencia: "202408"
          },
          {
            id: 4,
            document_type: "CT-e",
            numero_documento: "240000062",
            codigo_verificacao: "def456ghi789jkl012mno345pqr678stu",
            razao_social_emitente: "SERVIÇOS GERAIS LTDA",
            razao_social_destinatario: "COMERCIO GHI LTDA",
            valor_nota: 3450.00,
            data_emissao: "2024-08-20T16:45:33Z",
            status: "Cancelada",
            competencia: "202408"
          },
          {
            id: 5,
            document_type: "NFS-e",
            numero_documento: "240000061",
            codigo_verificacao: "ghi789jkl012mno345pqr678stu901vwx",
            razao_social_emitente: "DESENVOLVIMENTO WEB",
            razao_social_destinatario: "STARTUP JKL",
            valor_nota: 22100.00,
            data_emissao: "2024-08-20T10:20:15Z",
            status: "Emitida",
            competencia: "202408"
          }
        ]

        setDocumentList(mockData)
      } catch (error) {
        console.error('Erro ao buscar documentos:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchDocuments()
  }, [])

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "Emitida":
        return "default"
      case "Cancelada":
        return "destructive"
      case "Substituída":
        return "secondary"
      default:
        return "outline"
    }
  }

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

  const formatCompetencia = (competencia: string) => {
    if (competencia.length === 6) {
      const mes = competencia.substring(4, 6)
      const ano = competencia.substring(0, 4)
      return `${mes}/${ano}`
    }
    return competencia
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Documentos Fiscais</CardTitle>
          <CardDescription>
            Lista de documentos fiscais eletrônicos (NFS-e, NF-e, CT-e, MDF-e, NFC-e)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-muted rounded animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>NFS-e</CardTitle>
        <CardDescription>
          Lista de notas fiscais de serviço eletrônicas
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tipo</TableHead>
              <TableHead>Número</TableHead>
              <TableHead>Emitente</TableHead>
              <TableHead>Destinatário</TableHead>
              <TableHead>Valor</TableHead>
              <TableHead>Data Emissão</TableHead>
              <TableHead>Competência</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[70px]">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {documentList.map((document) => (
              <TableRow key={document.id}>
                <TableCell>
                  <Badge variant="outline">
                    {document.document_type}
                  </Badge>
                </TableCell>
                <TableCell className="font-mono text-sm">
                  {document.numero_documento}
                </TableCell>
                <TableCell className="max-w-[200px] truncate">
                  {document.razao_social_emitente}
                </TableCell>
                <TableCell className="max-w-[200px] truncate">
                  {document.razao_social_destinatario || "-"}
                </TableCell>
                <TableCell className="font-medium">
                  {formatCurrency(document.valor_nota)}
                </TableCell>
                <TableCell className="text-sm">
                  {formatDate(document.data_emissao)}
                </TableCell>
                <TableCell className="text-sm">
                  {formatCompetencia(document.competencia)}
                </TableCell>
                <TableCell>
                  <Badge variant={getStatusVariant(document.status)}>
                    {document.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Ações</DropdownMenuLabel>
                      <DropdownMenuItem>
                        <Eye className="mr-2 h-4 w-4" />
                        Visualizar
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Download className="mr-2 h-4 w-4" />
                        Baixar XML
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <FileText className="mr-2 h-4 w-4" />
                        Gerar PDF
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-red-600">
                        Cancelar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        
        {documentList.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            Nenhum documento encontrado
          </div>
        )}
      </CardContent>
    </Card>
  )
}
