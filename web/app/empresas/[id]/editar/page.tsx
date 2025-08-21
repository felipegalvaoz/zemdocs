"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { toast } from "sonner"
import { ArrowLeft, Building2, Loader2, Save } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
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
import { useEmpresas, type Empresa, type EmpresaUpdateRequest } from "@/hooks/use-empresas"

export default function EditarEmpresaPage() {
  const router = useRouter()
  const params = useParams()
  const empresaId = parseInt(params.id as string)
  
  const { buscarEmpresaPorId, atualizarEmpresa, loading } = useEmpresas()
  
  const [empresa, setEmpresa] = useState<Empresa | null>(null)
  const [formData, setFormData] = useState<EmpresaUpdateRequest>({
    razao_social: "",
    nome_fantasia: "",
    email: "",
    telefone: "",
    ativa: true
  })

  // Carregar dados da empresa
  useEffect(() => {
    const loadEmpresa = async () => {
      try {
        const data = await buscarEmpresaPorId(empresaId)
        setEmpresa(data)
        setFormData({
          razao_social: data.razao_social,
          nome_fantasia: data.nome_fantasia,
          email: data.email || "",
          telefone: data.telefone || "",
          ativa: true // Assumir ativa por padrão
        })
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

  // Função para atualizar campos do formulário
  const updateFormData = (field: keyof EmpresaUpdateRequest, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  // Função para salvar alterações
  const handleSalvarEmpresa = async () => {
    if (!formData.razao_social) {
      toast.error("Razão Social é obrigatória")
      return
    }

    try {
      await atualizarEmpresa(empresaId, formData)
      router.push("/empresas")
    } catch (error) {
      console.error("Erro ao atualizar empresa:", error)
    }
  }

  if (loading && !empresa) {
    return (
      <SidebarProvider>
        <SidebarInset>
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </SidebarInset>
      </SidebarProvider>
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
                  <BreadcrumbLink href="/empresas">
                    Empresas
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Editar Empresa</BreadcrumbPage>
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
              <h1 className="text-2xl font-bold">Editar Empresa</h1>
            </div>
          </div>

          <div className="grid gap-6 max-w-4xl">
            {/* Informações da Empresa */}
            {empresa && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    Informações da Empresa
                  </CardTitle>
                  <CardDescription>
                    CNPJ: {empresa.cnpj}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <Label htmlFor="razao_social">Razão Social *</Label>
                      <Input
                        id="razao_social"
                        value={formData.razao_social}
                        onChange={(e) => updateFormData('razao_social', e.target.value)}
                        placeholder="EMPRESA EXEMPLO LTDA"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label htmlFor="nome_fantasia">Nome Fantasia</Label>
                      <Input
                        id="nome_fantasia"
                        value={formData.nome_fantasia}
                        onChange={(e) => updateFormData('nome_fantasia', e.target.value)}
                        placeholder="EXEMPLO"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">E-mail</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => updateFormData('email', e.target.value)}
                        placeholder="contato@exemplo.com.br"
                      />
                    </div>
                    <div>
                      <Label htmlFor="telefone">Telefone</Label>
                      <Input
                        id="telefone"
                        value={formData.telefone}
                        onChange={(e) => updateFormData('telefone', e.target.value)}
                        placeholder="(98) 3234-5678"
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="ativa"
                        checked={formData.ativa}
                        onCheckedChange={(checked) => updateFormData('ativa', checked)}
                      />
                      <Label htmlFor="ativa">Empresa Ativa</Label>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-4">
                    <Link href="/empresas">
                      <Button variant="outline">Cancelar</Button>
                    </Link>
                    <Button 
                      onClick={handleSalvarEmpresa} 
                      disabled={loading}
                      className="gap-2"
                    >
                      {loading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Save className="h-4 w-4" />
                      )}
                      Salvar Alterações
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Informações Adicionais */}
            {empresa && (
              <Card>
                <CardHeader>
                  <CardTitle>Informações Adicionais</CardTitle>
                  <CardDescription>
                    Dados obtidos da consulta CNPJ (somente leitura)
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Data de Abertura</Label>
                      <p className="text-sm text-muted-foreground">
                        {new Date(empresa.data_abertura).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    <div>
                      <Label>Porte</Label>
                      <p className="text-sm text-muted-foreground">{empresa.porte}</p>
                    </div>
                    <div>
                      <Label>Situação Cadastral</Label>
                      <p className="text-sm text-muted-foreground">{empresa.situacao_cadastral}</p>
                    </div>
                    <div>
                      <Label>Atividade Principal</Label>
                      <p className="text-sm text-muted-foreground">{empresa.atividade_principal}</p>
                    </div>
                    {empresa.endereco && (
                      <>
                        <div className="md:col-span-2">
                          <Label>Endereço</Label>
                          <p className="text-sm text-muted-foreground">
                            {empresa.endereco.logradouro}, {empresa.endereco.numero}
                            {empresa.endereco.complemento && `, ${empresa.endereco.complemento}`}
                            <br />
                            {empresa.endereco.bairro} - {empresa.endereco.municipio}/{empresa.endereco.uf}
                            <br />
                            CEP: {empresa.endereco.cep}
                          </p>
                        </div>
                      </>
                    )}
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
