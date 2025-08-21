package service

import (
	"context"
	"fmt"
	"strings"
	"time"
	"zemdocs/internal/database/model"
	"zemdocs/internal/database/repository"
	"zemdocs/internal/logger"
)

// EmpresaService serviço para gerenciamento de empresas
type EmpresaService struct {
	empresaRepo  *repository.EmpresaRepository
	cnpjaService *CNPJAService
}

// NewEmpresaService cria uma nova instância do serviço de empresas
func NewEmpresaService(empresaRepo *repository.EmpresaRepository, cnpjaService *CNPJAService) *EmpresaService {
	return &EmpresaService{
		empresaRepo:  empresaRepo,
		cnpjaService: cnpjaService,
	}
}

// ConsultarCNPJAPI consulta dados de CNPJ na API sem salvar e retorna dados estruturados para o frontend
func (s *EmpresaService) ConsultarCNPJAPI(ctx context.Context, cnpj string) (*model.CNPJAFormResponse, error) {
	// Validar CNPJ
	if !s.cnpjaService.ValidarCNPJ(cnpj) {
		return nil, fmt.Errorf("CNPJ inválido")
	}

	// Consultar na API
	cnpjaResp, err := s.cnpjaService.ConsultarCNPJ(ctx, cnpj)
	if err != nil {
		return nil, err
	}

	// Converter para formato do formulário
	return s.convertCNPJAToFormResponse(cnpjaResp), nil
}

// ConsultarPorID consulta uma empresa por ID
func (s *EmpresaService) ConsultarPorID(ctx context.Context, id int) (*model.EmpresaResponse, error) {
	empresa, err := s.empresaRepo.GetByID(ctx, id)
	if err != nil {
		return nil, fmt.Errorf("erro ao buscar empresa: %w", err)
	}

	return s.toEmpresaResponse(empresa), nil
}

// ConsultarPorCNPJ consulta uma empresa por CNPJ
func (s *EmpresaService) ConsultarPorCNPJ(ctx context.Context, cnpj string) (*model.EmpresaResponse, error) {
	// Limpar CNPJ (buscar só números)
	cnpjLimpo := strings.ReplaceAll(cnpj, ".", "")
	cnpjLimpo = strings.ReplaceAll(cnpjLimpo, "/", "")
	cnpjLimpo = strings.ReplaceAll(cnpjLimpo, "-", "")

	empresa, err := s.empresaRepo.GetByCNPJ(ctx, cnpjLimpo)
	if err != nil {
		return nil, fmt.Errorf("erro ao buscar empresa: %w", err)
	}

	return s.toEmpresaResponse(empresa), nil
}

// ListarEmpresas lista todas as empresas com paginação
func (s *EmpresaService) ListarEmpresas(ctx context.Context, limit, offset int) ([]*model.EmpresaResponse, error) {
	empresas, err := s.empresaRepo.GetAll(ctx, limit, offset)
	if err != nil {
		return nil, fmt.Errorf("erro ao listar empresas: %w", err)
	}

	var responses []*model.EmpresaResponse
	for _, empresa := range empresas {
		responses = append(responses, s.toEmpresaResponse(empresa))
	}

	return responses, nil
}

// BuscarEmpresas busca empresas por termo
func (s *EmpresaService) BuscarEmpresas(ctx context.Context, termo string, limit, offset int) ([]*model.EmpresaResponse, error) {
	empresas, err := s.empresaRepo.Search(ctx, termo, limit, offset)
	if err != nil {
		return nil, fmt.Errorf("erro ao buscar empresas: %w", err)
	}

	var responses []*model.EmpresaResponse
	for _, empresa := range empresas {
		responses = append(responses, s.toEmpresaResponse(empresa))
	}

	return responses, nil
}

