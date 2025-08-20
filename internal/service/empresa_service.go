package service

import (
	"context"
	"errors"
	"regexp"
	"zemdocs/internal/database/model"
	"zemdocs/internal/database/repository"
)

type EmpresaService struct {
	empresaRepo *repository.EmpresaRepository
}

func NewEmpresaService(empresaRepo *repository.EmpresaRepository) *EmpresaService {
	return &EmpresaService{
		empresaRepo: empresaRepo,
	}
}

// CreateEmpresa cria uma nova empresa
func (s *EmpresaService) CreateEmpresa(ctx context.Context, empresa *model.Empresa) (*model.Empresa, error) {
	// Validar CNPJ
	if !s.isValidCNPJ(empresa.CNPJ) {
		return nil, errors.New("CNPJ inválido")
	}

	// Verificar se CNPJ já existe
	existing, _ := s.empresaRepo.GetByCNPJ(ctx, empresa.CNPJ)
	if existing != nil {
		return nil, errors.New("CNPJ já cadastrado")
	}

	// Limpar e formatar CNPJ
	empresa.CNPJ = s.formatCNPJ(empresa.CNPJ)

	err := s.empresaRepo.Create(ctx, empresa)
	if err != nil {
		return nil, err
	}

	return empresa, nil
}

// GetEmpresaByCNPJ busca empresa por CNPJ
func (s *EmpresaService) GetEmpresaByCNPJ(ctx context.Context, cnpj string) (*model.EmpresaResponse, error) {
	cnpj = s.cleanCNPJ(cnpj)
	empresa, err := s.empresaRepo.GetByCNPJ(ctx, cnpj)
	if err != nil {
		return nil, err
	}

	// Buscar atividades secundárias
	atividades, _ := s.empresaRepo.GetAtividadesByEmpresa(ctx, empresa.ID)

	return s.toResponse(empresa, atividades), nil
}

// GetEmpresaByID busca empresa por ID
func (s *EmpresaService) GetEmpresaByID(ctx context.Context, id int) (*model.EmpresaResponse, error) {
	empresa, err := s.empresaRepo.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}

	// Buscar atividades secundárias
	atividades, _ := s.empresaRepo.GetAtividadesByEmpresa(ctx, empresa.ID)

	return s.toResponse(empresa, atividades), nil
}

// ListEmpresas lista empresas com paginação
func (s *EmpresaService) ListEmpresas(ctx context.Context, page, limit int) ([]*model.EmpresaResponse, int, error) {
	if page < 1 {
		page = 1
	}
	if limit < 1 || limit > 100 {
		limit = 20
	}

	offset := (page - 1) * limit

	empresas, err := s.empresaRepo.GetAll(ctx, limit, offset)
	if err != nil {
		return nil, 0, err
	}

	total, err := s.empresaRepo.Count(ctx)
	if err != nil {
		return nil, 0, err
	}

	var responses []*model.EmpresaResponse
	for _, empresa := range empresas {
		responses = append(responses, s.toResponseSimple(empresa))
	}

	return responses, total, nil
}

// SearchEmpresas busca empresas por termo
func (s *EmpresaService) SearchEmpresas(ctx context.Context, termo string, page, limit int) ([]*model.EmpresaResponse, int, error) {
	if page < 1 {
		page = 1
	}
	if limit < 1 || limit > 100 {
		limit = 20
	}

	offset := (page - 1) * limit

	empresas, err := s.empresaRepo.Search(ctx, termo, limit, offset)
	if err != nil {
		return nil, 0, err
	}

	total, err := s.empresaRepo.CountBySearch(ctx, termo)
	if err != nil {
		return nil, 0, err
	}

	var responses []*model.EmpresaResponse
	for _, empresa := range empresas {
		responses = append(responses, s.toResponseSimple(empresa))
	}

	return responses, total, nil
}

// UpdateEmpresa atualiza uma empresa
func (s *EmpresaService) UpdateEmpresa(ctx context.Context, id int, empresa *model.Empresa) (*model.Empresa, error) {
	existing, err := s.empresaRepo.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}

	// Manter ID e timestamps
	empresa.ID = existing.ID
	empresa.CreatedAt = existing.CreatedAt

	err = s.empresaRepo.Update(ctx, empresa)
	if err != nil {
		return nil, err
	}

	return empresa, nil
}

// DeleteEmpresa remove uma empresa
func (s *EmpresaService) DeleteEmpresa(ctx context.Context, id int) error {
	// Remover atividades secundárias primeiro
	s.empresaRepo.DeleteAtividadesByEmpresa(ctx, id)

	return s.empresaRepo.Delete(ctx, id)
}

// AddAtividadeSecundaria adiciona uma atividade secundária
func (s *EmpresaService) AddAtividadeSecundaria(ctx context.Context, empresaID int, atividade *model.AtividadeSecundaria) error {
	atividade.EmpresaID = empresaID
	return s.empresaRepo.CreateAtividadeSecundaria(ctx, atividade)
}

// Funções auxiliares

func (s *EmpresaService) isValidCNPJ(cnpj string) bool {
	cnpj = s.cleanCNPJ(cnpj)
	if len(cnpj) != 14 {
		return false
	}

	// Verificar se todos os dígitos são iguais
	if regexp.MustCompile(`^(\d)\1{13}$`).MatchString(cnpj) {
		return false
	}

	// Validação dos dígitos verificadores
	return s.validateCNPJDigits(cnpj)
}

func (s *EmpresaService) cleanCNPJ(cnpj string) string {
	re := regexp.MustCompile(`[^\d]`)
	return re.ReplaceAllString(cnpj, "")
}

func (s *EmpresaService) formatCNPJ(cnpj string) string {
	cnpj = s.cleanCNPJ(cnpj)
	if len(cnpj) == 14 {
		return cnpj[:2] + "." + cnpj[2:5] + "." + cnpj[5:8] + "/" + cnpj[8:12] + "-" + cnpj[12:14]
	}
	return cnpj
}

func (s *EmpresaService) validateCNPJDigits(cnpj string) bool {
	// Implementação simplificada da validação do CNPJ
	// Em produção, usar uma biblioteca específica para validação
	if len(cnpj) != 14 {
		return false
	}

	// Validação básica dos dígitos verificadores do CNPJ
	// Aqui seria implementada a validação completa dos dígitos
	// Por enquanto, apenas verifica se tem 14 dígitos numéricos
	for _, char := range cnpj {
		if char < '0' || char > '9' {
			return false
		}
	}

	return true
}

func (s *EmpresaService) toResponse(empresa *model.Empresa, atividades []*model.AtividadeSecundaria) *model.EmpresaResponse {
	response := &model.EmpresaResponse{
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

	for _, atividade := range atividades {
		response.AtividadesSecundarias = append(response.AtividadesSecundarias, model.AtividadeResponse{
			Codigo:    atividade.Codigo,
			Descricao: atividade.Descricao,
		})
	}

	return response
}

func (s *EmpresaService) toResponseSimple(empresa *model.Empresa) *model.EmpresaResponse {
	return &model.EmpresaResponse{
		ID:                empresa.ID,
		CNPJ:              empresa.CNPJ,
		RazaoSocial:       empresa.RazaoSocial,
		NomeFantasia:      empresa.NomeFantasia,
		SituacaoCadastral: empresa.SituacaoCadastral,
		Email:             empresa.Email,
		Telefone:          empresa.Telefone,
	}
}
