package repository

import (
	"context"
	"zemdocs/internal/database/model"

	"github.com/uptrace/bun"
)

type UserRepository struct {
	db *bun.DB
}

func NewUserRepository(db *bun.DB) *UserRepository {
	return &UserRepository{db: db}
}

func (r *UserRepository) Create(ctx context.Context, user *model.User) error {
	_, err := r.db.NewInsert().Model(user).Exec(ctx)
	return err
}

func (r *UserRepository) GetByID(ctx context.Context, id int) (*model.User, error) {
	user := &model.User{}
	err := r.db.NewSelect().
		Model(user).
		Where("id = ?", id).
		Scan(ctx)
	if err != nil {
		return nil, err
	}
	return user, nil
}

func (r *UserRepository) GetByEmail(ctx context.Context, email string) (*model.User, error) {
	user := &model.User{}
	err := r.db.NewSelect().
		Model(user).
		Where("email = ?", email).
		Scan(ctx)
	if err != nil {
		return nil, err
	}
	return user, nil
}

func (r *UserRepository) GetAll(ctx context.Context, limit, offset int) ([]*model.User, error) {
	var users []*model.User
	err := r.db.NewSelect().
		Model(&users).
		Order("name ASC").
		Limit(limit).
		Offset(offset).
		Scan(ctx)
	return users, err
}

func (r *UserRepository) Update(ctx context.Context, user *model.User) error {
	_, err := r.db.NewUpdate().
		Model(user).
		Where("id = ?", user.ID).
		Exec(ctx)
	return err
}

func (r *UserRepository) Delete(ctx context.Context, id int) error {
	_, err := r.db.NewDelete().
		Model((*model.User)(nil)).
		Where("id = ?", id).
		Exec(ctx)
	return err
}
