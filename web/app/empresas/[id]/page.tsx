"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { toast } from "sonner"
import { ArrowLeft, Building2, Loader2, Edit, Trash2 } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import {
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { SidebarWrapper } from "@/components/sidebar-wrapper"
import { useEmpresas, type Empresa } from "@/hooks/use-empresas"

export default function VisualizarEmpresaPage() {
  const router = useRouter()
  const params = useParams()
  const empresaId = parseInt(params.id as string)
  
  const { buscarEmpresaPorId, excluirEmpresa, loading } = useEmpresas()
  const [empresa, setEmpresa] = useState<Empresa | null>(null)

  // Carregar dados da empresa
  useEffect(() => {
    const loadEmpresa = async () => {
      try {
        const data = await buscarEmpresaPorId(empresaId)
        setEmpresa(data)
      } catch (error) {
        console.error("Erro ao carregar empresa:", error)
        toast.error("Empresa não encontrada")
        router.push("/empresas")
      }
    }

    if (empresaId) {
      loadEmpresa()
    }
  }, [empresaId, buscarEmpresaPorId, router])

  // Função para excluir empresa
  const handleExcluirEmpresa = async () => {
    try {
      await excluirEmpresa(empresaId)
      router.push("/empresas")
    } catch (error) {
      console.error("Erro ao excluir empresa:", error)
    }
  }

  if (loading && !empresa) {
    return (
      <SidebarWrapper>
        <SidebarInset>
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </SidebarInset>
      </SidebarWrapper>
    )
  }

  if (!empresa) {
    return (
      <SidebarWrapper>
        <SidebarInset>
          <div className="flex items-center justify-center h-64">
            <p>Empresa não encontrada</p>
          </div>
        </SidebarInset>
      </SidebarWrapper>
    )
  }

  return (
    <SidebarWrapper>
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink asChild>
                    <Link href="/empresas">Empresas</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>{empresa.nome_fantasia || empresa.razao_social}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>

        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Link href="/empresas">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Voltar
                </Button>
              </Link>
              <h1 className="text-2xl font-bold">{empresa.nome_fantasia || empresa.razao_social}</h1>
            </div>
            <div className="flex items-center gap-2">
              <Link href={`/empresas/${empresa.id}/editar`}>
                <Button variant="outline" size="sm">
                  <Edit className="h-4 w-4 mr-2" />
                  Editar
                </Button>
              </Link>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Excluir
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Tem certeza que deseja excluir?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Esta ação não pode ser desfeita. Isso excluirá permanentemente a empresa
                      "{empresa.razao_social}" e todos os dados relacionados.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={handleExcluirEmpresa}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Excluir
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>

          <div className="grid gap-6 max-w-4xl">
            {/* Informações Básicas */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Informações Básicas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>CNPJ</Label>
                    <p className="text-sm font-mono">{empresa.cnpj}</p>
                  </div>
                  <div>
                    <Label>Situação Cadastral</Label>
                    <div className="flex items-center gap-2">
                      <Badge variant={empresa.situacao_cadastral === "ATIVA" ? "default" : "destructive"}>
                        {empresa.situacao_cadastral}
                      </Badge>
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <Label>Razão Social</Label>
                    <p className="text-sm font-medium">{empresa.razao_social}</p>
                  </div>
                  {empresa.nome_fantasia && (
                    <div className="md:col-span-2">
                      <Label>Nome Fantasia</Label>
                      <p className="text-sm">{empresa.nome_fantasia}</p>
                    </div>
                  )}
                  <div>
                    <Label>Data de Abertura</Label>
                    <p className="text-sm">{new Date(empresa.data_abertura).toLocaleDateString('pt-BR')}</p>
                  </div>
                  <div>
                    <Label>Porte</Label>
                    <p className="text-sm">{empresa.porte}</p>
                  </div>
                  {empresa.atividade_principal && (
                    <div className="md:col-span-2">
                      <Label>Atividade Principal</Label>
                      <p className="text-sm">{empresa.atividade_principal}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Contato */}
            <Card>
              <CardHeader>
                <CardTitle>Contato</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {empresa.email && (
                    <div>
                      <Label>E-mail</Label>
                      <p className="text-sm">{empresa.email}</p>
                    </div>
                  )}
                  {empresa.telefone && (
                    <div>
                      <Label>Telefone</Label>
                      <p className="text-sm">{empresa.telefone}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Endereço */}
            {empresa.endereco && (
              <Card>
                <CardHeader>
                  <CardTitle>Endereço</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <Label>Logradouro</Label>
                      <p className="text-sm">
                        {empresa.endereco.logradouro}, {empresa.endereco.numero}
                        {empresa.endereco.complemento && `, ${empresa.endereco.complemento}`}
                      </p>
                    </div>
                    <div>
                      <Label>Bairro</Label>
                      <p className="text-sm">{empresa.endereco.bairro}</p>
                    </div>
                    <div>
                      <Label>CEP</Label>
                      <p className="text-sm">{empresa.endereco.cep}</p>
                    </div>
                    <div>
                      <Label>Município</Label>
                      <p className="text-sm">{empresa.endereco.municipio}</p>
                    </div>
                    <div>
                      <Label>UF</Label>
                      <p className="text-sm">{empresa.endereco.uf}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </SidebarInset>
    </SidebarWrapper>
  )
}
