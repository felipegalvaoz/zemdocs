package model

import (
	"context"
	"time"

	"github.com/uptrace/bun"
)

// DocumentType representa os tipos de documentos fiscais suportados
type DocumentType string

const (
	DocumentTypeNFSe DocumentType = "NFS-e"
	DocumentTypeNFe  DocumentType = "NF-e"
	DocumentTypeNFCe DocumentType = "NFC-e"
	DocumentTypeCTe  DocumentType = "CT-e"
	DocumentTypeMDFe DocumentType = "MDF-e"
)

// Document representa o modelo genérico de documentos fiscais no banco de dados
type Document struct {
	bun.BaseModel `bun:"table:documents,alias:d"`

	// Identificação única
	ID                int          `json:"id" bun:",pk,autoincrement"`
	DocumentType      DocumentType `json:"document_type" bun:",notnull"`
	NumeroDocumento   string       `json:"numero_documento" bun:",unique,notnull"`
	CodigoVerificacao string       `json:"codigo_verificacao" bun:",notnull"`

	// Dados do RPS (específico para NFS-e)
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

	// Dados do prestador/emitente
	CNPJEmitente               string `json:"cnpj_emitente" bun:",notnull"`
	RazaoSocialEmitente        string `json:"razao_social_emitente" bun:",notnull"`
	InscricaoMunicipalEmitente string `json:"inscricao_municipal_emitente"`

	// Dados do tomador/destinatário
	CNPJDestinatario        string `json:"cnpj_destinatario"`
	RazaoSocialDestinatario string `json:"razao_social_destinatario"`

	// Informações do serviço/produto
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
func (d *Document) BeforeAppendModel(ctx context.Context, query bun.Query) error {
	switch query.(type) {
	case *bun.InsertQuery:
		d.CreatedAt = time.Now()
		d.UpdatedAt = time.Now()
	case *bun.UpdateQuery:
		d.UpdatedAt = time.Now()
	}
	return nil
}

// DocumentResponse representa a resposta de consulta para o frontend
type DocumentResponse struct {
	ID                         int          `json:"id"`
	DocumentType               DocumentType `json:"document_type"`
	NumeroDocumento            string       `json:"numero_documento"`
	NumeroRps                  string       `json:"numero_rps"`
	SerieRps                   string       `json:"serie_rps"`
	DataEmissao                time.Time    `json:"data_emissao"`
	Status                     string       `json:"status"`
	CodigoVerificacao          string       `json:"codigo_verificacao"`
	ValorNota                  float64      `json:"valor_nota"`
	AliquotaIss                float64      `json:"aliquota_iss"`
	ValorIss                   float64      `json:"valor_iss"`
	Competencia                string       `json:"competencia"`
	CNPJEmitente               string       `json:"cnpj_emitente,omitempty"`
	RazaoSocialEmitente        string       `json:"razao_social_emitente,omitempty"`
	InscricaoMunicipalEmitente string       `json:"inscricao_municipal_emitente,omitempty"`
	CNPJDestinatario           string       `json:"cnpj_destinatario,omitempty"`
	RazaoSocialDestinatario    string       `json:"razao_social_destinatario,omitempty"`
	Discriminacao              string       `json:"discriminacao,omitempty"`
	CodigoServico              string       `json:"codigo_servico,omitempty"`
	ItemListaServico           string       `json:"item_lista_servico,omitempty"`
	CodigoMunicipio            string       `json:"codigo_municipio,omitempty"`
	CodigoIBGE                 string       `json:"codigo_ibge,omitempty"`
	XMLContent                 string       `json:"xml_content,omitempty"`
}

// IsNFSe verifica se o documento é uma NFS-e
func (d *Document) IsNFSe() bool {
	return d.DocumentType == DocumentTypeNFSe
}

// IsNFe verifica se o documento é uma NF-e
func (d *Document) IsNFe() bool {
	return d.DocumentType == DocumentTypeNFe
}

// IsNFCe verifica se o documento é uma NFC-e
func (d *Document) IsNFCe() bool {
	return d.DocumentType == DocumentTypeNFCe
}

// IsCTe verifica se o documento é um CT-e
func (d *Document) IsCTe() bool {
	return d.DocumentType == DocumentTypeCTe
}

// IsMDFe verifica se o documento é um MDF-e
func (d *Document) IsMDFe() bool {
	return d.DocumentType == DocumentTypeMDFe
}

// GetDocumentTypeDisplayName retorna o nome de exibição do tipo de documento
func (dt DocumentType) GetDisplayName() string {
	switch dt {
	case DocumentTypeNFSe:
		return "Nota Fiscal de Serviço Eletrônica"
	case DocumentTypeNFe:
		return "Nota Fiscal Eletrônica"
	case DocumentTypeNFCe:
		return "Nota Fiscal de Consumidor Eletrônica"
	case DocumentTypeCTe:
		return "Conhecimento de Transporte Eletrônico"
	case DocumentTypeMDFe:
		return "Manifesto Eletrônico de Documentos Fiscais"
	default:
		return string(dt)
	}
}

// GetDocumentTypeShortName retorna o nome curto do tipo de documento
func (dt DocumentType) GetShortName() string {
	return string(dt)
}
