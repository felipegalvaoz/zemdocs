package service

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"strings"
	"time"
	"zemdocs/internal/database/model"
	"zemdocs/internal/logger"
)

// CNPJAService serviço para integração com a API CNPJA
type CNPJAService struct {
	baseURL    string
	httpClient *http.Client
}

// NewCNPJAService cria uma nova instância do serviço CNPJA
func NewCNPJAService() *CNPJAService {
	return &CNPJAService{
		baseURL: "https://open.cnpja.com/office",
		httpClient: &http.Client{
			Timeout: 30 * time.Second,
		},
	}
}

// ConsultarCNPJ consulta os dados de uma empresa na API CNPJA
func (s *CNPJAService) ConsultarCNPJ(ctx context.Context, cnpj string) (*model.CNPJAResponse, error) {
	// Limpar CNPJ (remover pontuação)
	cnpjLimpo := strings.ReplaceAll(cnpj, ".", "")
	cnpjLimpo = strings.ReplaceAll(cnpjLimpo, "/", "")
	cnpjLimpo = strings.ReplaceAll(cnpjLimpo, "-", "")

	// Validar formato do CNPJ
	if len(cnpjLimpo) != 14 {
		return nil, fmt.Errorf("CNPJ deve ter 14 dígitos")
	}

	// Fazer requisição para a API
	url := fmt.Sprintf("%s/%s", s.baseURL, cnpjLimpo)
	
	req, err := http.NewRequestWithContext(ctx, "GET", url, nil)
	if err != nil {
		return nil, fmt.Errorf("erro ao criar requisição: %w", err)
	}

	// Adicionar headers
	req.Header.Set("Accept", "application/json")
	req.Header.Set("User-Agent", "ZemDocs/1.0")

	logger.Info(fmt.Sprintf("Consultando CNPJ na API: %s", url))

	resp, err := s.httpClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("erro ao fazer requisição: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode == 404 {
		return nil, fmt.Errorf("CNPJ não encontrado")
	}

	if resp.StatusCode == 429 {
		return nil, fmt.Errorf("limite de consultas excedido. Tente novamente em alguns minutos")
	}

	if resp.StatusCode != 200 {
		return nil, fmt.Errorf("erro na API CNPJA: status %d", resp.StatusCode)
	}

	var cnpjaResp model.CNPJAResponse
	if err := json.NewDecoder(resp.Body).Decode(&cnpjaResp); err != nil {
		return nil, fmt.Errorf("erro ao decodificar resposta: %w", err)
	}

	logger.Info(fmt.Sprintf("CNPJ consultado com sucesso: %s - %s", cnpjLimpo, cnpjaResp.RazaoSocial))

	return &cnpjaResp, nil
}

