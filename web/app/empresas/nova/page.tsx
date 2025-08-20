"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { ArrowLeft, Building2, Search, Loader2, Save } from "lucide-react"
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
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { useEmpresas, type CNPJData, type EmpresaCreateRequest } from "@/hooks/use-empresas"

export default function NovaEmpresaPage() {
  const router = useRouter()
  const { consultarCnpj, criarEmpresa, criarEmpresaPorCnpj, loading } = useEmpresas()
  
  const [cnpj, setCnpj] = useState("")
  const [cnpjData, setCnpjData] = useState<CNPJData | null>(null)
  const [formData, setFormData] = useState<EmpresaCreateRequest>({
    cnpj: "",
    razao_social: "",
    nome_fantasia: "",
    email: "",
    telefone: "",
    ativa: true
  })

  // Função para formatar CNPJ
  const formatCNPJ = (value: string) => {
    const numbers = value.replace(/\D/g, "")
    if (numbers.length <= 14) {
      return numbers.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5")
    }
    return value
  }

  // Função para consultar CNPJ e preencher formulário
  const handleConsultarCNPJ = async () => {
    if (!cnpj || cnpj.replace(/\D/g, "").length !== 14) {
      toast.error("Digite um CNPJ válido com 14 dígitos")
      return
    }

    try {
      const data = await consultarCnpj(cnpj)
      setCnpjData(data)

      // Mapear dados da API para o formulário
      const novoFormData = {
        cnpj: data.taxId || cnpj,
        razao_social: data.company?.name || "",
        nome_fantasia: data.alias || "",
        email: data.emails?.[0]?.address || "",
        telefone: data.phones?.[0] ? `(${data.phones[0].area}) ${data.phones[0].number}` : "",
        ativa: true
      }

      setFormData(novoFormData)
      toast.success("CNPJ consultado! Dados preenchidos automaticamente.")
    } catch (error) {
      console.error("Erro ao consultar CNPJ:", error)
    }
  }

  // Função para atualizar campos do formulário
  const updateFormData = (field: keyof EmpresaCreateRequest, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  // Função para salvar empresa
  const handleSalvarEmpresa = async () => {
    if (!formData.cnpj || !formData.razao_social) {
      toast.error("CNPJ e Razão Social são obrigatórios")
      return
    }

    try {
      await criarEmpresa(formData)
      router.push("/empresas")
    } catch (error) {
      console.error("Erro ao salvar empresa:", error)
    }
  }

  // Função para criar empresa diretamente por CNPJ
  const handleCriarPorCNPJ = async () => {
    if (!cnpj || cnpj.replace(/\D/g, "").length !== 14) {
      toast.error("Digite um CNPJ válido com 14 dígitos")
      return
    }

    try {
      await criarEmpresaPorCnpj(cnpj)
      router.push("/empresas")
    } catch (error) {
      console.error("Erro ao criar empresa por CNPJ:", error)
    }
  }

  return (
    <SidebarProvider>
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
                  <BreadcrumbPage>Nova Empresa</BreadcrumbPage>
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
              <h1 className="text-2xl font-bold">Nova Empresa</h1>
            </div>
          </div>

          <div className="grid gap-6 max-w-4xl">
            {/* Consulta CNPJ */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="h-5 w-5" />
                  Consultar CNPJ
                </CardTitle>
                <CardDescription>
                  Digite um CNPJ para consultar os dados automaticamente ou preencha manualmente
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Label htmlFor="cnpj-consulta">CNPJ</Label>
                    <Input
                      id="cnpj-consulta"
                      value={cnpj}
                      onChange={(e) => setCnpj(formatCNPJ(e.target.value))}
                      placeholder="00.000.000/0000-00"
                      maxLength={18}
                    />
                  </div>
                  <div className="flex items-end gap-2">
                    <Button 
                      onClick={handleConsultarCNPJ} 
                      disabled={loading}
                      className="gap-2"
                    >
                      {loading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Search className="h-4 w-4" />
                      )}
                      Consultar
                    </Button>
                    <Button 
                      onClick={handleCriarPorCNPJ} 
                      disabled={loading}
                      variant="outline"
                      className="gap-2"
                    >
                      {loading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Building2 className="h-4 w-4" />
                      )}
                      Criar Direto
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Formulário de Cadastro */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Dados da Empresa
                </CardTitle>
                <CardDescription>
                  {cnpjData ? "Dados preenchidos automaticamente. Você pode editá-los se necessário." : "Preencha os dados manualmente"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="cnpj">CNPJ *</Label>
                    <Input
                      id="cnpj"
                      value={formData.cnpj}
                      onChange={(e) => updateFormData('cnpj', formatCNPJ(e.target.value))}
                      placeholder="00.000.000/0000-00"
                      maxLength={18}
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
                    Salvar Empresa
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
