package nfse

import (
	"context"
	"time"
)

// Client interface para clientes de NFS-e
type Client interface {
	ConsultarNFSe(ctx context.Context, req ConsultarRequest) (*Response, error)
	ConsultarXMLNFSe(ctx context.Context, req ConsultarXMLRequest) ([]Response, error)
	UltimoRPSEnviado(ctx context.Context) (string, error)
}

// ConsultarRequest estrutura para consulta de NFS-e
type ConsultarRequest struct {
	NumeroNfse string `json:"numero_nfse,omitempty"`
	NumeroRps  string `json:"numero_rps,omitempty"`
}

// ConsultarXMLRequest estrutura para consulta de XMLs
type ConsultarXMLRequest struct {
	NrInicial     string `json:"nr_inicial,omitempty"`
	NrFinal       string `json:"nr_final,omitempty"`
	DtInicial     string `json:"dt_inicial,omitempty"`
	DtFinal       string `json:"dt_final,omitempty"`
	NrPage        string `json:"nr_page,omitempty"`
	NrCompetencia string `json:"nr_competencia,omitempty"`
}

// Response resposta padrão de NFS-e (estrutura unificada)
type Response struct {
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

// ImperatrizAPIResponse estrutura da resposta da API de Imperatriz
type ImperatrizAPIResponse struct {
	RecordCount    int                    `json:"RecordCount"`
	RecordsPerPage int                    `json:"RecordsPerPage"`
	PageCount      int                    `json:"PageCount"`
	CurrentPage    int                    `json:"CurrentPage"`
	Dados          []ImperatrizNFSeRecord `json:"Dados"`
}

// ImperatrizNFSeRecord registro individual da API de Imperatriz
type ImperatrizNFSeRecord struct {
	NrNfse        int    `json:"NrNfse"`
	DtEmissao     string `json:"DtEmissao"`
	NrCompetencia int    `json:"NrCompetencia"`
	XmlCompactado string `json:"XmlCompactado"`
}

// Registry registro de clientes por município
type Registry struct {
	clients map[string]Client
}

// NewRegistry cria um novo registro de municípios
func NewRegistry() *Registry {
	return &Registry{
		clients: make(map[string]Client),
	}
}

// Register registra um cliente para um município
func (r *Registry) Register(codigoIBGE string, client Client) {
	r.clients[codigoIBGE] = client
}

// GetClient retorna o cliente para um município
func (r *Registry) GetClient(codigoIBGE string) (Client, bool) {
	client, exists := r.clients[codigoIBGE]
	return client, exists
}

// ListClients retorna lista de clientes registrados
func (r *Registry) ListClients() map[string]Client {
	return r.clients
}
