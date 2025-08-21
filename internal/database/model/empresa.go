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

// EmpresaMembro representa os sócios/administradores da empresa
type EmpresaMembro struct {
	bun.BaseModel `bun:"table:empresa_membros,alias:em"`

	ID        int      `json:"id" bun:",pk,autoincrement"`
	EmpresaID int      `json:"empresa_id" bun:",notnull"`
	Empresa   *Empresa `json:"empresa,omitempty" bun:"rel:belongs-to,join:empresa_id=id"`

	// Dados da pessoa
	TipoDocumento   string `json:"tipo_documento"` // CPF ou CNPJ
	NumeroDocumento string `json:"numero_documento"`
	Nome            string `json:"nome" bun:",notnull"`
	Idade           string `json:"idade"`

	// Dados do cargo/função
	CargoID    int       `json:"cargo_id"`
	CargoNome  string    `json:"cargo_nome" bun:",notnull"`
	DataInicio time.Time `json:"data_inicio"`

	// Controle
	CreatedAt time.Time `json:"created_at" bun:",nullzero,notnull,default:current_timestamp"`
	UpdatedAt time.Time `json:"updated_at" bun:",nullzero,notnull,default:current_timestamp"`
}

// EmpresaInscricaoEstadual representa as inscrições estaduais da empresa
type EmpresaInscricaoEstadual struct {
	bun.BaseModel `bun:"table:empresa_inscricoes_estaduais,alias:eie"`

	ID        int      `json:"id" bun:",pk,autoincrement"`
	EmpresaID int      `json:"empresa_id" bun:",notnull"`
	Empresa   *Empresa `json:"empresa,omitempty" bun:"rel:belongs-to,join:empresa_id=id"`

	Numero     string    `json:"numero" bun:",notnull"`
	Estado     string    `json:"estado" bun:",notnull"`
	Ativa      bool      `json:"ativa" bun:",default:true"`
	DataStatus time.Time `json:"data_status"`

	// Status da inscrição
	StatusID   int    `json:"status_id"`
	StatusNome string `json:"status_nome"`

	// Tipo da inscrição
	TipoID   int    `json:"tipo_id"`
	TipoNome string `json:"tipo_nome"`

	// Controle
	CreatedAt time.Time `json:"created_at" bun:",nullzero,notnull,default:current_timestamp"`
	UpdatedAt time.Time `json:"updated_at" bun:",nullzero,notnull,default:current_timestamp"`
}