// AtualizarEmpresa atualiza uma empresa
func (s *EmpresaService) AtualizarEmpresa(ctx context.Context, id int, req *model.EmpresaUpdateRequest) (*model.EmpresaResponse, error) {
	// Buscar empresa existente
	empresa, err := s.empresaRepo.GetByID(ctx, id)
	if err != nil {
		return nil, fmt.Errorf("empresa não encontrada: %w", err)
	}

	// Atualizar campos
	empresa.RazaoSocial = req.RazaoSocial
	empresa.NomeFantasia = req.NomeFantasia
	empresa.Email = req.Email
	empresa.Telefone = req.Telefone
	empresa.Ativa = req.Ativa

	// Salvar no banco
	if err := s.empresaRepo.Update(ctx, empresa); err != nil {
		return nil, fmt.Errorf("erro ao atualizar empresa: %w", err)
	}

	logger.Info(fmt.Sprintf("Empresa atualizada: %s - %s", empresa.CNPJ, empresa.RazaoSocial))

	return s.toEmpresaResponse(empresa), nil
}

// ExcluirEmpresa exclui uma empresa
func (s *EmpresaService) ExcluirEmpresa(ctx context.Context, id int) error {
	// Verificar se empresa existe
	empresa, err := s.empresaRepo.GetByID(ctx, id)
	if err != nil {
		return fmt.Errorf("empresa não encontrada: %w", err)
	}

	// Excluir empresa
	if err := s.empresaRepo.Delete(ctx, id); err != nil {
		return fmt.Errorf("erro ao excluir empresa: %w", err)
	}

	logger.Info(fmt.Sprintf("Empresa excluída: %s - %s", empresa.CNPJ, empresa.RazaoSocial))

	return nil
}

// CriarEmpresaPorCNPJ cria uma empresa consultando dados na API CNPJA
func (s *EmpresaService) CriarEmpresaPorCNPJ(ctx context.Context, cnpj string) (*model.EmpresaResponse, error) {
	// Validar CNPJ
	if !s.cnpjaService.ValidarCNPJ(cnpj) {
		return nil, fmt.Errorf("CNPJ inválido")
	}

	// Limpar CNPJ (salvar só números)
	cnpjLimpo := strings.ReplaceAll(cnpj, ".", "")
	cnpjLimpo = strings.ReplaceAll(cnpjLimpo, "/", "")
	cnpjLimpo = strings.ReplaceAll(cnpjLimpo, "-", "")

	// Verificar se empresa já existe
	empresaExistente, err := s.empresaRepo.GetByCNPJ(ctx, cnpjLimpo)
	if err == nil && empresaExistente != nil {
		return nil, fmt.Errorf("empresa com CNPJ %s já existe", s.cnpjaService.FormatarCNPJ(cnpjLimpo))
	}

	// Consultar dados na API CNPJA
	cnpjaResp, err := s.cnpjaService.ConsultarCNPJ(ctx, cnpj)
	if err != nil {
		return nil, fmt.Errorf("erro ao consultar CNPJ na API: %w", err)
	}

	// Converter para modelo Empresa
	empresa := s.cnpjaService.ConvertToEmpresa(cnpjaResp)

	// Salvar empresa no banco
	if err := s.empresaRepo.Create(ctx, empresa); err != nil {
		return nil, fmt.Errorf("erro ao salvar empresa: %w", err)
	}

	// Salvar dados relacionados
	if err := s.salvarDadosRelacionados(ctx, cnpjaResp, empresa.ID); err != nil {
		logger.Error(err, fmt.Sprintf("Erro ao salvar dados relacionados da empresa %s", empresa.CNPJ))
		// Não falha a criação da empresa, apenas loga o erro
	}

	logger.Info(fmt.Sprintf("Empresa criada com sucesso: %s - %s", empresa.CNPJ, empresa.RazaoSocial))

	return s.toEmpresaResponse(empresa), nil
}

