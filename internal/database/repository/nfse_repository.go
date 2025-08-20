package repository

import (
	"context"
	"zemdocs/internal/database/model"

	"github.com/uptrace/bun"
)

type NFSeRepository struct {
	db *bun.DB
}

func NewNFSeRepository(db *bun.DB) *NFSeRepository {
	return &NFSeRepository{db: db}
}

// GetByNumeroNfse busca NFS-e por número
func (r *NFSeRepository) GetByNumeroNfse(ctx context.Context, numeroNfse string) (*model.NFSe, error) {
	nfse := &model.NFSe{}
	err := r.db.NewSelect().
		Model(nfse).
		Where("numero_nfse = ?", numeroNfse).
		Scan(ctx)
	if err != nil {
		return nil, err
	}
	return nfse, nil
}

// GetByNumeroRps busca NFS-e por número do RPS
func (r *NFSeRepository) GetByNumeroRps(ctx context.Context, numeroRps string) (*model.NFSe, error) {
	nfse := &model.NFSe{}
	err := r.db.NewSelect().
		Model(nfse).
		Where("numero_rps = ?", numeroRps).
		Scan(ctx)
	if err != nil {
		return nil, err
	}
	return nfse, nil
}

// GetByIntervaloNumeros busca NFS-e por intervalo de números
func (r *NFSeRepository) GetByIntervaloNumeros(ctx context.Context, nrInicial, nrFinal string) ([]*model.NFSe, error) {
	var nfses []*model.NFSe
	err := r.db.NewSelect().
		Model(&nfses).
		Where("numero_nfse BETWEEN ? AND ?", nrInicial, nrFinal).
		Order("numero_nfse ASC").
		Scan(ctx)
	return nfses, err
}

// GetByIntervaloDatas busca NFS-e por intervalo de datas com paginação
func (r *NFSeRepository) GetByIntervaloDatas(ctx context.Context, dtInicial, dtFinal string, page int) ([]*model.NFSe, error) {
	limit := 50 // Limite de registros por página
	offset := (page - 1) * limit

	var nfses []*model.NFSe
	err := r.db.NewSelect().
		Model(&nfses).
		Where("data_emissao BETWEEN ? AND ?", dtInicial, dtFinal).
		Order("data_emissao ASC").
		Limit(limit).
		Offset(offset).
		Scan(ctx)
	return nfses, err
}

// GetByCompetencia busca NFS-e por competência
func (r *NFSeRepository) GetByCompetencia(ctx context.Context, competencia string) ([]*model.NFSe, error) {
	var nfses []*model.NFSe
	err := r.db.NewSelect().
		Model(&nfses).
		Where("competencia = ?", competencia).
		Order("numero_nfse ASC").
		Scan(ctx)
	return nfses, err
}

// GetUltimoRPS retorna o número do último RPS enviado
func (r *NFSeRepository) GetUltimoRPS(ctx context.Context) (string, error) {
	var ultimoRps string
	err := r.db.NewSelect().
		Model((*model.NFSe)(nil)).
		Column("numero_rps").
		Order("created_at DESC").
		Limit(1).
		Scan(ctx, &ultimoRps)

	if err != nil {
		return "0", nil // Retorna "0" se não houver registros
	}
	return ultimoRps, nil
}

// Create cria uma nova NFS-e
func (r *NFSeRepository) Create(ctx context.Context, nfse *model.NFSe) error {
	_, err := r.db.NewInsert().
		Model(nfse).
		Exec(ctx)
	return err
}

// ExistsByNumeroNfse verifica se uma NFS-e já existe pelo número
func (r *NFSeRepository) ExistsByNumeroNfse(ctx context.Context, numeroNfse string) (bool, error) {
	count, err := r.db.NewSelect().
		Model((*model.NFSe)(nil)).
		Where("numero_nfse = ?", numeroNfse).
		Count(ctx)

	if err != nil {
		return false, err
	}

	return count > 0, nil
}

// GetByCompetenciaLocal busca NFS-e por competência no banco local
func (r *NFSeRepository) GetByCompetenciaLocal(ctx context.Context, competencia string, limit, offset int) ([]*model.NFSe, error) {
	var nfses []*model.NFSe

	err := r.db.NewSelect().
		Model(&nfses).
		Where("competencia = ?", competencia).
		Order("data_emissao DESC").
		Limit(limit).
		Offset(offset).
		Scan(ctx)

	if err != nil {
		return nil, err
	}

	return nfses, nil
}

// CountByCompetencia conta NFS-e por competência
func (r *NFSeRepository) CountByCompetencia(ctx context.Context, competencia string) (int, error) {
	count, err := r.db.NewSelect().
		Model((*model.NFSe)(nil)).
		Where("competencia = ?", competencia).
		Count(ctx)

	return count, err
}
