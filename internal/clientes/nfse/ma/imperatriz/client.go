package imperatriz

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strconv"
	"time"
	"zemdocs/internal/clientes/nfse"
	"zemdocs/internal/logger"
	"zemdocs/internal/utils"
)

// Client implementa nfse.Client para Imperatriz-MA
type Client struct {
	baseURL    string
	httpClient *http.Client
	token      string
}

// NewClient cria uma nova instância do cliente
func NewClient(baseURL, token string) *Client {
	return &Client{
		baseURL: baseURL,
		token:   token,
		httpClient: &http.Client{
			Timeout: 30 * time.Second,
		},
	}
}

// ConsultarNFSe implementa nfse.Client
func (c *Client) ConsultarNFSe(ctx context.Context, req nfse.ConsultarRequest) (*nfse.Response, error) {
	url := fmt.Sprintf("%s/consultar", c.baseURL)

	// Adicionar parâmetros de query
	if req.NumeroNfse != "" {
		url += "?NumeroNfse=" + req.NumeroNfse
	} else if req.NumeroRps != "" {
		url += "?NumeroRps=" + req.NumeroRps
	}

	resp, err := c.makeRequest(ctx, "GET", url, nil)
	if err != nil {
		return nil, err
	}

	var nfseResp nfse.Response
	if err := json.Unmarshal(resp, &nfseResp); err != nil {
		return nil, fmt.Errorf("erro ao decodificar resposta: %w", err)
	}

	return &nfseResp, nil
}

// ConsultarXMLNFSe implementa nfse.Client
func (c *Client) ConsultarXMLNFSe(ctx context.Context, req nfse.ConsultarXMLRequest) ([]nfse.Response, error) {
	url := fmt.Sprintf("%s/xmlnfse", c.baseURL)

	// Construir query string
	params := make([]string, 0)
	if req.NrInicial != "" && req.NrFinal != "" {
		params = append(params, "nr_inicial="+req.NrInicial, "nr_final="+req.NrFinal)
	} else if req.DtInicial != "" && req.DtFinal != "" {
		params = append(params, "dt_inicial="+req.DtInicial, "dt_final="+req.DtFinal)
		if req.NrPage != "" {
			params = append(params, "nr_page="+req.NrPage)
		}
	} else if req.NrCompetencia != "" {
		params = append(params, "nr_competencia="+req.NrCompetencia)
	}

	if len(params) > 0 {
		url += "?"
		for i, param := range params {
			if i > 0 {
				url += "&"
			}
			url += param
		}
	}

	resp, err := c.makeRequest(ctx, "GET", url, nil)
	if err != nil {
		return nil, err
	}

	// Decodificar resposta da API de Imperatriz
	var apiResp nfse.ImperatrizAPIResponse
	if err := json.Unmarshal(resp, &apiResp); err != nil {
		return nil, fmt.Errorf("erro ao decodificar resposta da API: %w", err)
	}

	// Converter para formato padrão
	return c.convertToStandardFormat(apiResp.Dados)
}

// convertToStandardFormat converte dados da API de Imperatriz para formato padrão
func (c *Client) convertToStandardFormat(dados []nfse.ImperatrizNFSeRecord) ([]nfse.Response, error) {
	var responses []nfse.Response

	for _, record := range dados {
		// Descompactar XML
		xmlContent, err := utils.DecompressXML(record.XmlCompactado)
		if err != nil {
			logger.Error(err, fmt.Sprintf("Erro ao descompactar XML da NFS-e %d", record.NrNfse))
			continue
		}

		// Fazer parse do XML
		xmlData, err := utils.ParseNFSeXML(xmlContent)
		if err != nil {
			logger.Error(err, fmt.Sprintf("Erro ao fazer parse do XML da NFS-e %d", record.NrNfse))
			continue
		}

		// Converter data de emissão
		dataEmissao, err := time.Parse("2006-01-02 15:04:05", record.DtEmissao)
		if err != nil {
			logger.Error(err, fmt.Sprintf("Erro ao converter data de emissão da NFS-e %d", record.NrNfse))
			dataEmissao = time.Now() // Fallback
		}

		// Criar resposta padrão
		response := nfse.Response{
			NumeroNfse:        strconv.Itoa(record.NrNfse),
			NumeroRps:         xmlData.NumeroRps,
			SerieRps:          xmlData.SerieRps,
			DataEmissao:       dataEmissao,
			Status:            "Emitida", // Status padrão
			CodigoVerificacao: xmlData.CodigoVerificacao,
			ValorServico:      xmlData.ValorServico,
			ValorIss:          xmlData.ValorIss,
			Competencia:       strconv.Itoa(record.NrCompetencia),
			XMLContent:        xmlContent,
		}

		responses = append(responses, response)
	}

	return responses, nil
}

// UltimoRPSEnviado implementa nfse.Client
func (c *Client) UltimoRPSEnviado(ctx context.Context) (string, error) {
	url := fmt.Sprintf("%s/ultimorpsenviado", c.baseURL)

	resp, err := c.makeRequest(ctx, "GET", url, nil)
	if err != nil {
		return "", err
	}

	var result map[string]interface{}
	if err := json.Unmarshal(resp, &result); err != nil {
		return "", fmt.Errorf("erro ao decodificar resposta: %w", err)
	}

	if ultimoRps, ok := result["ultimo_rps"].(string); ok {
		return ultimoRps, nil
	}

	return "", fmt.Errorf("campo ultimo_rps não encontrado na resposta")
}

// makeRequest faz uma requisição HTTP para a API
func (c *Client) makeRequest(ctx context.Context, method, url string, body interface{}) ([]byte, error) {
	var reqBody io.Reader
	if body != nil {
		jsonBody, err := json.Marshal(body)
		if err != nil {
			return nil, fmt.Errorf("erro ao serializar body: %w", err)
		}
		reqBody = bytes.NewBuffer(jsonBody)
	}

	req, err := http.NewRequestWithContext(ctx, method, url, reqBody)
	if err != nil {
		return nil, fmt.Errorf("erro ao criar requisição: %w", err)
	}

	// Adicionar headers
	req.Header.Set("Authorization", c.token)
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Accept", "application/json")

	// Log da requisição
	logger.HTTP().Info().
		Str("method", method).
		Str("url", url).
		Msg("External API request")

	start := time.Now()
	resp, err := c.httpClient.Do(req)
	duration := time.Since(start)

	if err != nil {
		logger.HTTP().Error().
			Err(err).
			Str("url", url).
			Dur("dur", duration).
			Msg("External API failed")
		return nil, fmt.Errorf("erro na requisição: %w", err)
	}
	defer resp.Body.Close()

	// Log da resposta
	logger.HTTP().Info().
		Str("url", url).
		Int("status", resp.StatusCode).
		Dur("dur", duration).
		Msg("External API response")

	respBody, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("erro ao ler resposta: %w", err)
	}

	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		return nil, fmt.Errorf("erro HTTP %d: %s", resp.StatusCode, string(respBody))
	}

	return respBody, nil
}