// CriarEmpresaCompleta cria uma empresa com todos os dados relacionados
func (s *EmpresaService) CriarEmpresaCompleta(ctx context.Context, formData *model.CNPJAFormResponse) (*model.EmpresaResponse, error) {
	// Limpar CNPJ
	cnpjLimpo := strings.ReplaceAll(formData.CNPJ, ".", "")
	cnpjLimpo = strings.ReplaceAll(cnpjLimpo, "/", "")
	cnpjLimpo = strings.ReplaceAll(cnpjLimpo, "-", "")

	// Verificar se empresa já existe
	empresaExistente, err := s.empresaRepo.GetByCNPJ(ctx, cnpjLimpo)
	if err == nil && empresaExistente != nil {
		return nil, fmt.Errorf("⚠️ Empresa já cadastrada!\n\nUma empresa com este CNPJ já está registrada no sistema. Verifique a listagem de empresas ou use um CNPJ diferente.")
	}

	// Converter dados do formulário para modelo Empresa
	empresa := s.convertFormToEmpresa(formData)

	// Salvar empresa no banco
	if err := s.empresaRepo.Create(ctx, empresa); err != nil {
		return nil, fmt.Errorf("erro ao salvar empresa: %w", err)
	}

	// Salvar dados relacionados do formulário
	if err := s.salvarDadosRelacionadosForm(ctx, formData, empresa.ID); err != nil {
		logger.Error(err, fmt.Sprintf("Erro ao salvar dados relacionados da empresa %s", empresa.CNPJ))
		// Não falha a criação da empresa, apenas loga o erro
	}

	logger.Info(fmt.Sprintf("Empresa criada com sucesso: %s - %s", empresa.CNPJ, empresa.RazaoSocial))

	return s.toEmpresaResponse(empresa), nil
}

// toEmpresaResponse converte Empresa para EmpresaResponse
func (s *EmpresaService) toEmpresaResponse(empresa *model.Empresa) *model.EmpresaResponse {
	response := &model.EmpresaResponse{
		ID:                 empresa.ID,
		CNPJ:               s.cnpjaService.FormatarCNPJ(empresa.CNPJ), // Formatar para apresentação
		RazaoSocial:        empresa.RazaoSocial,
		NomeFantasia:       empresa.NomeFantasia,
		DataAbertura:       empresa.DataAbertura,
		Porte:              empresa.Porte,
		SituacaoCadastral:  empresa.SituacaoCadastral,
		AtividadePrincipal: empresa.AtividadePrincipal,
		NaturezaJuridica:   empresa.NaturezaJuridica,
		CapitalSocial:      empresa.CapitalSocial,
		SimplesNacional:    empresa.SimplesNacional,
		MEI:                empresa.MEI,
		Ativa:              empresa.Ativa,
		Email:              empresa.Email,
		Telefone:           empresa.Telefone,
		CreatedAt:          empresa.CreatedAt,
		UpdatedAt:          empresa.UpdatedAt,
		Endereco: model.EnderecoResponse{
			Logradouro:  empresa.Logradouro,
			Numero:      empresa.Numero,
			Complemento: empresa.Complemento,
			CEP:         empresa.CEP,
			Bairro:      empresa.Bairro,
			Municipio:   empresa.Municipio,
			UF:          empresa.UF,
		},
	}

	// TODO: Carregar dados relacionados (membros, telefones, emails, etc.)
	// Por enquanto, retorna apenas os dados básicos para manter compatibilidade
	// Os dados relacionados serão carregados em endpoints específicos

	return response
}

// salvarDadosRelacionados salva todos os dados relacionados da empresa
func (s *EmpresaService) salvarDadosRelacionados(ctx context.Context, cnpjaResp *model.CNPJAResponse, empresaID int) error {
	// Salvar atividades secundárias
	atividades := s.cnpjaService.ConvertAtividadesSecundarias(cnpjaResp, empresaID)
	for _, atividade := range atividades {
		if err := s.empresaRepo.CreateAtividadeSecundaria(ctx, &atividade); err != nil {
			logger.Error(err, "Erro ao salvar atividade secundária")
		}
	}

	// Salvar membros/sócios
	membros := s.cnpjaService.ConvertMembros(cnpjaResp, empresaID)
	for _, membro := range membros {
		if err := s.empresaRepo.CreateMembro(ctx, &membro); err != nil {
			logger.Error(err, "Erro ao salvar membro da empresa")
		}
	}

	// Salvar inscrições estaduais
	inscricoes := s.cnpjaService.ConvertInscricoesEstaduais(cnpjaResp, empresaID)
	for _, inscricao := range inscricoes {
		if err := s.empresaRepo.CreateInscricaoEstadual(ctx, &inscricao); err != nil {
			logger.Error(err, "Erro ao salvar inscrição estadual")
		}
	}

	// Salvar telefones
	telefones := s.cnpjaService.ConvertTelefones(cnpjaResp, empresaID)
	for _, telefone := range telefones {
		if err := s.empresaRepo.CreateTelefone(ctx, &telefone); err != nil {
			logger.Error(err, "Erro ao salvar telefone")
		}
	}

	// Salvar emails
	emails := s.cnpjaService.ConvertEmails(cnpjaResp, empresaID)
	for _, email := range emails {
		if err := s.empresaRepo.CreateEmail(ctx, &email); err != nil {
			logger.Error(err, "Erro ao salvar email")
		}
	}

	// Salvar dados SUFRAMA (se houver)
	suframas := s.cnpjaService.ConvertSuframa(cnpjaResp, empresaID)
	for _, suframa := range suframas {
		if err := s.empresaRepo.CreateSuframa(ctx, &suframa); err != nil {
			logger.Error(err, "Erro ao salvar dados SUFRAMA")
		}
	}

	return nil
}

