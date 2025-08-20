package model

import (
	"context"
	"time"

	"github.com/uptrace/bun"
)

// User representa o modelo de usuário no banco de dados
type User struct {
	bun.BaseModel `bun:"table:users,alias:u"`

	ID        int       `json:"id" bun:",pk,autoincrement"`
	Name      string    `json:"name" bun:",notnull"`
	Email     string    `json:"email" bun:",unique,notnull"`
	Password  string    `json:"-" bun:",notnull"`
	CreatedAt time.Time `json:"created_at" bun:",nullzero,notnull,default:current_timestamp"`
	UpdatedAt time.Time `json:"updated_at" bun:",nullzero,notnull,default:current_timestamp"`
}

// BeforeAppendModel hook executado antes de inserir/atualizar
func (u *User) BeforeAppendModel(ctx context.Context, query bun.Query) error {
	switch query.(type) {
	case *bun.InsertQuery:
		u.CreatedAt = time.Now()
		u.UpdatedAt = time.Now()
	case *bun.UpdateQuery:
		u.UpdatedAt = time.Now()
	}
	return nil
}
