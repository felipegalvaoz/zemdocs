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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
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
import { useEmpresas, type CNPJData, type EmpresaCreateRequest } from "@/hooks/use-empresas"
import { AppSidebar } from "@/components/app-sidebar"

export default function NovaEmpresaPage() {
  const router = useRouter()
  const { consultarCnpj, criarEmpresa, criarEmpresaPorCnpj, loading } = useEmpresas()
  
  const [cnpj, setCnpj] = useState("")
  const [cnpjData, setCnpjData] = useState<CNPJData | null>(null)
  const [showDuplicateDialog, setShowDuplicateDialog] = useState(false)
  const [duplicateError, setDuplicateError] = useState("")
  const [formData, setFormData] = useState<EmpresaCreateRequest>({
    // Dados básicos
    cnpj: "",
    inscricao_estadual: "",
    inscricao_municipal: "",
    razao_social: "",
    nome_fantasia: "",
    data_abertura: "",
    porte: "",
    natureza_juridica: "",
    atividade_principal: "",
    situacao_cadastral: "",

    // Endereço
    logradouro: "",
    numero: "",
    complemento: "",
    cep: "",
    bairro: "",
    municipio: "",
    uf: "",

    // Contato
    email: "",
    telefone: "",

    // Dados adicionais
    capital_social: 0,
    simples_nacional: false,
    mei: false,
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
      const novoFormData: EmpresaCreateRequest = {
        // Dados básicos
        cnpj: data.taxId || cnpj,
        inscricao_estadual: "",
        inscricao_municipal: "",
        razao_social: data.company?.name || "",
        nome_fantasia: data.alias || "",
        data_abertura: data.founded || "",
        porte: data.company?.size?.text || "",
        natureza_juridica: data.company?.nature?.text || "",
        atividade_principal: data.mainActivity?.text || "",
        situacao_cadastral: data.status?.text || "",

        // Endereço
        logradouro: data.address?.street || "",
        numero: data.address?.number || "",
        complemento: data.address?.details || "",
        cep: data.address?.zip || "",
        bairro: data.address?.district || "",
        municipio: data.address?.city || "",
        uf: data.address?.state || "",

        // Contato
        email: data.emails?.[0]?.address || "",
        telefone: data.phones?.[0] ? `(${data.phones[0].area}) ${data.phones[0].number}` : "",

        // Dados adicionais
        capital_social: data.company?.equity || 0,
        simples_nacional: data.company?.simples?.optant || false,
        mei: data.company?.simei?.optant || false,
        ativa: data.status?.id === 2 // 2 = Ativa na API CNPJA
      }

      setFormData(novoFormData)
      toast.success("CNPJ consultado! Dados preenchidos automaticamente.")
    } catch (error) {
      console.error("Erro ao consultar CNPJ:", error)
    }
  }

  // Função para atualizar campos do formulário
  const updateFormData = (field: keyof EmpresaCreateRequest, value: string | boolean | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  // Função para salvar empresa
  const handleSalvarEmpresa = async () => {
    // Validações básicas
    if (!formData.cnpj || formData.cnpj.replace(/\D/g, "").length !== 14) {
      toast.error("CNPJ é obrigatório e deve ter 14 dígitos")
      return
    }

    if (!formData.razao_social.trim()) {
      toast.error("Razão Social é obrigatória")
      return
    }

    try {
      await criarEmpresa(formData)
      toast.success("Empresa criada com sucesso!")
      router.push("/empresas")
    } catch (error) {
      console.log("Erro capturado:", error)
      console.log("Mensagem do erro:", error instanceof Error ? error.message : "Não é Error")

      // Verificar se é erro de empresa duplicada
      if (error instanceof Error &&
          (error.message.includes('já existe') ||
           error.message.includes('já está cadastrada') ||
           error.message.includes('duplicate key'))) {
        console.log("Detectado erro de duplicata, abrindo dialog")
        setDuplicateError(`A empresa com CNPJ ${formData.cnpj} já está cadastrada no sistema.`)
        setShowDuplicateDialog(true)
      }
      // Outros erros já são tratados pelo hook useEmpresas
    }
  }

  // Função para criar empresa diretamente por CNPJ
  const handleCriarPorCNPJ = async () => {
    if (!cnpj || cnpj.replace(/\D/g, "").length !== 14) {
      toast.error("Digite um CNPJ válido com 14 dígitos")
      return
    }

    try {
      const empresa = await criarEmpresaPorCnpj(cnpj)
      toast.success(`Empresa ${empresa.razao_social} criada com sucesso!`)
      router.push("/empresas")
    } catch (error) {
      console.log("Erro capturado (criar por CNPJ):", error)
      console.log("Mensagem do erro:", error instanceof Error ? error.message : "Não é Error")

      // Verificar se é erro de empresa duplicada
      if (error instanceof Error &&
          (error.message.includes('já existe') ||
           error.message.includes('já está cadastrada') ||
           error.message.includes('duplicate key'))) {
        console.log("Detectado erro de duplicata (criar por CNPJ), abrindo dialog")
        setDuplicateError(`A empresa com CNPJ ${cnpj} já está cadastrada no sistema.`)
        setShowDuplicateDialog(true)
      }
      // Outros erros já são tratados pelo hook useEmpresas
    }
  }

  return (
    <SidebarWrapper>
      <AppSidebar />
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

          <div className="grid gap-6 max-w-6xl">
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
              <CardContent className="space-y-6">
                {/* Dados Básicos */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Dados Básicos</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                    <div>
                      <Label htmlFor="inscricao_estadual">Inscrição Estadual</Label>
                      <Input
                        id="inscricao_estadual"
                        value={formData.inscricao_estadual}
                        onChange={(e) => updateFormData('inscricao_estadual', e.target.value)}
                        placeholder="123456789"
                      />
                    </div>
                    <div>
                      <Label htmlFor="inscricao_municipal">Inscrição Municipal</Label>
                      <Input
                        id="inscricao_municipal"
                        value={formData.inscricao_municipal}
                        onChange={(e) => updateFormData('inscricao_municipal', e.target.value)}
                        placeholder="123456"
                      />
                    </div>
                    <div className="md:col-span-2 lg:col-span-3">
                      <Label htmlFor="razao_social">Razão Social *</Label>
                      <Input
                        id="razao_social"
                        value={formData.razao_social}
                        onChange={(e) => updateFormData('razao_social', e.target.value)}
                        placeholder="EMPRESA EXEMPLO LTDA"
                      />
                    </div>
                    <div className="md:col-span-2 lg:col-span-3">
                      <Label htmlFor="nome_fantasia">Nome Fantasia</Label>
                      <Input
                        id="nome_fantasia"
                        value={formData.nome_fantasia}
                        onChange={(e) => updateFormData('nome_fantasia', e.target.value)}
                        placeholder="EXEMPLO"
                      />
                    </div>
                    <div>
                      <Label htmlFor="data_abertura">Data de Abertura</Label>
                      <Input
                        id="data_abertura"
                        type="date"
                        value={formData.data_abertura}
                        onChange={(e) => updateFormData('data_abertura', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="porte">Porte</Label>
                      <Input
                        id="porte"
                        value={formData.porte}
                        onChange={(e) => updateFormData('porte', e.target.value)}
                        placeholder="Microempresa"
                      />
                    </div>
                    <div>
                      <Label htmlFor="situacao_cadastral">Situação Cadastral</Label>
                      <Input
                        id="situacao_cadastral"
                        value={formData.situacao_cadastral}
                        onChange={(e) => updateFormData('situacao_cadastral', e.target.value)}
                        placeholder="Ativa"
                      />
                    </div>
                    <div className="md:col-span-2 lg:col-span-3">
                      <Label htmlFor="natureza_juridica">Natureza Jurídica</Label>
                      <Input
                        id="natureza_juridica"
                        value={formData.natureza_juridica}
                        onChange={(e) => updateFormData('natureza_juridica', e.target.value)}
                        placeholder="Sociedade Empresária Limitada"
                      />
                    </div>
                    <div className="md:col-span-2 lg:col-span-3">
                      <Label htmlFor="atividade_principal">Atividade Principal</Label>
                      <Input
                        id="atividade_principal"
                        value={formData.atividade_principal}
                        onChange={(e) => updateFormData('atividade_principal', e.target.value)}
                        placeholder="Atividades de consultoria em gestão empresarial"
                      />
                    </div>
                  </div>
                </div>

                {/* Endereço */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Endereço</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="lg:col-span-2">
                      <Label htmlFor="logradouro">Logradouro</Label>
                      <Input
                        id="logradouro"
                        value={formData.logradouro}
                        onChange={(e) => updateFormData('logradouro', e.target.value)}
                        placeholder="Rua das Flores"
                      />
                    </div>
                    <div>
                      <Label htmlFor="numero">Número</Label>
                      <Input
                        id="numero"
                        value={formData.numero}
                        onChange={(e) => updateFormData('numero', e.target.value)}
                        placeholder="123"
                      />
                    </div>
                    <div>
                      <Label htmlFor="complemento">Complemento</Label>
                      <Input
                        id="complemento"
                        value={formData.complemento}
                        onChange={(e) => updateFormData('complemento', e.target.value)}
                        placeholder="Sala 101"
                      />
                    </div>
                    <div>
                      <Label htmlFor="cep">CEP</Label>
                      <Input
                        id="cep"
                        value={formData.cep}
                        onChange={(e) => updateFormData('cep', e.target.value)}
                        placeholder="65000-000"
                      />
                    </div>
                    <div>
                      <Label htmlFor="bairro">Bairro</Label>
                      <Input
                        id="bairro"
                        value={formData.bairro}
                        onChange={(e) => updateFormData('bairro', e.target.value)}
                        placeholder="Centro"
                      />
                    </div>
                    <div>
                      <Label htmlFor="municipio">Município</Label>
                      <Input
                        id="municipio"
                        value={formData.municipio}
                        onChange={(e) => updateFormData('municipio', e.target.value)}
                        placeholder="São Luís"
                      />
                    </div>
                    <div>
                      <Label htmlFor="uf">UF</Label>
                      <Input
                        id="uf"
                        value={formData.uf}
                        onChange={(e) => updateFormData('uf', e.target.value)}
                        placeholder="MA"
                        maxLength={2}
                      />
                    </div>
                  </div>
                </div>

                {/* Contato */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Contato</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                </div>

                {/* Dados Adicionais */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Dados Adicionais</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="capital_social">Capital Social</Label>
                      <Input
                        id="capital_social"
                        type="number"
                        step="0.01"
                        value={formData.capital_social}
                        onChange={(e) => updateFormData('capital_social', parseFloat(e.target.value) || 0)}
                        placeholder="10000.00"
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="simples_nacional"
                        checked={formData.simples_nacional}
                        onCheckedChange={(checked) => updateFormData('simples_nacional', checked)}
                      />
                      <Label htmlFor="simples_nacional">Simples Nacional</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="mei"
                        checked={formData.mei}
                        onCheckedChange={(checked) => updateFormData('mei', checked)}
                      />
                      <Label htmlFor="mei">MEI</Label>
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

      {/* AlertDialog para empresa duplicada */}
      <AlertDialog open={showDuplicateDialog} onOpenChange={setShowDuplicateDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>⚠️ Empresa já cadastrada</AlertDialogTitle>
            <AlertDialogDescription>
              {duplicateError}
              <br /><br />
              Você pode visualizar a empresa existente na listagem ou tentar cadastrar uma empresa diferente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Fechar</AlertDialogCancel>
            <AlertDialogAction onClick={() => router.push('/empresas')}>
              Ver Listagem
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </SidebarWrapper>
  )
}
