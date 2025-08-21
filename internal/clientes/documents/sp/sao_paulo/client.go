package sao_paulo

import (
	"context"
	"fmt"
)

// Client implementa nfse.Client para São Paulo-SP
type Client struct {
	baseURL string
	token   string
}

// NewClient cria uma nova instância do cliente
func NewClient(baseURL, token string) *Client {
	return &Client{
		baseURL: baseURL,
		token:   token,
	}
}

// TODO: Implementar integração com API de São Paulo
// As funções abaixo serão implementadas quando o pacote nfse for criado

/*
// ConsultarNFSe implementa nfse.Client
func (c *Client) ConsultarNFSe(ctx context.Context, req nfse.ConsultarRequest) (*nfse.Response, error) {
	// TODO: Implementar integração com API de São Paulo
	return nil, fmt.Errorf("integração com São Paulo não implementada")
}

// ConsultarXMLNFSe implementa nfse.Client
func (c *Client) ConsultarXMLNFSe(ctx context.Context, req nfse.ConsultarXMLRequest) ([]nfse.Response, error) {
	// TODO: Implementar integração com API de São Paulo
	return nil, fmt.Errorf("integração com São Paulo não implementada")
}
*/

// UltimoRPSEnviado implementa nfse.Client
func (c *Client) UltimoRPSEnviado(ctx context.Context) (string, error) {
	// TODO: Implementar integração com API de São Paulo
	return "0", fmt.Errorf("integração com São Paulo não implementada")
}
