package model

import (
	"context"
	"time"

	"github.com/uptrace/bun"
)

// Empresa representa o modelo de empresa baseado no CNPJ
type Empresa struct {
	bun.BaseModel `bun:"table:empresas,alias:e"`

	ID                   int       `json:"id" bun:",pk,autoincrement"`
	CNPJ                 string    `json:"cnpj" bun:",unique,notnull"`
	InscricaoEstadual    string    `json:"inscricao_estadual"`
	InscricaoMunicipal   string    `json:"inscricao_municipal"`
	RazaoSocial          string    `json:"razao_social" bun:",notnull"`
	NomeFantasia         string    `json:"nome_fantasia"`
	DataAbertura         time.Time `json:"data_abertura"`
	Porte                string    `json:"porte"`
	NaturezaJuridica     string    `json:"natureza_juridica"`
	CodigoNatureza       string    `json:"codigo_natureza"`
	AtividadePrincipal   string    `json:"atividade_principal"`
	CodigoAtivPrincipal  string    `json:"codigo_ativ_principal"`
	SituacaoCadastral    string    `json:"situacao_cadastral"`
	DataSituacao         time.Time `json:"data_situacao"`
	MotivoSituacao       string    `json:"motivo_situacao"`
	SituacaoEspecial     string    `json:"situacao_especial"`
	DataSituacaoEspecial time.Time `json:"data_situacao_especial"`

	// Endereço
	Logradouro  string `json:"logradouro"`
	Numero      string `json:"numero"`
	Complemento string `json:"complemento"`
	CEP         string `json:"cep"`
	Bairro      string `json:"bairro"`
	Municipio   string `json:"municipio"`
	UF          string `json:"uf"`

	// Contato
	Email    string `json:"email"`
	Telefone string `json:"telefone"`

	// Dados adicionais da API
	CapitalSocial   float64 `json:"capital_social"`
	SimplesNacional bool    `json:"simples_nacional"`
	MEI             bool    `json:"mei"`
	Ativa           bool    `json:"ativa" bun:",default:true"`

	// Controle
	CreatedAt time.Time `json:"created_at" bun:",nullzero,notnull,default:current_timestamp"`
	UpdatedAt time.Time `json:"updated_at" bun:",nullzero,notnull,default:current_timestamp"`
}

// AtividadeSecundaria representa as atividades econômicas secundárias da empresa
type AtividadeSecundaria struct {
	bun.BaseModel `bun:"table:atividades_secundarias,alias:as"`

	ID        int    `json:"id" bun:",pk,autoincrement"`
	EmpresaID int    `json:"empresa_id" bun:",notnull"`
	Codigo    string `json:"codigo" bun:",notnull"`
	Descricao string `json:"descricao" bun:",notnull"`

	// Relacionamento
	Empresa *Empresa `json:"empresa,omitempty" bun:"rel:belongs-to,join:empresa_id=id"`

	CreatedAt time.Time `json:"created_at" bun:",nullzero,notnull,default:current_timestamp"`
}

// BeforeAppendModel hook executado antes de inserir/atualizar
func (e *Empresa) BeforeAppendModel(ctx context.Context, query bun.Query) error {
	switch query.(type) {
	case *bun.InsertQuery:
		e.CreatedAt = time.Now()
		e.UpdatedAt = time.Now()
	case *bun.UpdateQuery:
		e.UpdatedAt = time.Now()
	}
	return nil
}

// BeforeAppendModel hook para atividades secundárias
func (a *AtividadeSecundaria) BeforeAppendModel(ctx context.Context, query bun.Query) error {
	switch query.(type) {
	case *bun.InsertQuery:
		a.CreatedAt = time.Now()
	}
	return nil
}

// EmpresaResponse representa a resposta para o frontend
type EmpresaResponse struct {
	ID                    int                 `json:"id"`
	CNPJ                  string              `json:"cnpj"`
	RazaoSocial           string              `json:"razao_social"`
	NomeFantasia          string              `json:"nome_fantasia"`
	DataAbertura          time.Time           `json:"data_abertura"`
	Porte                 string              `json:"porte"`
	SituacaoCadastral     string              `json:"situacao_cadastral"`
	AtividadePrincipal    string              `json:"atividade_principal"`
	Email                 string              `json:"email"`
	Telefone              string              `json:"telefone"`
	Endereco              EnderecoResponse    `json:"endereco"`
	AtividadesSecundarias []AtividadeResponse `json:"atividades_secundarias,omitempty"`
}

type EnderecoResponse struct {
	Logradouro  string `json:"logradouro"`
	Numero      string `json:"numero"`
	Complemento string `json:"complemento"`
	CEP         string `json:"cep"`
	Bairro      string `json:"bairro"`
	Municipio   string `json:"municipio"`
	UF          string `json:"uf"`
}

type AtividadeResponse struct {
	Codigo    string `json:"codigo"`
	Descricao string `json:"descricao"`
}

// CNPJAResponse representa a resposta da API CNPJA
type CNPJAResponse struct {
	Updated        string              `json:"updated"`
	TaxID          string              `json:"taxId"`
	Alias          string              `json:"alias"`
	Founded        string              `json:"founded"`
	Head           bool                `json:"head"`
	Company        CNPJACompany        `json:"company"`
	StatusDate     string              `json:"statusDate"`
	Status         CNPJAStatus         `json:"status"`
	Address        CNPJAAddress        `json:"address"`
	MainActivity   CNPJAActivity       `json:"mainActivity"`
	Phones         []CNPJAPhone        `json:"phones"`
	Emails         []CNPJAEmail        `json:"emails"`
	SideActivities []CNPJAActivity     `json:"sideActivities"`
	Registrations  []CNPJARegistration `json:"registrations"`
	Suframa        []CNPJASuframa      `json:"suframa"`
}

