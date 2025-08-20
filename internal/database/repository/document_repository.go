package repository

import (
	"context"
	"zemdocs/internal/database/model"

	"github.com/uptrace/bun"
)

type DocumentRepository struct {
	db *bun.DB
}

func NewDocumentRepository(db *bun.DB) *DocumentRepository {
	return &DocumentRepository{db: db}
}

// GetByNumeroDocumento busca documento por número
func (r *DocumentRepository) GetByNumeroDocumento(ctx context.Context, numeroDocumento string) (*model.Document, error) {
	document := &model.Document{}
	err := r.db.NewSelect().
		Model(document).
		Where("numero_documento = ?", numeroDocumento).
		Scan(ctx)
	if err != nil {
		return nil, err
	}
	return document, nil
}

// GetByNumeroNfse busca NFS-e por número (compatibilidade)
func (r *DocumentRepository) GetByNumeroNfse(ctx context.Context, numeroNfse string) (*model.Document, error) {
	return r.GetByNumeroDocumento(ctx, numeroNfse)
}

// GetByNumeroRps busca documento por número do RPS
func (r *DocumentRepository) GetByNumeroRps(ctx context.Context, numeroRps string) (*model.Document, error) {
	document := &model.Document{}
	err := r.db.NewSelect().
		Model(document).
		Where("numero_rps = ?", numeroRps).
		Scan(ctx)
	if err != nil {
		return nil, err
	}
	return document, nil
}

// GetByIntervaloNumeros busca documentos por intervalo de números
func (r *DocumentRepository) GetByIntervaloNumeros(ctx context.Context, nrInicial, nrFinal string) ([]*model.Document, error) {
	var documents []*model.Document
	err := r.db.NewSelect().
		Model(&documents).
		Where("numero_documento BETWEEN ? AND ?", nrInicial, nrFinal).
		Order("numero_documento ASC").
		Scan(ctx)
	return documents, err
}

// GetByIntervaloDatas busca documentos por intervalo de datas com paginação
func (r *DocumentRepository) GetByIntervaloDatas(ctx context.Context, dtInicial, dtFinal string, page int) ([]*model.Document, error) {
	limit := 50 // Limite de registros por página
	offset := (page - 1) * limit

	var documents []*model.Document
	err := r.db.NewSelect().
		Model(&documents).
		Where("data_emissao BETWEEN ? AND ?", dtInicial, dtFinal).
		Order("data_emissao ASC").
		Limit(limit).
		Offset(offset).
		Scan(ctx)
	return documents, err
}

// GetByCompetencia busca documentos por competência
func (r *DocumentRepository) GetByCompetencia(ctx context.Context, competencia string) ([]*model.Document, error) {
	var documents []*model.Document
	err := r.db.NewSelect().
		Model(&documents).
		Where("competencia = ?", competencia).
		Order("numero_nfse ASC").
		Scan(ctx)
	return documents, err
}

// GetUltimoRPS retorna o número do último RPS enviado
func (r *DocumentRepository) GetUltimoRPS(ctx context.Context) (string, error) {
	var ultimoRps string
	err := r.db.NewSelect().
		Model((*model.Document)(nil)).
		Column("numero_rps").
		Order("created_at DESC").
		Limit(1).
		Scan(ctx, &ultimoRps)

	if err != nil {
		return "0", nil // Retorna "0" se não houver registros
	}
	return ultimoRps, nil
}

// Create cria um novo documento
func (r *DocumentRepository) Create(ctx context.Context, document *model.Document) error {
	_, err := r.db.NewInsert().
		Model(document).
		Exec(ctx)
	return err
}

// ExistsByNumeroNfse verifica se um documento já existe pelo número (compatibilidade)
func (r *DocumentRepository) ExistsByNumeroNfse(ctx context.Context, numeroNfse string) (bool, error) {
	return r.ExistsByNumeroDocumento(ctx, numeroNfse)
}

// ExistsByNumeroDocumento verifica se um documento já existe pelo número
func (r *DocumentRepository) ExistsByNumeroDocumento(ctx context.Context, numeroDocumento string) (bool, error) {
	count, err := r.db.NewSelect().
		Model((*model.Document)(nil)).
		Where("numero_documento = ?", numeroDocumento).
		Count(ctx)

	if err != nil {
		return false, err
	}

	return count > 0, nil
}

// GetByCompetenciaLocal busca documentos por competência no banco local
func (r *DocumentRepository) GetByCompetenciaLocal(ctx context.Context, competencia string, limit, offset int) ([]*model.Document, error) {
	var documents []*model.Document

	err := r.db.NewSelect().
		Model(&documents).
		Where("competencia = ?", competencia).
		Order("data_emissao DESC").
		Limit(limit).
		Offset(offset).
		Scan(ctx)

	if err != nil {
		return nil, err
	}

	return documents, nil
}

// CountByCompetencia conta documentos por competência
func (r *DocumentRepository) CountByCompetencia(ctx context.Context, competencia string) (int, error) {
	count, err := r.db.NewSelect().
		Model((*model.Document)(nil)).
		Where("competencia = ?", competencia).
		Count(ctx)

	return count, err
}
