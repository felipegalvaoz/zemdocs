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

	logger.Info(fmt.Sprintf("CNPJ consultado com sucesso: %s - %s", cnpjLimpo, cnpjaResp.Company.Name))

	return &cnpjaResp, nil
}

// ConvertToEmpresa converte dados da API CNPJA para o modelo Empresa
func (s *CNPJAService) ConvertToEmpresa(cnpjaResp *model.CNPJAResponse) *model.Empresa {
	// Garantir que o CNPJ seja salvo limpo (só números)
	cnpjLimpo := strings.ReplaceAll(cnpjaResp.TaxID, ".", "")
	cnpjLimpo = strings.ReplaceAll(cnpjLimpo, "/", "")
	cnpjLimpo = strings.ReplaceAll(cnpjLimpo, "-", "")

	empresa := &model.Empresa{
		CNPJ:              cnpjLimpo, // Salvar limpo
		RazaoSocial:       cnpjaResp.Company.Name,
		NomeFantasia:      cnpjaResp.Alias,
		Porte:             cnpjaResp.Company.Size.Text,
		NaturezaJuridica:  cnpjaResp.Company.Nature.Text,
		CodigoNatureza:    fmt.Sprintf("%d", cnpjaResp.Company.Nature.ID),
		SituacaoCadastral: cnpjaResp.Status.Text,
		CapitalSocial:     cnpjaResp.Company.Equity,
		SimplesNacional:   cnpjaResp.Company.Simples.Optant,
		MEI:               cnpjaResp.Company.Simei.Optant,
		Ativa:             cnpjaResp.Status.ID == 2, // 2 = Ativa na API CNPJA
	}

	// Preencher email se disponível
	if len(cnpjaResp.Emails) > 0 {
		empresa.Email = cnpjaResp.Emails[0].Address
	}

	// Converter data de abertura
	if cnpjaResp.Founded != "" {
		if dataAbertura, err := time.Parse("2006-01-02", cnpjaResp.Founded); err == nil {
			empresa.DataAbertura = dataAbertura
		}
	}

	// Converter data da situação
	if cnpjaResp.StatusDate != "" {
		if dataSituacao, err := time.Parse("2006-01-02", cnpjaResp.StatusDate); err == nil {
			empresa.DataSituacao = dataSituacao
		}
	}

	// Atividade principal
	if cnpjaResp.MainActivity.ID != 0 {
		empresa.AtividadePrincipal = cnpjaResp.MainActivity.Text
		empresa.CodigoAtivPrincipal = fmt.Sprintf("%d", cnpjaResp.MainActivity.ID)
	}

	// Endereço
	empresa.Logradouro = cnpjaResp.Address.Street
	empresa.Numero = cnpjaResp.Address.Number
	empresa.Complemento = cnpjaResp.Address.Details
	empresa.Bairro = cnpjaResp.Address.District
	empresa.CEP = cnpjaResp.Address.Zip
	empresa.Municipio = cnpjaResp.Address.City
	empresa.UF = cnpjaResp.Address.State

	// Telefone (pegar o primeiro se houver)
	if len(cnpjaResp.Phones) > 0 {
		telefone := cnpjaResp.Phones[0]
		empresa.Telefone = fmt.Sprintf("(%s) %s", telefone.Area, telefone.Number)
	}

	// Motivo da situação (não disponível na nova API, deixar vazio)
	empresa.MotivoSituacao = ""

	return empresa
}

// ConvertAtividadesSecundarias converte as atividades secundárias
func (s *CNPJAService) ConvertAtividadesSecundarias(cnpjaResp *model.CNPJAResponse, empresaID int) []model.AtividadeSecundaria {
	var atividades []model.AtividadeSecundaria

	for _, atividade := range cnpjaResp.SideActivities {
		atividades = append(atividades, model.AtividadeSecundaria{
			EmpresaID: empresaID,
			Codigo:    fmt.Sprintf("%d", atividade.ID),
			Descricao: atividade.Text,
		})
	}

	return atividades
}