// convertCNPJAToFormResponse converte resposta da API CNPJA para formato do formulário
func (s *EmpresaService) convertCNPJAToFormResponse(cnpjaResp *model.CNPJAResponse) *model.CNPJAFormResponse {
	response := &model.CNPJAFormResponse{
		// Dados básicos
		CNPJ:               cnpjaResp.TaxID,
		RazaoSocial:        cnpjaResp.Company.Name,
		NomeFantasia:       cnpjaResp.Alias,
		DataAbertura:       cnpjaResp.Founded,
		Porte:              cnpjaResp.Company.Size.Text,
		NaturezaJuridica:   cnpjaResp.Company.Nature.Text,
		AtividadePrincipal: cnpjaResp.MainActivity.Text,
		SituacaoCadastral:  cnpjaResp.Status.Text,
		CapitalSocial:      cnpjaResp.Company.Equity,
		SimplesNacional:    cnpjaResp.Company.Simples.Optant,
		MEI:                cnpjaResp.Company.Simei.Optant,
		Ativa:              cnpjaResp.Status.ID == 2, // Status ativo

		// Endereço
		Logradouro:  cnpjaResp.Address.Street,
		Numero:      cnpjaResp.Address.Number,
		Complemento: cnpjaResp.Address.Details,
		CEP:         cnpjaResp.Address.Zip,
		Bairro:      cnpjaResp.Address.District,
		Municipio:   cnpjaResp.Address.City,
		UF:          cnpjaResp.Address.State,
	}

	// Contato principal (primeiro email e telefone se disponíveis)
	if len(cnpjaResp.Emails) > 0 {
		response.Email = cnpjaResp.Emails[0].Address
	}
	if len(cnpjaResp.Phones) > 0 {
		response.Telefone = fmt.Sprintf("(%s) %s", cnpjaResp.Phones[0].Area, cnpjaResp.Phones[0].Number)
	}

	// Atividades secundárias
	for _, atividade := range cnpjaResp.SideActivities {
		response.AtividadesSecundarias = append(response.AtividadesSecundarias, atividade.Text)
	}

	// Membros/Sócios
	for _, membro := range cnpjaResp.Company.Members {
		response.Membros = append(response.Membros, model.CNPJAMembroForm{
			Nome:       membro.Person.Name,
			Documento:  membro.Person.TaxID,
			Cargo:      membro.Role.Text,
			DataInicio: membro.Since,
			Idade:      membro.Person.Age,
		})
	}

	// Telefones
	for _, telefone := range cnpjaResp.Phones {
		response.Telefones = append(response.Telefones, model.CNPJATelefoneForm{
			Tipo:   telefone.Type,
			DDD:    telefone.Area,
			Numero: telefone.Number,
		})
	}

	// Emails
	for _, email := range cnpjaResp.Emails {
		response.Emails = append(response.Emails, model.CNPJAEmailForm{
			Email: email.Address,
			Tipo:  email.Ownership,
		})
	}

	// Inscrições estaduais
	for _, registro := range cnpjaResp.Registrations {
		response.InscricoesEstaduais = append(response.InscricoesEstaduais, model.CNPJAInscricaoForm{
			Estado: registro.State,
			Numero: registro.Number,
			Status: registro.Status.Text,
		})
	}

	// Dados SUFRAMA
	for _, suframa := range cnpjaResp.Suframa {
		response.DadosSuframa = append(response.DadosSuframa, model.CNPJASuframaForm{
			Numero:         suframa.Number,
			DataCadastro:   suframa.Since,
			DataVencimento: suframa.ApprovalDate,
			TipoIncentivo:  s.getSuframaIncentiveTypes(suframa.Incentives),
			Ativa:          suframa.Approved,
		})
	}

	return response
}

