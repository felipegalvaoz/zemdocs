package database

import (
	"context"
	"database/sql"
	"fmt"

	"zemdocs/internal/config"
	"zemdocs/internal/logger"

	"github.com/uptrace/bun"
	"github.com/uptrace/bun/dialect/pgdialect"
	"github.com/uptrace/bun/driver/pgdriver"
)

// DB é a instância global do banco de dados
var DB *bun.DB

// InitDB inicializa a conexão com o banco de dados
func InitDB(cfg *config.Config) error {
	dsn := cfg.Database.DSN

	// Conectar ao PostgreSQL
	sqldb := sql.OpenDB(pgdriver.NewConnector(pgdriver.WithDSN(dsn)))

	// Criar instância do Bun
	DB = bun.NewDB(sqldb, pgdialect.New())

	// Adicionar hook de logging personalizado
	if cfg.App.BunDebug > 0 {
		DB.AddQueryHook(NewBunLogger())
	}

	// Testar conexão
	ctx := context.Background()
	if err := DB.PingContext(ctx); err != nil {
		return fmt.Errorf("erro ao conectar com o banco de dados: %w", err)
	}

	logger.Database().Info().Msg("Conexão com o banco de dados estabelecida com sucesso")
	return nil
}

// CloseDB fecha a conexão com o banco de dados
func CloseDB() error {
	if DB != nil {
		return DB.Close()
	}
	return nil
}
