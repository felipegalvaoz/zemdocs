"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { ArrowLeft, Building2, Loader2, Save } from "lucide-react"
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
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { SidebarWrapper } from "@/components/sidebar-wrapper"
import { useEmpresas, type CNPJData, type EmpresaCreateRequest, type TelefoneForm, type EmailForm, type MembroForm, type InscricaoEstadualForm, type SuframaForm } from "@/hooks/use-empresas"
import { AppSidebar } from "@/components/app-sidebar"




// Componente para evitar erro de hidratação
function ClientOnlyWrapper({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  return <>{children}</>
}

export default function NovaEmpresaPage() {
  const router = useRouter()
  const { consultarCnpj, criarEmpresa, loading } = useEmpresas()

  const [isLoadingCnpj, setIsLoadingCnpj] = useState(false)
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
    ativa: true,

    // Listas de dados relacionados
    atividades_secundarias: [],
    membros: [],
    telefones: [],
    emails: [],
    inscricoes_estaduais: [],
    dados_suframa: []
  })

  // Function to auto-search CNPJ data
  const handleAutoSearchCNPJ = useCallback(async (cnpjDigits: string) => {
    setIsLoadingCnpj(true)
    try {
      const data = await consultarCnpj(cnpjDigits)
      setCnpjData(data)

      // Auto-populate form with retrieved data
      setFormData(prev => ({
        ...prev,
        razao_social: data.razao_social || "",
        nome_fantasia: data.nome_fantasia || "",
        data_abertura: data.data_abertura || "",
        porte: data.porte || "",
        natureza_juridica: data.natureza_juridica || "",
        atividade_principal: data.atividade_principal || "",
        situacao_cadastral: data.situacao_cadastral || "",
        logradouro: data.logradouro || "",
        numero: data.numero || "",
        complemento: data.complemento || "",
        cep: data.cep || "",
        bairro: data.bairro || "",
        municipio: data.municipio || "",
        uf: data.uf || "",
        email: data.email || "",
        telefone: data.telefone || "",
        capital_social: data.capital_social || 0,
        simples_nacional: data.simples_nacional || false,
        mei: data.mei || false,
        atividades_secundarias: data.atividades_secundarias || [],
        membros: data.membros || [],
        telefones: data.telefones || [],
        emails: data.emails || [],
        inscricoes_estaduais: data.inscricoes_estaduais || [],
        dados_suframa: data.dados_suframa || []
      }))

      toast.success("Dados da empresa carregados automaticamente!")
    } catch (error) {
      // Only show error if it's not a "not found" error
      if (error instanceof Error && !error.message.includes('não encontrada')) {
        toast.error("Erro ao consultar CNPJ. Você pode preencher os dados manualmente.")
      }
    } finally {
      setIsLoadingCnpj(false)
    }
  }, [])

  // Auto-search CNPJ when user completes 14 digits
  useEffect(() => {
    const cnpjDigits = formData.cnpj.replace(/\D/g, "")
    if (cnpjDigits.length === 14 && !isLoadingCnpj) {
      handleAutoSearchCNPJ(cnpjDigits)
    }
  }, [formData.cnpj, isLoadingCnpj, handleAutoSearchCNPJ])

  // Função para formatar CNPJ
  const formatCNPJ = (value: string) => {
    const numbers = value.replace(/\D/g, "")
    if (numbers.length <= 14) {
      return numbers.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5")
    }
    return value
  }

  // Function to update form data
  const updateFormData = (field: keyof EmpresaCreateRequest, value: unknown) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  // Function to save company
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
      // Check if it's a duplicate CNPJ error
      const errorMessage = error instanceof Error ? error.message : String(error)
      const isDuplicateError =
        errorMessage.includes('já existe') ||
        errorMessage.includes('já está cadastrada') ||
        errorMessage.includes('já cadastrada') ||
        errorMessage.includes('duplicate key') ||
        errorMessage.includes('unique constraint') ||
        errorMessage.includes('UNIQUE constraint failed') ||
        (error as { status?: number })?.status === 400 ||
        (error as { response?: { status?: number } })?.response?.status === 400

      if (isDuplicateError) {
        setDuplicateError(`Uma empresa com o CNPJ ${formData.cnpj} já está registrada no sistema.`)
        setShowDuplicateDialog(true)
      } else {
        // Show generic error for other cases
        toast.error("Erro ao criar empresa", {
          description: errorMessage || "Ocorreu um erro inesperado. Tente novamente.",
          duration: 5000,
        })
      }
    }
  }



  return (
    <ClientOnlyWrapper>
      <SidebarWrapper>
        <AppSidebar />
        <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
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

        <div className="flex flex-1 flex-col gap-4 p-4 pt-0 min-w-0">
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

          <div className="grid gap-6 w-full max-w-none">

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

                  {/* Primeira linha - CNPJ e Inscrições */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="cnpj">CNPJ *</Label>
                      <div className="relative">
                        <Input
                          id="cnpj"
                          value={formData.cnpj}
                          onChange={(e) => updateFormData('cnpj', formatCNPJ(e.target.value))}
                          placeholder="00.000.000/0000-00"
                          maxLength={18}
                          disabled={isLoadingCnpj}
                        />
                        {isLoadingCnpj && (
                          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Os dados serão preenchidos automaticamente quando você completar o CNPJ
                      </p>
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
                  </div>

                  {/* Segunda linha - Razão Social e Nome Fantasia */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="razao_social">Razão Social *</Label>
                      <Input
                        id="razao_social"
                        value={formData.razao_social}
                        onChange={(e) => updateFormData('razao_social', e.target.value)}
                        placeholder="EMPRESA EXEMPLO LTDA"
                      />
                    </div>
                    <div>
                      <Label htmlFor="nome_fantasia">Nome Fantasia</Label>
                      <Input
                        id="nome_fantasia"
                        value={formData.nome_fantasia}
                        onChange={(e) => updateFormData('nome_fantasia', e.target.value)}
                        placeholder="EXEMPLO"
                      />
                    </div>
                  </div>

                  {/* Terceira linha - Data, Porte e Situação */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                  </div>

                  {/* Quarta linha - Natureza Jurídica */}
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <Label htmlFor="natureza_juridica">Natureza Jurídica</Label>
                      <Input
                        id="natureza_juridica"
                        value={formData.natureza_juridica}
                        onChange={(e) => updateFormData('natureza_juridica', e.target.value)}
                        placeholder="Sociedade Empresária Limitada"
                      />
                    </div>
                  </div>

                  {/* Quinta linha - Atividade Principal */}
                  <div className="grid grid-cols-1 gap-4">
                    <div>
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

                {/* Atividades Secundárias */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Atividades Secundárias</h3>
                  <div className="space-y-3">
                    {formData.atividades_secundarias.map((atividade, index) => (
                      <div key={index} className="flex gap-2">
                        <Input
                          value={atividade}
                          onChange={(e) => {
                            const newAtividades = [...formData.atividades_secundarias]
                            newAtividades[index] = e.target.value
                            updateFormData('atividades_secundarias', newAtividades)
                          }}
                          placeholder="Descrição da atividade secundária"
                          className="flex-1"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const newAtividades = formData.atividades_secundarias.filter((_, i) => i !== index)
                            updateFormData('atividades_secundarias', newAtividades)
                          }}
                        >
                          Remover
                        </Button>
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => updateFormData('atividades_secundarias', [...formData.atividades_secundarias, ""])}
                    >
                      Adicionar Atividade Secundária
                    </Button>
                  </div>
                </div>

                {/* Endereço */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Endereço</h3>

                  {/* Primeira linha - Logradouro, Número e Complemento */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                    <div className="md:col-span-6">
                      <Label htmlFor="logradouro">Logradouro</Label>
                      <Input
                        id="logradouro"
                        value={formData.logradouro}
                        onChange={(e) => updateFormData('logradouro', e.target.value)}
                        placeholder="Rua das Flores"
                      />
                    </div>
                    <div className="md:col-span-3">
                      <Label htmlFor="numero">Número</Label>
                      <Input
                        id="numero"
                        value={formData.numero}
                        onChange={(e) => updateFormData('numero', e.target.value)}
                        placeholder="123"
                      />
                    </div>
                    <div className="md:col-span-3">
                      <Label htmlFor="complemento">Complemento</Label>
                      <Input
                        id="complemento"
                        value={formData.complemento}
                        onChange={(e) => updateFormData('complemento', e.target.value)}
                        placeholder="Sala 101"
                      />
                    </div>
                  </div>

                  {/* Segunda linha - CEP, Bairro */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  </div>

                  {/* Terceira linha - Município e UF */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="md:col-span-3">
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
                  <h3 className="text-lg font-semibold">Contato Principal</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="email">E-mail Principal</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => updateFormData('email', e.target.value)}
                        placeholder="contato@exemplo.com.br"
                      />
                    </div>
                    <div>
                      <Label htmlFor="telefone">Telefone Principal</Label>
                      <Input
                        id="telefone"
                        value={formData.telefone}
                        onChange={(e) => updateFormData('telefone', e.target.value)}
                        placeholder="(98) 3234-5678"
                      />
                    </div>
                  </div>
                </div>

                {/* Telefones Adicionais */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Telefones Adicionais</h3>
                  <div className="space-y-3">
                    {formData.telefones.map((telefone: TelefoneForm, index: number) => (
                      <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-2">
                        <div>
                          <Label>Tipo</Label>
                          <Input
                            value={telefone.tipo || ""}
                            onChange={(e) => {
                              const newTelefones = [...formData.telefones]
                              newTelefones[index] = { ...telefone, tipo: e.target.value }
                              updateFormData('telefones', newTelefones)
                            }}
                            placeholder="Comercial, Celular, etc."
                          />
                        </div>
                        <div>
                          <Label>DDD</Label>
                          <Input
                            value={telefone.ddd || ""}
                            onChange={(e) => {
                              const newTelefones = [...formData.telefones]
                              newTelefones[index] = { ...telefone, ddd: e.target.value }
                              updateFormData('telefones', newTelefones)
                            }}
                            placeholder="11"
                            maxLength={2}
                          />
                        </div>
                        <div>
                          <Label>Número</Label>
                          <Input
                            value={telefone.numero || ""}
                            onChange={(e) => {
                              const newTelefones = [...formData.telefones]
                              newTelefones[index] = { ...telefone, numero: e.target.value }
                              updateFormData('telefones', newTelefones)
                            }}
                            placeholder="99999-9999"
                          />
                        </div>
                        <div className="flex items-end">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const newTelefones = formData.telefones.filter((_: TelefoneForm, i: number) => i !== index)
                              updateFormData('telefones', newTelefones)
                            }}
                          >
                            Remover
                          </Button>
                        </div>
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => updateFormData('telefones', [...formData.telefones, { tipo: "", ddd: "", numero: "" }])}
                    >
                      Adicionar Telefone
                    </Button>
                  </div>
                </div>

                {/* Emails Adicionais */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Emails Adicionais</h3>
                  <div className="space-y-3">
                    {formData.emails.map((email: EmailForm, index: number) => (
                      <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-2">
                        <div>
                          <Label>Email</Label>
                          <Input
                            type="email"
                            value={email.email || ""}
                            onChange={(e) => {
                              const newEmails = [...formData.emails]
                              newEmails[index] = { ...email, email: e.target.value }
                              updateFormData('emails', newEmails)
                            }}
                            placeholder="email@exemplo.com"
                          />
                        </div>
                        <div>
                          <Label>Tipo</Label>
                          <Input
                            value={email.tipo || ""}
                            onChange={(e) => {
                              const newEmails = [...formData.emails]
                              newEmails[index] = { ...email, tipo: e.target.value }
                              updateFormData('emails', newEmails)
                            }}
                            placeholder="Comercial, Financeiro, etc."
                          />
                        </div>
                        <div className="flex items-end">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const newEmails = formData.emails.filter((_: EmailForm, i: number) => i !== index)
                              updateFormData('emails', newEmails)
                            }}
                          >
                            Remover
                          </Button>
                        </div>
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => updateFormData('emails', [...formData.emails, { email: "", tipo: "" }])}
                    >
                      Adicionar Email
                    </Button>
                  </div>
                </div>

                {/* Membros/Sócios */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Membros/Sócios</h3>
                  <div className="space-y-4">
                    {formData.membros.map((membro: MembroForm, index: number) => (
                      <div key={index} className="p-4 border rounded-lg space-y-3">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <Label>Nome Completo</Label>
                            <Input
                              value={membro.nome || ""}
                              onChange={(e) => {
                                const newMembros = [...formData.membros]
                                newMembros[index] = { ...membro, nome: e.target.value }
                                updateFormData('membros', newMembros)
                              }}
                              placeholder="Nome do sócio/administrador"
                            />
                          </div>
                          <div>
                            <Label>Documento (CPF/CNPJ)</Label>
                            <Input
                              value={membro.documento || ""}
                              onChange={(e) => {
                                const newMembros = [...formData.membros]
                                newMembros[index] = { ...membro, documento: e.target.value }
                                updateFormData('membros', newMembros)
                              }}
                              placeholder="000.000.000-00"
                            />
                          </div>
                          <div>
                            <Label>Cargo/Função</Label>
                            <Input
                              value={membro.cargo || ""}
                              onChange={(e) => {
                                const newMembros = [...formData.membros]
                                newMembros[index] = { ...membro, cargo: e.target.value }
                                updateFormData('membros', newMembros)
                              }}
                              placeholder="Administrador, Sócio, etc."
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <Label>Data de Início</Label>
                            <Input
                              type="date"
                              value={membro.data_inicio || ""}
                              onChange={(e) => {
                                const newMembros = [...formData.membros]
                                newMembros[index] = { ...membro, data_inicio: e.target.value }
                                updateFormData('membros', newMembros)
                              }}
                            />
                          </div>
                          <div>
                            <Label>Idade</Label>
                            <Input
                              value={membro.idade || ""}
                              onChange={(e) => {
                                const newMembros = [...formData.membros]
                                newMembros[index] = { ...membro, idade: e.target.value }
                                updateFormData('membros', newMembros)
                              }}
                              placeholder="35 anos"
                            />
                          </div>
                          <div className="flex items-end">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const newMembros = formData.membros.filter((_: MembroForm, i: number) => i !== index)
                                updateFormData('membros', newMembros)
                              }}
                            >
                              Remover Membro
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => updateFormData('membros', [...formData.membros, { nome: "", documento: "", cargo: "", data_inicio: "", idade: "" }])}
                    >
                      Adicionar Membro/Sócio
                    </Button>
                  </div>
                </div>

                {/* Inscrições Estaduais Adicionais */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Inscrições Estaduais Adicionais</h3>
                  <div className="space-y-3">
                    {formData.inscricoes_estaduais.map((inscricao: InscricaoEstadualForm, index: number) => (
                      <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-2">
                        <div>
                          <Label>Estado (UF)</Label>
                          <Input
                            value={inscricao.estado || ""}
                            onChange={(e) => {
                              const newInscricoes = [...formData.inscricoes_estaduais]
                              newInscricoes[index] = { ...inscricao, estado: e.target.value }
                              updateFormData('inscricoes_estaduais', newInscricoes)
                            }}
                            placeholder="SP"
                            maxLength={2}
                          />
                        </div>
                        <div>
                          <Label>Número da Inscrição</Label>
                          <Input
                            value={inscricao.numero || ""}
                            onChange={(e) => {
                              const newInscricoes = [...formData.inscricoes_estaduais]
                              newInscricoes[index] = { ...inscricao, numero: e.target.value }
                              updateFormData('inscricoes_estaduais', newInscricoes)
                            }}
                            placeholder="123456789"
                          />
                        </div>
                        <div>
                          <Label>Status</Label>
                          <Input
                            value={inscricao.status || ""}
                            onChange={(e) => {
                              const newInscricoes = [...formData.inscricoes_estaduais]
                              newInscricoes[index] = { ...inscricao, status: e.target.value }
                              updateFormData('inscricoes_estaduais', newInscricoes)
                            }}
                            placeholder="Ativa, Suspensa, etc."
                          />
                        </div>
                        <div className="flex items-end">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const newInscricoes = formData.inscricoes_estaduais.filter((_: InscricaoEstadualForm, i: number) => i !== index)
                              updateFormData('inscricoes_estaduais', newInscricoes)
                            }}
                          >
                            Remover
                          </Button>
                        </div>
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => updateFormData('inscricoes_estaduais', [...formData.inscricoes_estaduais, { estado: "", numero: "", status: "" }])}
                    >
                      Adicionar Inscrição Estadual
                    </Button>
                  </div>
                </div>

                {/* Dados SUFRAMA */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Dados SUFRAMA</h3>
                  <div className="space-y-4">
                    {formData.dados_suframa.map((suframa: SuframaForm, index: number) => (
                      <div key={index} className="p-4 border rounded-lg space-y-3">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <Label>Número SUFRAMA</Label>
                            <Input
                              value={suframa.numero || ""}
                              onChange={(e) => {
                                const newSuframa = [...formData.dados_suframa]
                                newSuframa[index] = { ...suframa, numero: e.target.value }
                                updateFormData('dados_suframa', newSuframa)
                              }}
                              placeholder="123456789"
                            />
                          </div>
                          <div>
                            <Label>Data de Cadastro</Label>
                            <Input
                              type="date"
                              value={suframa.data_cadastro || ""}
                              onChange={(e) => {
                                const newSuframa = [...formData.dados_suframa]
                                newSuframa[index] = { ...suframa, data_cadastro: e.target.value }
                                updateFormData('dados_suframa', newSuframa)
                              }}
                            />
                          </div>
                          <div>
                            <Label>Data de Vencimento</Label>
                            <Input
                              type="date"
                              value={suframa.data_vencimento || ""}
                              onChange={(e) => {
                                const newSuframa = [...formData.dados_suframa]
                                newSuframa[index] = { ...suframa, data_vencimento: e.target.value }
                                updateFormData('dados_suframa', newSuframa)
                              }}
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label>Tipo de Incentivo</Label>
                            <Input
                              value={suframa.tipo_incentivo || ""}
                              onChange={(e) => {
                                const newSuframa = [...formData.dados_suframa]
                                newSuframa[index] = { ...suframa, tipo_incentivo: e.target.value }
                                updateFormData('dados_suframa', newSuframa)
                              }}
                              placeholder="IPI, ICMS, etc."
                            />
                          </div>
                          <div className="flex items-center space-x-2">
                            <Switch
                              checked={suframa.ativa || false}
                              onCheckedChange={(checked) => {
                                const newSuframa = [...formData.dados_suframa]
                                newSuframa[index] = { ...suframa, ativa: checked }
                                updateFormData('dados_suframa', newSuframa)
                              }}
                            />
                            <Label>Registro Ativo</Label>
                          </div>
                        </div>
                        <div className="flex justify-end">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const newSuframa = formData.dados_suframa.filter((_: SuframaForm, i: number) => i !== index)
                              updateFormData('dados_suframa', newSuframa)
                            }}
                          >
                            Remover SUFRAMA
                          </Button>
                        </div>
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => updateFormData('dados_suframa', [...formData.dados_suframa, { numero: "", data_cadastro: "", data_vencimento: "", tipo_incentivo: "", ativa: true }])}
                    >
                      Adicionar Registro SUFRAMA
                    </Button>
                  </div>
                </div>

                {/* Dados Adicionais */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Dados Adicionais</h3>

                  {/* Capital Social */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="capital_social">Capital Social (R$)</Label>
                      <Input
                        id="capital_social"
                        type="number"
                        step="0.01"
                        value={formData.capital_social}
                        onChange={(e) => updateFormData('capital_social', parseFloat(e.target.value) || 0)}
                        placeholder="10000.00"
                      />
                    </div>
                  </div>

                  {/* Configurações */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium text-muted-foreground">Configurações</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="flex items-center space-x-3 p-3 border rounded-lg">
                        <Switch
                          id="simples_nacional"
                          checked={formData.simples_nacional}
                          onCheckedChange={(checked) => updateFormData('simples_nacional', checked)}
                        />
                        <div className="space-y-1">
                          <Label htmlFor="simples_nacional" className="text-sm font-medium">Simples Nacional</Label>
                          <p className="text-xs text-muted-foreground">Regime tributário simplificado</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3 p-3 border rounded-lg">
                        <Switch
                          id="mei"
                          checked={formData.mei}
                          onCheckedChange={(checked) => updateFormData('mei', checked)}
                        />
                        <div className="space-y-1">
                          <Label htmlFor="mei" className="text-sm font-medium">MEI</Label>
                          <p className="text-xs text-muted-foreground">Microempreendedor Individual</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3 p-3 border rounded-lg">
                        <Switch
                          id="ativa"
                          checked={formData.ativa}
                          onCheckedChange={(checked) => updateFormData('ativa', checked)}
                        />
                        <div className="space-y-1">
                          <Label htmlFor="ativa" className="text-sm font-medium">Empresa Ativa</Label>
                          <p className="text-xs text-muted-foreground">Status da empresa no sistema</p>
                        </div>
                      </div>
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
    </ClientOnlyWrapper>
  )
}
