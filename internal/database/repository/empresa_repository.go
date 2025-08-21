package repository

import (
	"context"
	"zemdocs/internal/database/model"

	"github.com/uptrace/bun"
)

type EmpresaRepository struct {
	db *bun.DB
}

func NewEmpresaRepository(db *bun.DB) *EmpresaRepository {
	return &EmpresaRepository{db: db}
}

// Create cria uma nova empresa
func (r *EmpresaRepository) Create(ctx context.Context, empresa *model.Empresa) error {
	_, err := r.db.NewInsert().Model(empresa).Exec(ctx)
	return err
}

// GetByCNPJ busca empresa por CNPJ
func (r *EmpresaRepository) GetByCNPJ(ctx context.Context, cnpj string) (*model.Empresa, error) {
	empresa := &model.Empresa{}
	err := r.db.NewSelect().
		Model(empresa).
		Where("cnpj = ?", cnpj).
		Scan(ctx)
	if err != nil {
		return nil, err
	}
	return empresa, nil
}

// GetByID busca empresa por ID
func (r *EmpresaRepository) GetByID(ctx context.Context, id int) (*model.Empresa, error) {
	empresa := &model.Empresa{}
	err := r.db.NewSelect().
		Model(empresa).
		Where("id = ?", id).
		Scan(ctx)
	if err != nil {
		return nil, err
	}
	return empresa, nil
}

// GetAll lista todas as empresas com paginação
func (r *EmpresaRepository) GetAll(ctx context.Context, limit, offset int) ([]*model.Empresa, error) {
	var empresas []*model.Empresa
	err := r.db.NewSelect().
		Model(&empresas).
		Order("razao_social ASC").
		Limit(limit).
		Offset(offset).
		Scan(ctx)
	return empresas, err
}

// Search busca empresas por termo (CNPJ, razão social ou nome fantasia)
func (r *EmpresaRepository) Search(ctx context.Context, termo string, limit, offset int) ([]*model.Empresa, error) {
	var empresas []*model.Empresa
	err := r.db.NewSelect().
		Model(&empresas).
		Where("cnpj ILIKE ? OR razao_social ILIKE ? OR nome_fantasia ILIKE ?",
			"%"+termo+"%", "%"+termo+"%", "%"+termo+"%").
		Order("razao_social ASC").
		Limit(limit).
		Offset(offset).
		Scan(ctx)
	return empresas, err
}

// Update atualiza uma empresa
func (r *EmpresaRepository) Update(ctx context.Context, empresa *model.Empresa) error {
	_, err := r.db.NewUpdate().
		Model(empresa).
		Where("id = ?", empresa.ID).
		Exec(ctx)
	return err
}

// Delete remove uma empresa
func (r *EmpresaRepository) Delete(ctx context.Context, id int) error {
	_, err := r.db.NewDelete().
		Model((*model.Empresa)(nil)).
		Where("id = ?", id).
		Exec(ctx)
	return err
}

// GetWithAtividades busca empresa com suas atividades secundárias
func (r *EmpresaRepository) GetWithAtividades(ctx context.Context, id int) (*model.Empresa, error) {
	empresa := &model.Empresa{}
	err := r.db.NewSelect().
		Model(empresa).
		Where("e.id = ?", id).
		Scan(ctx)
	if err != nil {
		return nil, err
	}

	// Buscar atividades secundárias
	var atividades []*model.AtividadeSecundaria
	err = r.db.NewSelect().
		Model(&atividades).
		Where("empresa_id = ?", id).
		Scan(ctx)
	if err != nil {
		return empresa, err // Retorna empresa mesmo se não encontrar atividades
	}

	return empresa, nil
}

// CreateAtividadeSecundaria cria uma atividade secundária
func (r *EmpresaRepository) CreateAtividadeSecundaria(ctx context.Context, atividade *model.AtividadeSecundaria) error {
	_, err := r.db.NewInsert().Model(atividade).Exec(ctx)
	return err
}

// GetAtividadesByEmpresa busca atividades secundárias de uma empresa
func (r *EmpresaRepository) GetAtividadesByEmpresa(ctx context.Context, empresaID int) ([]*model.AtividadeSecundaria, error) {
	var atividades []*model.AtividadeSecundaria
	err := r.db.NewSelect().
		Model(&atividades).
		Where("empresa_id = ?", empresaID).
		Order("codigo ASC").
		Scan(ctx)
	return atividades, err
}

// DeleteAtividadesByEmpresa remove todas as atividades secundárias de uma empresa
func (r *EmpresaRepository) DeleteAtividadesByEmpresa(ctx context.Context, empresaID int) error {
	_, err := r.db.NewDelete().
		Model((*model.AtividadeSecundaria)(nil)).
		Where("empresa_id = ?", empresaID).
		Exec(ctx)
	return err
}

// Count retorna o total de empresas
func (r *EmpresaRepository) Count(ctx context.Context) (int, error) {
	count, err := r.db.NewSelect().
		Model((*model.Empresa)(nil)).
		Count(ctx)
	return count, err
}

// CountBySearch retorna o total de empresas que correspondem ao termo de busca
func (r *EmpresaRepository) CountBySearch(ctx context.Context, termo string) (int, error) {
	count, err := r.db.NewSelect().
		Model((*model.Empresa)(nil)).
		Where("cnpj ILIKE ? OR razao_social ILIKE ? OR nome_fantasia ILIKE ?",
			"%"+termo+"%", "%"+termo+"%", "%"+termo+"%").
		Count(ctx)
	return count, err
}

// CreateMembro cria um novo membro da empresa
func (r *EmpresaRepository) CreateMembro(ctx context.Context, membro *model.EmpresaMembro) error {
	_, err := r.db.NewInsert().Model(membro).Exec(ctx)
	return err
}

// CreateInscricaoEstadual cria uma nova inscrição estadual
func (r *EmpresaRepository) CreateInscricaoEstadual(ctx context.Context, inscricao *model.EmpresaInscricaoEstadual) error {
	_, err := r.db.NewInsert().Model(inscricao).Exec(ctx)
	return err
}

// CreateSuframa cria um novo registro SUFRAMA
func (r *EmpresaRepository) CreateSuframa(ctx context.Context, suframa *model.EmpresaSuframa) error {
	_, err := r.db.NewInsert().Model(suframa).Exec(ctx)
	return err
}

// CreateTelefone cria um novo telefone da empresa
func (r *EmpresaRepository) CreateTelefone(ctx context.Context, telefone *model.EmpresaTelefone) error {
	_, err := r.db.NewInsert().Model(telefone).Exec(ctx)
	return err
}

// CreateEmail cria um novo email da empresa
func (r *EmpresaRepository) CreateEmail(ctx context.Context, email *model.EmpresaEmail) error {
	_, err := r.db.NewInsert().Model(email).Exec(ctx)
	return err
}

// GetInscricoesEstaduaisByEmpresa busca inscrições estaduais de uma empresa
func (r *EmpresaRepository) GetInscricoesEstaduaisByEmpresa(ctx context.Context, empresaID int) ([]*model.EmpresaInscricaoEstadual, error) {
	var inscricoes []*model.EmpresaInscricaoEstadual
	err := r.db.NewSelect().
		Model(&inscricoes).
		Where("empresa_id = ?", empresaID).
		Order("estado ASC, numero ASC").
		Scan(ctx)
	return inscricoes, err
}
