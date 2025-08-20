package model

import (
	"context"
	"time"

	"github.com/uptrace/bun"
)

// Empresa representa o modelo de empresa baseado no CNPJ
type Empresa struct {
	bun.BaseModel `bun:"table:empresas,alias:e"`

	ID                    int       `json:"id" bun:",pk,autoincrement"`
	CNPJ                  string    `json:"cnpj" bun:",unique,notnull"`
	InscricaoEstadual     string    `json:"inscricao_estadual"`
	InscricaoMunicipal    string    `json:"inscricao_municipal"`
	RazaoSocial           string    `json:"razao_social" bun:",notnull"`
	NomeFantasia          string    `json:"nome_fantasia"`
	DataAbertura          time.Time `json:"data_abertura"`
	Porte                 string    `json:"porte"`
	NaturezaJuridica      string    `json:"natureza_juridica"`
	CodigoNatureza        string    `json:"codigo_natureza"`
	AtividadePrincipal    string    `json:"atividade_principal"`
	CodigoAtivPrincipal   string    `json:"codigo_ativ_principal"`
	SituacaoCadastral     string    `json:"situacao_cadastral"`
	DataSituacao          time.Time `json:"data_situacao"`
	MotivoSituacao        string    `json:"motivo_situacao"`
	SituacaoEspecial      string    `json:"situacao_especial"`
	DataSituacaoEspecial  time.Time `json:"data_situacao_especial"`
	
	// Endereço
	Logradouro            string    `json:"logradouro"`
	Numero                string    `json:"numero"`
	Complemento           string    `json:"complemento"`
	CEP                   string    `json:"cep"`
	Bairro                string    `json:"bairro"`
	Municipio             string    `json:"municipio"`
	UF                    string    `json:"uf"`
	
	// Contato
	Email                 string    `json:"email"`
	Telefone              string    `json:"telefone"`
	
	// Controle
	CreatedAt             time.Time `json:"created_at" bun:",nullzero,notnull,default:current_timestamp"`
	UpdatedAt             time.Time `json:"updated_at" bun:",nullzero,notnull,default:current_timestamp"`
}

// AtividadeSecundaria representa as atividades econômicas secundárias da empresa
type AtividadeSecundaria struct {
	bun.BaseModel `bun:"table:atividades_secundarias,alias:as"`

	ID          int    `json:"id" bun:",pk,autoincrement"`
	EmpresaID   int    `json:"empresa_id" bun:",notnull"`
	Codigo      string `json:"codigo" bun:",notnull"`
	Descricao   string `json:"descricao" bun:",notnull"`
	
	// Relacionamento
	Empresa     *Empresa `json:"empresa,omitempty" bun:"rel:belongs-to,join:empresa_id=id"`
	
	CreatedAt   time.Time `json:"created_at" bun:",nullzero,notnull,default:current_timestamp"`
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
	ID                   int                    `json:"id"`
	CNPJ                 string                 `json:"cnpj"`
	RazaoSocial          string                 `json:"razao_social"`
	NomeFantasia         string                 `json:"nome_fantasia"`
	DataAbertura         time.Time              `json:"data_abertura"`
	Porte                string                 `json:"porte"`
	SituacaoCadastral    string                 `json:"situacao_cadastral"`
	AtividadePrincipal   string                 `json:"atividade_principal"`
	Email                string                 `json:"email"`
	Telefone             string                 `json:"telefone"`
	Endereco             EnderecoResponse       `json:"endereco"`
	AtividadesSecundarias []AtividadeResponse   `json:"atividades_secundarias,omitempty"`
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