// Tipos para a API CNPJA
type CNPJACompany struct {
	ID      int           `json:"id"`
	Name    string        `json:"name"`
	Equity  float64       `json:"equity"`
	Size    CNPJASize     `json:"size"`
	Nature  CNPJANature   `json:"nature"`
	Simples CNPJASimples  `json:"simples"`
	Simei   CNPJASimei    `json:"simei"`
	Members []CNPJAMember `json:"members"`
}

type CNPJAStatus struct {
	ID   int    `json:"id"`
	Text string `json:"text"`
}

type CNPJASize struct {
	ID      int    `json:"id"`
	Acronym string `json:"acronym"`
	Text    string `json:"text"`
}

type CNPJASimei struct {
	Optant bool   `json:"optant"`
	Since  string `json:"since"`
}

type CNPJAMember struct {
	Since  string      `json:"since"`
	Person CNPJAPerson `json:"person"`
	Role   CNPJARole   `json:"role"`
}

type CNPJAPerson struct {
	ID    string `json:"id"`
	Type  string `json:"type"`
	Name  string `json:"name"`
	TaxID string `json:"taxId"`
	Age   string `json:"age"`
}

type CNPJARole struct {
	ID   int    `json:"id"`
	Text string `json:"text"`
}

type CNPJAAddress struct {
	Municipality int          `json:"municipality"`
	Street       string       `json:"street"`
	Number       string       `json:"number"`
	District     string       `json:"district"`
	City         string       `json:"city"`
	State        string       `json:"state"`
	Details      string       `json:"details"`
	Zip          string       `json:"zip"`
	Country      CNPJACountry `json:"country"`
}

type CNPJACountry struct {
	ID   int    `json:"id"`
	Name string `json:"name"`
}

type CNPJAActivity struct {
	ID   int    `json:"id"`
	Text string `json:"text"`
}

type CNPJAPhone struct {
	Type   string `json:"type"`
	Area   string `json:"area"`
	Number string `json:"number"`
}

type CNPJAEmail struct {
	Ownership string `json:"ownership"`
	Address   string `json:"address"`
	Domain    string `json:"domain"`
}

type CNPJARegistration struct {
	Number     string         `json:"number"`
	State      string         `json:"state"`
	Enabled    bool           `json:"enabled"`
	StatusDate string         `json:"statusDate"`
	Status     CNPJARegStatus `json:"status"`
	Type       CNPJARegType   `json:"type"`
}

type CNPJARegStatus struct {
	ID   int    `json:"id"`
	Text string `json:"text"`
}

type CNPJARegType struct {
	ID   int    `json:"id"`
	Text string `json:"text"`
}

type CNPJASuframa struct {
	Number       string             `json:"number"`
	Since        string             `json:"since"`
	Approved     bool               `json:"approved"`
	ApprovalDate string             `json:"approvalDate"`
	Status       CNPJASuframaStatus `json:"status"`
	Incentives   []CNPJAIncentive   `json:"incentives"`
}

type CNPJASuframaStatus struct {
	ID   int    `json:"id"`
	Text string `json:"text"`
}

type CNPJAIncentive struct {
	Tribute string `json:"tribute"`
	Benefit string `json:"benefit"`
	Purpose string `json:"purpose"`
	Basis   string `json:"basis"`
}

type CNPJANature struct {
	ID   int    `json:"id"`
	Text string `json:"text"`
}

type CNPJAPorte struct {
	ID      int    `json:"id"`
	Text    string `json:"text"`
	Acronym string `json:"acronym"`
}

type CNPJANaturezaJuridica struct {
	Codigo    string `json:"codigo"`
	Descricao string `json:"descricao"`
}

type CNPJASituacao struct {
	Codigo    string `json:"codigo"`
	Descricao string `json:"descricao"`
	Data      string `json:"data"`
	Motivo    string `json:"motivo"`
}

type CNPJAAtividade struct {
	ID   int    `json:"id"`
	Text string `json:"text"`
}

type CNPJAEndereco struct {
	Street   string `json:"street"`
	Number   string `json:"number"`
	Details  string `json:"details"`
	District string `json:"district"`
	Zip      string `json:"zip"`
	City     string `json:"city"`
	State    string `json:"state"`
}

type CNPJATelefone struct {
	Area   string `json:"area"`
	Number string `json:"number"`
}

type CNPJASimples struct {
	Optant bool   `json:"optant"`
	Since  string `json:"since"`
}

type CNPJASocio struct {
	Nome               string `json:"nome"`
	Qualificacao       string `json:"qualificacao"`
	DataEntrada        string `json:"data_entrada"`
	CPF                string `json:"cpf"`
	CNPJ               string `json:"cnpj"`
	Pais               string `json:"pais"`
	RepresentanteLegal string `json:"representante_legal"`
}

// EmpresaCreateRequest representa a requisição para criar/atualizar empresa
type EmpresaCreateRequest struct {
	CNPJ         string `json:"cnpj" validate:"required"`
	RazaoSocial  string `json:"razao_social"`
	NomeFantasia string `json:"nome_fantasia"`
	Email        string `json:"email"`
	Telefone     string `json:"telefone"`
	Ativa        bool   `json:"ativa"`
}

// EmpresaUpdateRequest representa a requisição para atualizar empresa
type EmpresaUpdateRequest struct {
	RazaoSocial  string `json:"razao_social"`
	NomeFantasia string `json:"nome_fantasia"`
	Email        string `json:"email"`
	Telefone     string `json:"telefone"`
	Ativa        bool   `json:"ativa"`
}
