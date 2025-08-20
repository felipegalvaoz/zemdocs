"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Eye, Edit, MoreHorizontal } from "lucide-react"
import { useEffect, useState } from "react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

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
}

export function EmpresasTable() {
  const [empresas, setEmpresas] = useState<Empresa[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    const fetchEmpresas = async () => {
      try {
        // TODO: Substituir por chamada real à API
        // const response = await fetch('/api/v1/empresas')
        // const data = await response.json()
        
        // Dados simulados
        const mockData: Empresa[] = [
          {
            id: 1,
            cnpj: "34.194.865/0001-58",
            razao_social: "S. E. L. DE SOUZA SUARES VEICULOS",
            nome_fantasia: "SUARES VEÍCULOS",
            situacao_cadastral: "ATIVA",
            porte: "MICRO EMPRESA",
            municipio: "IMPERATRIZ",
            uf: "MA",
            data_abertura: "2015-03-15"
          },
          {
            id: 2,
            cnpj: "12.345.678/0001-90",
            razao_social: "TECH SOLUTIONS LTDA",
            nome_fantasia: "TECH SOLUTIONS",
            situacao_cadastral: "ATIVA",
            porte: "PEQUENO PORTE",
            municipio: "SÃO LUÍS",
            uf: "MA",
            data_abertura: "2020-08-22"
          },
          {
            id: 3,
            cnpj: "98.765.432/0001-10",
            razao_social: "CONSULTORIA XYZ LTDA",
            nome_fantasia: "CONSULTORIA XYZ",
            situacao_cadastral: "ATIVA",
            porte: "MICRO EMPRESA",
            municipio: "IMPERATRIZ",
            uf: "MA",
            data_abertura: "2018-11-05"
          },
          {
            id: 4,
            cnpj: "11.222.333/0001-44",
            razao_social: "SERVIÇOS GERAIS LTDA",
            nome_fantasia: "SERVIÇOS GERAIS",
            situacao_cadastral: "SUSPENSA",
            porte: "MICRO EMPRESA",
            municipio: "AÇAILÂNDIA",
            uf: "MA",
            data_abertura: "2019-02-10"
          }
        ]
        
        setEmpresas(mockData)
      } catch (error) {
        console.error('Erro ao buscar empresas:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchEmpresas()
  }, [])

  const filteredEmpresas = empresas.filter(empresa =>
    empresa.razao_social.toLowerCase().includes(searchTerm.toLowerCase()) ||
    empresa.cnpj.includes(searchTerm) ||
    empresa.nome_fantasia.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getSituacaoVariant = (situacao: string) => {
    switch (situacao) {
      case "ATIVA":
        return "default"
      case "SUSPENSA":
        return "secondary"
      case "BAIXADA":
        return "destructive"
      default:
        return "outline"
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR')
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Empresas</CardTitle>
          <CardDescription>
            Gerenciar empresas cadastradas no sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="h-10 bg-muted rounded animate-pulse" />
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
        <CardTitle>Empresas</CardTitle>
        <CardDescription>
          Gerenciar empresas cadastradas no sistema
        </CardDescription>
      </CardHeader>
      <CardContent className="px-0">
        <div className="space-y-4">
          <div className="flex items-center space-x-2 px-6">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por razão social, CNPJ ou nome fantasia..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>CNPJ</TableHead>
                  <TableHead>Razão Social</TableHead>
                  <TableHead>Nome Fantasia</TableHead>
                  <TableHead>Situação</TableHead>
                  <TableHead>Porte</TableHead>
                  <TableHead>Localização</TableHead>
                  <TableHead>Data Abertura</TableHead>
                  <TableHead className="w-[70px]">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEmpresas.map((empresa) => (
                  <TableRow key={empresa.id}>
                    <TableCell className="font-mono text-sm">
                      {empresa.cnpj}
                    </TableCell>
                    <TableCell className="font-medium">
                      {empresa.razao_social}
                    </TableCell>
                    <TableCell>
                      {empresa.nome_fantasia || "-"}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getSituacaoVariant(empresa.situacao_cadastral)}>
                        {empresa.situacao_cadastral}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">
                      {empresa.porte}
                    </TableCell>
                    <TableCell className="text-sm">
                      {empresa.municipio}/{empresa.uf}
                    </TableCell>
                    <TableCell className="text-sm">
                      {formatDate(empresa.data_abertura)}
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
                            <Edit className="mr-2 h-4 w-4" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600">
                            Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredEmpresas.length === 0 && (
            <div className="text-center py-8 text-muted-foreground px-6">
              Nenhuma empresa encontrada
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