// ConvertMembros converte os membros/sócios da empresa
func (s *CNPJAService) ConvertMembros(cnpjaResp *model.CNPJAResponse, empresaID int) []model.EmpresaMembro {
	var membros []model.EmpresaMembro

	for _, membro := range cnpjaResp.Company.Members {
		empresaMembro := model.EmpresaMembro{
			EmpresaID:       empresaID,
			TipoDocumento:   membro.Person.Type,
			NumeroDocumento: membro.Person.TaxID,
			Nome:            membro.Person.Name,
			Idade:           membro.Person.Age,
			CargoID:         membro.Role.ID,
			CargoNome:       membro.Role.Text,
		}

		// Converter data de início se disponível
		if membro.Since != "" {
			if dataInicio, err := time.Parse("2006-01-02", membro.Since); err == nil {
				empresaMembro.DataInicio = dataInicio
			}
		}

		membros = append(membros, empresaMembro)
	}

	return membros
}

// ConvertInscricoesEstaduais converte as inscrições estaduais
func (s *CNPJAService) ConvertInscricoesEstaduais(cnpjaResp *model.CNPJAResponse, empresaID int) []model.EmpresaInscricaoEstadual {
	var inscricoes []model.EmpresaInscricaoEstadual

	for _, registro := range cnpjaResp.Registrations {
		inscricao := model.EmpresaInscricaoEstadual{
			EmpresaID:  empresaID,
			Numero:     registro.Number,
			Estado:     registro.State,
			Ativa:      registro.Enabled,
			StatusID:   registro.Status.ID,
			StatusNome: registro.Status.Text,
			TipoID:     registro.Type.ID,
			TipoNome:   registro.Type.Text,
		}

		// Converter data do status se disponível
		if registro.StatusDate != "" {
			if dataStatus, err := time.Parse("2006-01-02", registro.StatusDate); err == nil {
				inscricao.DataStatus = dataStatus
			}
		}

		inscricoes = append(inscricoes, inscricao)
	}

	return inscricoes
}

// ConvertTelefones converte os telefones da empresa
func (s *CNPJAService) ConvertTelefones(cnpjaResp *model.CNPJAResponse, empresaID int) []model.EmpresaTelefone {
	var telefones []model.EmpresaTelefone

	for i, telefone := range cnpjaResp.Phones {
		empresaTelefone := model.EmpresaTelefone{
			EmpresaID: empresaID,
			Tipo:      telefone.Type,
			DDD:       telefone.Area,
			Numero:    telefone.Number,
			Principal: i == 0, // Primeiro telefone é considerado principal
		}

		telefones = append(telefones, empresaTelefone)
	}

	return telefones
}

// ConvertEmails converte os emails da empresa
func (s *CNPJAService) ConvertEmails(cnpjaResp *model.CNPJAResponse, empresaID int) []model.EmpresaEmail {
	var emails []model.EmpresaEmail

	for i, email := range cnpjaResp.Emails {
		empresaEmail := model.EmpresaEmail{
			EmpresaID: empresaID,
			Email:     email.Address,
			Dominio:   email.Domain,
			Tipo:      email.Ownership,
			Principal: i == 0, // Primeiro email é considerado principal
		}

		emails = append(emails, empresaEmail)
	}

	return emails
}

// ConvertSuframa converte os dados SUFRAMA (se disponíveis)
func (s *CNPJAService) ConvertSuframa(cnpjaResp *model.CNPJAResponse, empresaID int) []model.EmpresaSuframa {
	var suframas []model.EmpresaSuframa

	for _, suframa := range cnpjaResp.Suframa {
		empresaSuframa := model.EmpresaSuframa{
			EmpresaID:        empresaID,
			Numero:           suframa.Number,
			Ativa:            suframa.Approved,
			IncentivosAtivos: len(suframa.Incentives) > 0,
		}

		// Converter data de cadastro se disponível
		if suframa.Since != "" {
			if dataCadastro, err := time.Parse("2006-01-02", suframa.Since); err == nil {
				empresaSuframa.DataCadastro = dataCadastro
			}
		}

		// Converter data de aprovação se disponível
		if suframa.ApprovalDate != "" {
			if dataVencimento, err := time.Parse("2006-01-02", suframa.ApprovalDate); err == nil {
				empresaSuframa.DataVencimento = dataVencimento
			}
		}

		// Processar incentivos se houver
		if len(suframa.Incentives) > 0 {
			var incentivos []string
			for _, incentivo := range suframa.Incentives {
				incentivos = append(incentivos, fmt.Sprintf("%s: %s", incentivo.Tribute, incentivo.Benefit))
			}
			empresaSuframa.TipoIncentivo = suframa.Incentives[0].Tribute
			empresaSuframa.DescricaoIncentivo = fmt.Sprintf("Benefícios: %s", strings.Join(incentivos, "; "))
		}

		suframas = append(suframas, empresaSuframa)
	}

	return suframas
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
