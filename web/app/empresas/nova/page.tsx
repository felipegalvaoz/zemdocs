"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { AppSidebar } from "@/components/app-sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Search, Building2, MapPin, Phone, Mail, Calendar, Users, FileText } from "lucide-react"
import { toast } from "sonner"
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

interface CNPJData {
  taxId: string
  alias: string
  founded: string
  head: boolean
  company: {
    id: number
    name: string
    equity: number
    nature: {
      id: number
      text: string
    }
    size: {
      id: number
      acronym: string
      text: string
    }
    simples: {
      optant: boolean
      since: string | null
    }
    simei: {
      optant: boolean
      since: string | null
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
  status: {
    id: number
    text: string
  }
  statusDate: string
  address: {
    municipality: number
    street: string
    number: string
    district: string
    city: string
    state: string
    details: string | null
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
  sideActivities: Array<{
    id: number
    text: string
  }>
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
  registrations?: Array<{
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

export default function NovaEmpresaPage() {
  const router = useRouter()
  const [cnpj, setCnpj] = useState("")
  const [cnpjData, setCnpjData] = useState<CNPJData | null>(null)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  // Função para formatar CNPJ
  const formatCNPJ = (value: string) => {
    const numbers = value.replace(/\D/g, "")
    if (numbers.length <= 14) {
      return numbers.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5")
    }
    return value
  }

  // Função para consultar CNPJ na API
  const consultarCNPJ = async () => {
    if (!cnpj || cnpj.replace(/\D/g, "").length !== 14) {
      toast.error("Digite um CNPJ válido com 14 dígitos")
      return
    }

    setLoading(true)
    try {
      const cnpjLimpo = cnpj.replace(/\D/g, "")

      // Consultar API CNPJA diretamente
      const response = await fetch(`https://open.cnpja.com/office/${cnpjLimpo}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'ZemDocs/1.0'
        }
      })

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("CNPJ não encontrado")
        } else if (response.status === 429) {
          throw new Error("Limite de consultas excedido. Tente novamente em alguns minutos")
        } else {
          throw new Error(`Erro na consulta: ${response.status}`)
        }
      }

      const data = await response.json()
      setCnpjData(data)
      toast.success("Dados do CNPJ consultados com sucesso!")
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Erro desconhecido"
      toast.error(`Erro ao consultar CNPJ: ${errorMessage}`)
      console.error("Erro:", error)
    } finally {
      setLoading(false)
    }
  }

  // Função para salvar empresa
  const salvarEmpresa = async () => {
    if (!cnpjData) {
      toast.error("Consulte um CNPJ primeiro")
      return
    }

    setSaving(true)
    try {
      // Simular salvamento da empresa
      await new Promise(resolve => setTimeout(resolve, 2000))

      toast.success("Empresa cadastrada com sucesso! (Simulação)")
      router.push("/empresas")
    } catch (error) {
      toast.error("Erro ao salvar empresa. Tente novamente.")
      console.error("Erro:", error)
    } finally {
      setSaving(false)
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return "-"
    return new Date(dateString).toLocaleDateString('pt-BR')
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="/empresas">Empresas</BreadcrumbLink>
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
            <div>
              <h2 className="text-3xl font-bold tracking-tight">Nova Empresa</h2>
              <p className="text-muted-foreground">
                Consulte um CNPJ para preencher automaticamente os dados da empresa
              </p>
            </div>
          </div>

      <div className="grid gap-6">
        {/* Consulta CNPJ */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Consultar CNPJ
            </CardTitle>
            <CardDescription>
              Digite o CNPJ da empresa para buscar os dados automaticamente
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-1">
                <Label htmlFor="cnpj">CNPJ</Label>
                <Input
                  id="cnpj"
                  placeholder="00.000.000/0000-00"
                  value={cnpj}
                  onChange={(e) => setCnpj(formatCNPJ(e.target.value))}
                  maxLength={18}
                />
              </div>
              <div className="flex items-end">
                <Button 
                  onClick={consultarCNPJ} 
                  disabled={loading}
                  className="min-w-[120px]"
                >
                  {loading ? "Consultando..." : "Consultar"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Dados da Empresa */}
        {cnpjData && (
          <div className="grid gap-6">
            {/* Informações Básicas */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Informações da Empresa
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>CNPJ</Label>
                    <p className="text-sm font-mono">{cnpjData.cnpj}</p>
                  </div>
                  <div>
                    <Label>Situação</Label>
                    <div className="flex items-center gap-2">
                      <Badge variant={cnpjData.situacao_cadastral.codigo === "02" ? "default" : "destructive"}>
                        {cnpjData.situacao_cadastral.descricao}
                      </Badge>
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <Label>Razão Social</Label>
                    <p className="text-sm font-medium">{cnpjData.razao_social}</p>
                  </div>
                  {cnpjData.nome_fantasia && (
                    <div className="md:col-span-2">
                      <Label>Nome Fantasia</Label>
                      <p className="text-sm">{cnpjData.nome_fantasia}</p>
                    </div>
                  )}
                  <div>
                    <Label>Data de Abertura</Label>
                    <p className="text-sm">{formatDate(cnpjData.data_abertura)}</p>
                  </div>
                  <div>
                    <Label>Porte</Label>
                    <p className="text-sm">{cnpjData.porte.descricao}</p>
                  </div>
                  <div className="md:col-span-2">
                    <Label>Natureza Jurídica</Label>
                    <p className="text-sm">{cnpjData.natureza_juridica.descricao}</p>
                  </div>
                  {cnpjData.capital_social > 0 && (
                    <div>
                      <Label>Capital Social</Label>
                      <p className="text-sm">{formatCurrency(cnpjData.capital_social)}</p>
                    </div>
                  )}
                  <div>
                    <Label>Simples Nacional</Label>
                    <Badge variant={cnpjData.simples_nacional.optante ? "default" : "secondary"}>
                      {cnpjData.simples_nacional.optante ? "Optante" : "Não Optante"}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Endereço */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Endereço
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <Label>Logradouro</Label>
                    <p className="text-sm">{cnpjData.endereco.logradouro}, {cnpjData.endereco.numero}</p>
                    {cnpjData.endereco.complemento && (
                      <p className="text-sm text-muted-foreground">{cnpjData.endereco.complemento}</p>
                    )}
                  </div>
                  <div>
                    <Label>Bairro</Label>
                    <p className="text-sm">{cnpjData.endereco.bairro}</p>
                  </div>
                  <div>
                    <Label>CEP</Label>
                    <p className="text-sm font-mono">{cnpjData.endereco.cep}</p>
                  </div>
                  <div>
                    <Label>Município</Label>
                    <p className="text-sm">{cnpjData.endereco.municipio}</p>
                  </div>
                  <div>
                    <Label>UF</Label>
                    <p className="text-sm">{cnpjData.endereco.uf}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contato */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="h-5 w-5" />
                  Contato
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {cnpjData.telefones.length > 0 && (
                    <div>
                      <Label>Telefone</Label>
                      <p className="text-sm">({cnpjData.telefones[0].ddd}) {cnpjData.telefones[0].numero}</p>
                    </div>
                  )}
                  {cnpjData.email && (
                    <div>
                      <Label>E-mail</Label>
                      <p className="text-sm">{cnpjData.email}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Atividades */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Atividades Econômicas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Atividade Principal</Label>
                  <p className="text-sm">
                    <span className="font-mono text-xs">{cnpjData.atividade_principal.codigo}</span> - {cnpjData.atividade_principal.descricao}
                  </p>
                </div>
                {cnpjData.atividades_secundarias.length > 0 && (
                  <div>
                    <Label>Atividades Secundárias</Label>
                    <div className="space-y-2 mt-2">
                      {cnpjData.atividades_secundarias.slice(0, 5).map((atividade, index) => (
                        <p key={index} className="text-sm">
                          <span className="font-mono text-xs">{atividade.codigo}</span> - {atividade.descricao}
                        </p>
                      ))}
                      {cnpjData.atividades_secundarias.length > 5 && (
                        <p className="text-sm text-muted-foreground">
                          + {cnpjData.atividades_secundarias.length - 5} outras atividades
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Ações */}
            <div className="flex justify-end gap-4">
              <Button variant="outline" onClick={() => router.push("/empresas")}>
                Cancelar
              </Button>
              <Button onClick={salvarEmpresa} disabled={saving}>
                {saving ? "Salvando..." : "Salvar Empresa"}
              </Button>
            </div>
          </div>
        )}
        </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
