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
	CNPJ                  string                `json:"cnpj"`
	RazaoSocial           string                `json:"razao_social"`
	NomeFantasia          string                `json:"nome_fantasia"`
	DataAbertura          string                `json:"data_abertura"`
	Porte                 CNPJAPorte            `json:"porte"`
	NaturezaJuridica      CNPJANaturezaJuridica `json:"natureza_juridica"`
	SituacaoCadastral     CNPJASituacao         `json:"situacao_cadastral"`
	AtividadePrincipal    CNPJAAtividade        `json:"atividade_principal"`
	AtividadesSecundarias []CNPJAAtividade      `json:"atividades_secundarias"`
	Endereco              CNPJAEndereco         `json:"endereco"`
	Telefones             []CNPJATelefone       `json:"telefones"`
	Email                 string                `json:"email"`
	CapitalSocial         float64               `json:"capital_social"`
	SimplesNacional       CNPJASimples          `json:"simples_nacional"`
	Socios                []CNPJASocio          `json:"socios"`
}

type CNPJAPorte struct {
	Codigo    string `json:"codigo"`
	Descricao string `json:"descricao"`
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
	Codigo    string `json:"codigo"`
	Descricao string `json:"descricao"`
}

type CNPJAEndereco struct {
	Logradouro  string `json:"logradouro"`
	Numero      string `json:"numero"`
	Complemento string `json:"complemento"`
	Bairro      string `json:"bairro"`
	CEP         string `json:"cep"`
	Municipio   string `json:"municipio"`
	UF          string `json:"uf"`
}

type CNPJATelefone struct {
	DDD    string `json:"ddd"`
	Numero string `json:"numero"`
}

type CNPJASimples struct {
	Optante   bool   `json:"optante"`
	DataOpcao string `json:"data_opcao"`
	MEI       bool   `json:"mei"`
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
