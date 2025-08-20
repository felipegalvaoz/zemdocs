package model

import (
	"context"
	"time"

	"github.com/uptrace/bun"
)

// NFSe representa o modelo de Nota Fiscal de Serviço Eletrônica
type NFSe struct {
	bun.BaseModel `bun:"table:nfse,alias:n"`

	ID                int       `json:"id" bun:",pk,autoincrement"`
	NumeroNfse        string    `json:"numero_nfse" bun:",unique,notnull"`
	NumeroRps         string    `json:"numero_rps" bun:",notnull"`
	SerieRps          string    `json:"serie_rps" bun:",notnull"`
	TipoRps           int       `json:"tipo_rps" bun:",notnull"`
	DataEmissao       time.Time `json:"data_emissao" bun:",notnull"`
	Status            string    `json:"status" bun:",notnull,default:'pendente'"`
	CodigoVerificacao string    `json:"codigo_verificacao"`
	XMLContent        string    `json:"xml_content" bun:",type:text"`
	ValorServico      float64   `json:"valor_servico" bun:",type:decimal(15,2)"`
	ValorIss          float64   `json:"valor_iss" bun:",type:decimal(15,2)"`
	Competencia       string    `json:"competencia"`
	CreatedAt         time.Time `json:"created_at" bun:",nullzero,notnull,default:current_timestamp"`
	UpdatedAt         time.Time `json:"updated_at" bun:",nullzero,notnull,default:current_timestamp"`
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
	NumeroNfse        string    `json:"numero_nfse"`
	NumeroRps         string    `json:"numero_rps"`
	SerieRps          string    `json:"serie_rps"`
	DataEmissao       time.Time `json:"data_emissao"`
	Status            string    `json:"status"`
	CodigoVerificacao string    `json:"codigo_verificacao"`
	ValorServico      float64   `json:"valor_servico"`
	ValorIss          float64   `json:"valor_iss"`
	Competencia       string    `json:"competencia"`
	XMLContent        string    `json:"xml_content,omitempty"`
}