// EmpresaSuframa representa os dados SUFRAMA da empresa
type EmpresaSuframa struct {
	bun.BaseModel `bun:"table:empresa_suframa,alias:es"`

	ID        int      `json:"id" bun:",pk,autoincrement"`
	EmpresaID int      `json:"empresa_id" bun:",notnull"`
	Empresa   *Empresa `json:"empresa,omitempty" bun:"rel:belongs-to,join:empresa_id=id"`

	Numero         string    `json:"numero" bun:",notnull"`
	DataCadastro   time.Time `json:"data_cadastro"`
	DataVencimento time.Time `json:"data_vencimento"`
	Ativa          bool      `json:"ativa" bun:",default:true"`

	// Incentivos fiscais
	IncentivosAtivos   bool   `json:"incentivos_ativos"`
	TipoIncentivo      string `json:"tipo_incentivo"`
	DescricaoIncentivo string `json:"descricao_incentivo"`

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

// EmpresaTelefone representa os telefones da empresa
type EmpresaTelefone struct {
	bun.BaseModel `bun:"table:empresa_telefones,alias:et"`

	ID        int      `json:"id" bun:",pk,autoincrement"`
	EmpresaID int      `json:"empresa_id" bun:",notnull"`
	Empresa   *Empresa `json:"empresa,omitempty" bun:"rel:belongs-to,join:empresa_id=id"`

	Tipo      string `json:"tipo"` // Tipo do telefone (comercial, celular, etc.)
	DDD       string `json:"ddd"`  // Código de área
	Numero    string `json:"numero" bun:",notnull"`
	Principal bool   `json:"principal" bun:",default:false"` // Se é o telefone principal

	// Controle
	CreatedAt time.Time `json:"created_at" bun:",nullzero,notnull,default:current_timestamp"`
	UpdatedAt time.Time `json:"updated_at" bun:",nullzero,notnull,default:current_timestamp"`
}

// EmpresaEmail representa os emails da empresa
type EmpresaEmail struct {
	bun.BaseModel `bun:"table:empresa_emails,alias:ee"`

	ID        int      `json:"id" bun:",pk,autoincrement"`
	EmpresaID int      `json:"empresa_id" bun:",notnull"`
	Empresa   *Empresa `json:"empresa,omitempty" bun:"rel:belongs-to,join:empresa_id=id"`

	Email     string `json:"email" bun:",notnull"`
	Dominio   string `json:"dominio"`
	Tipo      string `json:"tipo"`                           // Tipo de propriedade do email
	Principal bool   `json:"principal" bun:",default:false"` // Se é o email principal

	// Controle
	CreatedAt time.Time `json:"created_at" bun:",nullzero,notnull,default:current_timestamp"`
	UpdatedAt time.Time `json:"updated_at" bun:",nullzero,notnull,default:current_timestamp"`
}

// BeforeAppendModel hooks para os novos modelos
func (em *EmpresaMembro) BeforeAppendModel(ctx context.Context, query bun.Query) error {
	switch query.(type) {
	case *bun.InsertQuery:
		em.CreatedAt = time.Now()
		em.UpdatedAt = time.Now()
	case *bun.UpdateQuery:
		em.UpdatedAt = time.Now()
	}
	return nil
}

func (eie *EmpresaInscricaoEstadual) BeforeAppendModel(ctx context.Context, query bun.Query) error {
	switch query.(type) {
	case *bun.InsertQuery:
		eie.CreatedAt = time.Now()
		eie.UpdatedAt = time.Now()
	case *bun.UpdateQuery:
		eie.UpdatedAt = time.Now()
	}
	return nil
}

func (es *EmpresaSuframa) BeforeAppendModel(ctx context.Context, query bun.Query) error {
	switch query.(type) {
	case *bun.InsertQuery:
		es.CreatedAt = time.Now()
		es.UpdatedAt = time.Now()
	case *bun.UpdateQuery:
		es.UpdatedAt = time.Now()
	}
	return nil
}

func (et *EmpresaTelefone) BeforeAppendModel(ctx context.Context, query bun.Query) error {
	switch query.(type) {
	case *bun.InsertQuery:
		et.CreatedAt = time.Now()
		et.UpdatedAt = time.Now()
	case *bun.UpdateQuery:
		et.UpdatedAt = time.Now()
	}
	return nil
}

func (ee *EmpresaEmail) BeforeAppendModel(ctx context.Context, query bun.Query) error {
	switch query.(type) {
	case *bun.InsertQuery:
		ee.CreatedAt = time.Now()
		ee.UpdatedAt = time.Now()
	case *bun.UpdateQuery:
		ee.UpdatedAt = time.Now()
	}
	return nil
}

// EmpresaResponse representa a resposta para o frontend
type EmpresaResponse struct {
	ID                 int       `json:"id"`
	CNPJ               string    `json:"cnpj"`
	RazaoSocial        string    `json:"razao_social"`
	NomeFantasia       string    `json:"nome_fantasia"`
	DataAbertura       time.Time `json:"data_abertura"`
	Porte              string    `json:"porte"`
	SituacaoCadastral  string    `json:"situacao_cadastral"`
	AtividadePrincipal string    `json:"atividade_principal"`
	NaturezaJuridica   string    `json:"natureza_juridica"`
	CapitalSocial      float64   `json:"capital_social"`
	SimplesNacional    bool      `json:"simples_nacional"`
	MEI                bool      `json:"mei"`
	Ativa              bool      `json:"ativa"`

	// Dados de contato (mantidos para compatibilidade)
	Email    string `json:"email"`
	Telefone string `json:"telefone"`

	// Endereço
	Endereco EnderecoResponse `json:"endereco"`

	// Relacionamentos
	AtividadesSecundarias []AtividadeResponse         `json:"atividades_secundarias,omitempty"`
	Membros               []MembroResponse            `json:"membros,omitempty"`
	InscricoesEstaduais   []InscricaoEstadualResponse `json:"inscricoes_estaduais,omitempty"`
	DadosSuframa          []SuframaResponse           `json:"dados_suframa,omitempty"`
	Telefones             []TelefoneResponse          `json:"telefones,omitempty"`
	Emails                []EmailResponse             `json:"emails,omitempty"`

	// Controle
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
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

type MembroResponse struct {
	ID              int       `json:"id"`
	TipoDocumento   string    `json:"tipo_documento"`
	NumeroDocumento string    `json:"numero_documento"`
	Nome            string    `json:"nome"`
	Idade           string    `json:"idade"`
	CargoID         int       `json:"cargo_id"`
	CargoNome       string    `json:"cargo_nome"`
	DataInicio      time.Time `json:"data_inicio"`
}

type InscricaoEstadualResponse struct {
	ID         int       `json:"id"`
	Numero     string    `json:"numero"`
	Estado     string    `json:"estado"`
	Ativa      bool      `json:"ativa"`
	DataStatus time.Time `json:"data_status"`
	StatusID   int       `json:"status_id"`
	StatusNome string    `json:"status_nome"`
	TipoID     int       `json:"tipo_id"`
	TipoNome   string    `json:"tipo_nome"`
}

type SuframaResponse struct {
	ID                 int       `json:"id"`
	Numero             string    `json:"numero"`
	DataCadastro       time.Time `json:"data_cadastro"`
	DataVencimento     time.Time `json:"data_vencimento"`
	Ativa              bool      `json:"ativa"`
	IncentivosAtivos   bool      `json:"incentivos_ativos"`
	TipoIncentivo      string    `json:"tipo_incentivo"`
	DescricaoIncentivo string    `json:"descricao_incentivo"`
}

type TelefoneResponse struct {
	ID        int    `json:"id"`
	Tipo      string `json:"tipo"`
	DDD       string `json:"ddd"`
	Numero    string `json:"numero"`
	Principal bool   `json:"principal"`
}

type EmailResponse struct {
	ID        int    `json:"id"`
	Email     string `json:"email"`
	Dominio   string `json:"dominio"`
	Tipo      string `json:"tipo"`
	Principal bool   `json:"principal"`
}

// CNPJAFormResponse representa a resposta estruturada para o formulário frontend
type CNPJAFormResponse struct {
	// Dados básicos da empresa
	CNPJ               string `json:"cnpj"`
	InscricaoEstadual  string `json:"inscricao_estadual"`
	InscricaoMunicipal string `json:"inscricao_municipal"`
	RazaoSocial        string `json:"razao_social"`
	NomeFantasia       string `json:"nome_fantasia"`
	DataAbertura       string `json:"data_abertura"`
	Porte              string `json:"porte"`
	NaturezaJuridica   string `json:"natureza_juridica"`
	AtividadePrincipal string `json:"atividade_principal"`
	SituacaoCadastral  string `json:"situacao_cadastral"`

	// Endereço
	Logradouro  string `json:"logradouro"`
	Numero      string `json:"numero"`
	Complemento string `json:"complemento"`
	CEP         string `json:"cep"`
	Bairro      string `json:"bairro"`
	Municipio   string `json:"municipio"`
	UF          string `json:"uf"`

	// Contato principal
	Email    string `json:"email"`
	Telefone string `json:"telefone"`

	// Dados adicionais
	CapitalSocial   float64 `json:"capital_social"`
	SimplesNacional bool    `json:"simples_nacional"`
	MEI             bool    `json:"mei"`
	Ativa           bool    `json:"ativa"`

	// Listas de dados relacionados
	AtividadesSecundarias []string             `json:"atividades_secundarias"`
	Membros               []CNPJAMembroForm    `json:"membros"`
	Telefones             []CNPJATelefoneForm  `json:"telefones"`
	Emails                []CNPJAEmailForm     `json:"emails"`
	InscricoesEstaduais   []CNPJAInscricaoForm `json:"inscricoes_estaduais"`
	DadosSuframa          []CNPJASuframaForm   `json:"dados_suframa"`
}

// Estruturas para os dados relacionados no formulário
type CNPJAMembroForm struct {
	Nome       string `json:"nome"`
	Documento  string `json:"documento"`
	Cargo      string `json:"cargo"`
	DataInicio string `json:"data_inicio"`
	Idade      string `json:"idade"`
}

type CNPJATelefoneForm struct {
	Tipo   string `json:"tipo"`
	DDD    string `json:"ddd"`
	Numero string `json:"numero"`
}

type CNPJAEmailForm struct {
	Email string `json:"email"`
	Tipo  string `json:"tipo"`
}

type CNPJAInscricaoForm struct {
	Estado string `json:"estado"`
	Numero string `json:"numero"`
	Status string `json:"status"`
}

type CNPJASuframaForm struct {
	Numero         string `json:"numero"`
	DataCadastro   string `json:"data_cadastro"`
	DataVencimento string `json:"data_vencimento"`
	TipoIncentivo  string `json:"tipo_incentivo"`
	Ativa          bool   `json:"ativa"`
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
