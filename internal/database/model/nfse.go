package model

import (
	"context"
	"time"

	"github.com/uptrace/bun"
)

// NFSe representa o modelo de Nota Fiscal de Serviço Eletrônica
type NFSe struct {
	bun.BaseModel `bun:"table:nfse,alias:n"`

	// Identificação única
	ID                int    `json:"id" bun:",pk,autoincrement"`
	NumeroNfse        string `json:"numero_nfse" bun:",unique,notnull"`
	CodigoVerificacao string `json:"codigo_verificacao" bun:",notnull"`

	// Dados do RPS
	NumeroRps string `json:"numero_rps"`
	SerieRps  string `json:"serie_rps"`
	TipoRps   int    `json:"tipo_rps"`

	// Dados temporais
	DataEmissao time.Time `json:"data_emissao" bun:",notnull"`
	Competencia string    `json:"competencia" bun:",notnull"`

	// Status e controle
	Status string `json:"status" bun:",notnull,default:'pendente'"`

	// Valores financeiros essenciais
	ValorNota   float64 `json:"valor_nota" bun:",type:decimal(15,2),notnull,default:0"`
	AliquotaIss float64 `json:"aliquota_iss" bun:",type:decimal(8,4),notnull,default:0"`
	ValorIss    float64 `json:"valor_iss" bun:",type:decimal(15,2),notnull,default:0"`

	// Dados do prestador
	CNPJPrestador               string `json:"cnpj_prestador" bun:",notnull"`
	RazaoSocialPrestador        string `json:"razao_social_prestador" bun:",notnull"`
	InscricaoMunicipalPrestador string `json:"inscricao_municipal_prestador"`

	// Dados do tomador
	CNPJTomador        string `json:"cnpj_tomador"`
	RazaoSocialTomador string `json:"razao_social_tomador"`

	// Informações do serviço
	Discriminacao    string `json:"discriminacao" bun:",type:text"`
	CodigoServico    string `json:"codigo_servico"`
	ItemListaServico string `json:"item_lista_servico"`

	// Localização
	CodigoMunicipio string `json:"codigo_municipio"`
	CodigoIBGE      string `json:"codigo_ibge"`

	// XML completo (armazenado no MinIO, referência aqui)
	XMLContent string `json:"xml_content" bun:",type:text"`

	// Controle de auditoria
	CreatedAt time.Time `json:"created_at" bun:",nullzero,notnull,default:current_timestamp"`
	UpdatedAt time.Time `json:"updated_at" bun:",nullzero,notnull,default:current_timestamp"`
}

// BeforeAppendModel hook executado antes de inserir/atualizar
func (n *NFSe) BeforeAppendModel(ctx context.Context, query bun.Query) error {
	switch query.(type) {
	case *bun.InsertQuery:
		n.CreatedAt = time.Now()
		n.UpdatedAt = time.Now()
	case *bun.UpdateQuery:
		n.UpdatedAt = time.Now()
	}
	return nil
}

// NFSeResponse representa a resposta de consulta para o frontend
type NFSeResponse struct {
	NumeroNfse                  string    `json:"numero_nfse"`
	NumeroRps                   string    `json:"numero_rps"`
	SerieRps                    string    `json:"serie_rps"`
	DataEmissao                 time.Time `json:"data_emissao"`
	Status                      string    `json:"status"`
	CodigoVerificacao           string    `json:"codigo_verificacao"`
	ValorNota                   float64   `json:"valor_nota"`
	AliquotaIss                 float64   `json:"aliquota_iss"`
	ValorIss                    float64   `json:"valor_iss"`
	Competencia                 string    `json:"competencia"`
	CNPJPrestador               string    `json:"cnpj_prestador,omitempty"`
	RazaoSocialPrestador        string    `json:"razao_social_prestador,omitempty"`
	InscricaoMunicipalPrestador string    `json:"inscricao_municipal_prestador,omitempty"`
	CNPJTomador                 string    `json:"cnpj_tomador,omitempty"`
	RazaoSocialTomador          string    `json:"razao_social_tomador,omitempty"`
	Discriminacao               string    `json:"discriminacao,omitempty"`
	CodigoServico               string    `json:"codigo_servico,omitempty"`
	ItemListaServico            string    `json:"item_lista_servico,omitempty"`
	CodigoMunicipio             string    `json:"codigo_municipio,omitempty"`
	CodigoIBGE                  string    `json:"codigo_ibge,omitempty"`
	XMLContent                  string    `json:"xml_content,omitempty"`
}