// getSuframaIncentiveTypes extrai tipos de incentivos SUFRAMA
func (s *EmpresaService) getSuframaIncentiveTypes(incentives []model.CNPJAIncentive) string {
	if len(incentives) == 0 {
		return ""
	}

	var tipos []string
	for _, incentivo := range incentives {
		tipos = append(tipos, incentivo.Tribute)
	}

	return strings.Join(tipos, ", ")
}

// convertFormToEmpresa converte dados do formulário para modelo Empresa
func (s *EmpresaService) convertFormToEmpresa(formData *model.CNPJAFormResponse) *model.Empresa {
	// Parse da data de abertura
	var dataAbertura time.Time
	if formData.DataAbertura != "" {
		if parsed, err := time.Parse("2006-01-02", formData.DataAbertura); err == nil {
			dataAbertura = parsed
		}
	}

	return &model.Empresa{
		CNPJ:               strings.ReplaceAll(strings.ReplaceAll(strings.ReplaceAll(formData.CNPJ, ".", ""), "/", ""), "-", ""),
		InscricaoEstadual:  formData.InscricaoEstadual,
		InscricaoMunicipal: formData.InscricaoMunicipal,
		RazaoSocial:        formData.RazaoSocial,
		NomeFantasia:       formData.NomeFantasia,
		DataAbertura:       dataAbertura,
		Porte:              formData.Porte,
		NaturezaJuridica:   formData.NaturezaJuridica,
		AtividadePrincipal: formData.AtividadePrincipal,
		SituacaoCadastral:  formData.SituacaoCadastral,
		Logradouro:         formData.Logradouro,
		Numero:             formData.Numero,
		Complemento:        formData.Complemento,
		CEP:                formData.CEP,
		Bairro:             formData.Bairro,
		Municipio:          formData.Municipio,
		UF:                 formData.UF,
		Email:              formData.Email,
		Telefone:           formData.Telefone,
		CapitalSocial:      formData.CapitalSocial,
		SimplesNacional:    formData.SimplesNacional,
		MEI:                formData.MEI,
		Ativa:              formData.Ativa,
	}
}

