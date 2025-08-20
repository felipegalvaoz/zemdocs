package service

import (
	"context"
	"fmt"
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

// ConsultarCNPJAPI consulta dados de CNPJ na API sem salvar
func (s *EmpresaService) ConsultarCNPJAPI(ctx context.Context, cnpj string) (*model.CNPJAResponse, error) {
	// Validar CNPJ
	if !s.cnpjaService.ValidarCNPJ(cnpj) {
		return nil, fmt.Errorf("CNPJ inválido")
	}

	// Consultar na API
	return s.cnpjaService.ConsultarCNPJ(ctx, cnpj)
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
	// Formatar CNPJ
	cnpjFormatado := s.cnpjaService.FormatarCNPJ(cnpj)

	empresa, err := s.empresaRepo.GetByCNPJ(ctx, cnpjFormatado)
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

// CriarEmpresa cria uma empresa com dados fornecidos
func (s *EmpresaService) CriarEmpresa(ctx context.Context, req *model.EmpresaCreateRequest) (*model.EmpresaResponse, error) {
	// Validar CNPJ
	if !s.cnpjaService.ValidarCNPJ(req.CNPJ) {
		return nil, fmt.Errorf("CNPJ inválido")
	}

	// Formatar CNPJ
	cnpjFormatado := s.cnpjaService.FormatarCNPJ(req.CNPJ)

	// Verificar se empresa já existe
	empresaExistente, err := s.empresaRepo.GetByCNPJ(ctx, cnpjFormatado)
	if err == nil && empresaExistente != nil {
		return nil, fmt.Errorf("empresa com CNPJ %s já existe", cnpjFormatado)
	}

	// Criar empresa
	empresa := &model.Empresa{
		CNPJ:         cnpjFormatado,
		RazaoSocial:  req.RazaoSocial,
		NomeFantasia: req.NomeFantasia,
		Email:        req.Email,
		Telefone:     req.Telefone,
		Ativa:        req.Ativa,
	}

	// Salvar no banco
	if err := s.empresaRepo.Create(ctx, empresa); err != nil {
		return nil, fmt.Errorf("erro ao salvar empresa: %w", err)
	}

	logger.Info(fmt.Sprintf("Empresa criada manualmente: %s - %s", empresa.CNPJ, empresa.RazaoSocial))

	return s.toEmpresaResponse(empresa), nil
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

	// Formatar CNPJ
	cnpjFormatado := s.cnpjaService.FormatarCNPJ(cnpj)

	// Verificar se empresa já existe
	empresaExistente, err := s.empresaRepo.GetByCNPJ(ctx, cnpjFormatado)
	if err == nil && empresaExistente != nil {
		return nil, fmt.Errorf("empresa com CNPJ %s já existe", cnpjFormatado)
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

	logger.Info(fmt.Sprintf("Empresa criada com sucesso: %s - %s", empresa.CNPJ, empresa.RazaoSocial))

	return s.toEmpresaResponse(empresa), nil
}

// toEmpresaResponse converte Empresa para EmpresaResponse
func (s *EmpresaService) toEmpresaResponse(empresa *model.Empresa) *model.EmpresaResponse {
	return &model.EmpresaResponse{
		ID:                 empresa.ID,
		CNPJ:               empresa.CNPJ,
		RazaoSocial:        empresa.RazaoSocial,
		NomeFantasia:       empresa.NomeFantasia,
		DataAbertura:       empresa.DataAbertura,
		Porte:              empresa.Porte,
		SituacaoCadastral:  empresa.SituacaoCadastral,
		AtividadePrincipal: empresa.AtividadePrincipal,
		Email:              empresa.Email,
		Telefone:           empresa.Telefone,
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
}