// ConvertToEmpresa converte dados da API CNPJA para o modelo Empresa
func (s *CNPJAService) ConvertToEmpresa(cnpjaResp *model.CNPJAResponse) *model.Empresa {
	empresa := &model.Empresa{
		CNPJ:              cnpjaResp.CNPJ,
		RazaoSocial:       cnpjaResp.RazaoSocial,
		NomeFantasia:      cnpjaResp.NomeFantasia,
		Porte:             cnpjaResp.Porte.Descricao,
		NaturezaJuridica:  cnpjaResp.NaturezaJuridica.Descricao,
		CodigoNatureza:    cnpjaResp.NaturezaJuridica.Codigo,
		SituacaoCadastral: cnpjaResp.SituacaoCadastral.Descricao,
		Email:             cnpjaResp.Email,
		CapitalSocial:     cnpjaResp.CapitalSocial,
		SimplesNacional:   cnpjaResp.SimplesNacional.Optante,
		MEI:               cnpjaResp.SimplesNacional.MEI,
		Ativa:             cnpjaResp.SituacaoCadastral.Codigo == "02", // 02 = Ativa
	}

	// Converter data de abertura
	if cnpjaResp.DataAbertura != "" {
		if dataAbertura, err := time.Parse("2006-01-02", cnpjaResp.DataAbertura); err == nil {
			empresa.DataAbertura = dataAbertura
		}
	}

	// Converter data da situação
	if cnpjaResp.SituacaoCadastral.Data != "" {
		if dataSituacao, err := time.Parse("2006-01-02", cnpjaResp.SituacaoCadastral.Data); err == nil {
			empresa.DataSituacao = dataSituacao
		}
	}

	// Atividade principal
	if cnpjaResp.AtividadePrincipal.Codigo != "" {
		empresa.AtividadePrincipal = cnpjaResp.AtividadePrincipal.Descricao
		empresa.CodigoAtivPrincipal = cnpjaResp.AtividadePrincipal.Codigo
	}

	// Endereço
	empresa.Logradouro = cnpjaResp.Endereco.Logradouro
	empresa.Numero = cnpjaResp.Endereco.Numero
	empresa.Complemento = cnpjaResp.Endereco.Complemento
	empresa.Bairro = cnpjaResp.Endereco.Bairro
	empresa.CEP = cnpjaResp.Endereco.CEP
	empresa.Municipio = cnpjaResp.Endereco.Municipio
	empresa.UF = cnpjaResp.Endereco.UF

	// Telefone (pegar o primeiro se houver)
	if len(cnpjaResp.Telefones) > 0 {
		telefone := cnpjaResp.Telefones[0]
		empresa.Telefone = fmt.Sprintf("(%s) %s", telefone.DDD, telefone.Numero)
	}

	// Motivo da situação
	empresa.MotivoSituacao = cnpjaResp.SituacaoCadastral.Motivo

	return empresa
}

// ConvertAtividadesSecundarias converte as atividades secundárias
func (s *CNPJAService) ConvertAtividadesSecundarias(cnpjaResp *model.CNPJAResponse, empresaID int) []model.AtividadeSecundaria {
	var atividades []model.AtividadeSecundaria

	for _, atividade := range cnpjaResp.AtividadesSecundarias {
		atividades = append(atividades, model.AtividadeSecundaria{
			EmpresaID: empresaID,
			Codigo:    atividade.Codigo,
			Descricao: atividade.Descricao,
		})
	}

	return atividades
}

// ValidarCNPJ valida se o CNPJ tem formato válido
func (s *CNPJAService) ValidarCNPJ(cnpj string) bool {
	// Limpar CNPJ
	cnpjLimpo := strings.ReplaceAll(cnpj, ".", "")
	cnpjLimpo = strings.ReplaceAll(cnpjLimpo, "/", "")
	cnpjLimpo = strings.ReplaceAll(cnpjLimpo, "-", "")

	// Verificar se tem 14 dígitos
	if len(cnpjLimpo) != 14 {
		return false
	}

	// Verificar se todos são dígitos
	for _, char := range cnpjLimpo {
		if char < '0' || char > '9' {
			return false
		}
	}

	// TODO: Implementar validação de dígitos verificadores se necessário
	return true
}

// FormatarCNPJ formata o CNPJ com pontuação
func (s *CNPJAService) FormatarCNPJ(cnpj string) string {
	// Limpar CNPJ
	cnpjLimpo := strings.ReplaceAll(cnpj, ".", "")
	cnpjLimpo = strings.ReplaceAll(cnpjLimpo, "/", "")
	cnpjLimpo = strings.ReplaceAll(cnpjLimpo, "-", "")

	if len(cnpjLimpo) != 14 {
		return cnpj // Retorna original se não for válido
	}

	// Formatar: XX.XXX.XXX/XXXX-XX
	return fmt.Sprintf("%s.%s.%s/%s-%s",
		cnpjLimpo[0:2],
		cnpjLimpo[2:5],
		cnpjLimpo[5:8],
		cnpjLimpo[8:12],
		cnpjLimpo[12:14],
	)
}