// salvarDadosRelacionadosForm salva todos os dados relacionados do formulário
func (s *EmpresaService) salvarDadosRelacionadosForm(ctx context.Context, formData *model.CNPJAFormResponse, empresaID int) error {
	// Salvar atividades secundárias
	for _, atividade := range formData.AtividadesSecundarias {
		if atividade != "" {
			atividadeModel := &model.AtividadeSecundaria{
				EmpresaID: empresaID,
				Codigo:    "MANUAL",
				Descricao: atividade,
			}
			if err := s.empresaRepo.CreateAtividadeSecundaria(ctx, atividadeModel); err != nil {
				logger.Error(err, "Erro ao salvar atividade secundária")
			}
		}
	}

	// Salvar membros/sócios
	for _, membro := range formData.Membros {
		if membro.Nome != "" {
			var dataInicio time.Time
			if membro.DataInicio != "" {
				if parsed, err := time.Parse("2006-01-02", membro.DataInicio); err == nil {
					dataInicio = parsed
				}
			}

			membroModel := &model.EmpresaMembro{
				EmpresaID:       empresaID,
				TipoDocumento:   "CPF", // Assumir CPF por padrão
				NumeroDocumento: membro.Documento,
				Nome:            membro.Nome,
				Idade:           membro.Idade,
				CargoNome:       membro.Cargo,
				DataInicio:      dataInicio,
			}
			if err := s.empresaRepo.CreateMembro(ctx, membroModel); err != nil {
				logger.Error(err, "Erro ao salvar membro da empresa")
			}
		}
	}

	// Salvar telefones adicionais
	for _, telefone := range formData.Telefones {
		if telefone.Numero != "" {
			telefoneModel := &model.EmpresaTelefone{
				EmpresaID: empresaID,
				Tipo:      telefone.Tipo,
				DDD:       telefone.DDD,
				Numero:    telefone.Numero,
				Principal: false,
			}
			if err := s.empresaRepo.CreateTelefone(ctx, telefoneModel); err != nil {
				logger.Error(err, "Erro ao salvar telefone")
			}
		}
	}

	// Salvar emails adicionais
	for _, email := range formData.Emails {
		if email.Email != "" {
			emailModel := &model.EmpresaEmail{
				EmpresaID: empresaID,
				Email:     email.Email,
				Tipo:      email.Tipo,
				Principal: false,
			}
			if err := s.empresaRepo.CreateEmail(ctx, emailModel); err != nil {
				logger.Error(err, "Erro ao salvar email")
			}
		}
	}

	// Salvar inscrições estaduais adicionais
	for _, inscricao := range formData.InscricoesEstaduais {
		if inscricao.Numero != "" {
			inscricaoModel := &model.EmpresaInscricaoEstadual{
				EmpresaID:  empresaID,
				Numero:     inscricao.Numero,
				Estado:     inscricao.Estado,
				Ativa:      inscricao.Status == "Ativa",
				StatusNome: inscricao.Status,
			}
			if err := s.empresaRepo.CreateInscricaoEstadual(ctx, inscricaoModel); err != nil {
				logger.Error(err, "Erro ao salvar inscrição estadual")
			}
		}
	}

	// Salvar dados SUFRAMA
	for _, suframa := range formData.DadosSuframa {
		if suframa.Numero != "" {
			var dataCadastro, dataVencimento time.Time
			if suframa.DataCadastro != "" {
				if parsed, err := time.Parse("2006-01-02", suframa.DataCadastro); err == nil {
					dataCadastro = parsed
				}
			}
			if suframa.DataVencimento != "" {
				if parsed, err := time.Parse("2006-01-02", suframa.DataVencimento); err == nil {
					dataVencimento = parsed
				}
			}

			suframaModel := &model.EmpresaSuframa{
				EmpresaID:      empresaID,
				Numero:         suframa.Numero,
				DataCadastro:   dataCadastro,
				DataVencimento: dataVencimento,
				Ativa:          suframa.Ativa,
				TipoIncentivo:  suframa.TipoIncentivo,
			}
			if err := s.empresaRepo.CreateSuframa(ctx, suframaModel); err != nil {
				logger.Error(err, "Erro ao salvar dados SUFRAMA")
			}
		}
	}

	return nil
}

// ObterEstatisticas retorna estatísticas das empresas
func (s *EmpresaService) ObterEstatisticas(ctx context.Context) (map[string]interface{}, error) {
	// Buscar todas as empresas para calcular estatísticas
	empresas, err := s.empresaRepo.GetAll(ctx, 1000, 0) // Limite alto para pegar todas
	if err != nil {
		return nil, fmt.Errorf("erro ao buscar empresas: %w", err)
	}

	// Calcular estatísticas básicas
	total := len(empresas)
	ativas := 0
	mei := 0
	simplesNacional := 0
	porUF := make(map[string]int)
	porPorte := make(map[string]int)
	porSituacao := make(map[string]int)

	for _, empresa := range empresas {
		// Contar ativas
		if empresa.Ativa {
			ativas++
		}

		// Contar MEI
		if empresa.MEI {
			mei++
		}

		// Contar Simples Nacional
		if empresa.SimplesNacional {
			simplesNacional++
		}

		// Distribuição por UF
		if empresa.UF != "" {
			porUF[empresa.UF]++
		}

		// Distribuição por porte
		if empresa.Porte != "" {
			porPorte[empresa.Porte]++
		}

		// Distribuição por situação
		if empresa.SituacaoCadastral != "" {
			porSituacao[empresa.SituacaoCadastral]++
		}
	}

	// Calcular empresas novas este ano
	anoAtual := time.Now().Year()
	novasEsteAno := 0
	for _, empresa := range empresas {
		if !empresa.DataAbertura.IsZero() && empresa.DataAbertura.Year() == anoAtual {
			novasEsteAno++
		}
	}

	stats := map[string]interface{}{
		"total":            total,
		"ativas":           ativas,
		"inativas":         total - ativas,
		"mei":              mei,
		"simples_nacional": simplesNacional,
		"novas_este_ano":   novasEsteAno,
		"por_uf":           porUF,
		"por_porte":        porPorte,
		"por_situacao":     porSituacao,
	}

	return stats, nil
}
