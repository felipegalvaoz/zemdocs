package database

import (
	"context"
	"database/sql/driver"
	"time"

	"zemdocs/internal/logger"

	"github.com/uptrace/bun"
)

// BunLogger é um hook personalizado para integrar logs do Bun com zerolog
type BunLogger struct{}

// NewBunLogger cria uma nova instância do logger do Bun
func NewBunLogger() *BunLogger {
	return &BunLogger{}
}

// BeforeQuery é chamado antes de executar uma query
func (l *BunLogger) BeforeQuery(ctx context.Context, event *bun.QueryEvent) context.Context {
	return ctx
}

// AfterQuery é chamado após executar uma query
func (l *BunLogger) AfterQuery(ctx context.Context, event *bun.QueryEvent) {
	duration := time.Since(event.StartTime)

	// Obter o logger do banco
	dbLogger := logger.Database()

	// Determinar o nível do log baseado na duração e erro
	logEvent := dbLogger.Debug()
	if event.Err != nil {
		if event.Err.Error() == "sql: no rows in result set" {
			// Log de debug para "no rows" pois é comum e não é erro crítico
			logEvent = dbLogger.Debug()
		} else {
			// Erro real
			logEvent = dbLogger.Error().Err(event.Err)
		}
	} else if duration > 1*time.Second {
		// Query lenta - warning
		logEvent = dbLogger.Warn()
	} else if duration > 100*time.Millisecond {
		// Query moderadamente lenta - info
		logEvent = dbLogger.Info()
	}

	// Adicionar campos do log
	logEvent = logEvent.
		Str("op", event.Operation()).
		Dur("dur", duration).
		Str("sql", formatQuery(event.Query))

	// Adicionar argumentos se existirem (apenas em debug)
	if len(event.QueryArgs) > 0 {
		logEvent = logEvent.Interface("args", event.QueryArgs)
	}

	// Mensagem baseada no tipo de operação
	message := "SQL"
	if event.Err != nil {
		if event.Err.Error() == "sql: no rows in result set" {
			message = "SQL (no rows)"
		} else {
			message = "SQL failed"
		}
	}

	logEvent.Msg(message)
}

// formatQuery formata a query para o log, limitando o tamanho e removendo aspas
func formatQuery(query string) string {
	const maxLength = 200

	// Remover quebras de linha, espaços extras e aspas
	formatted := ""
	for _, char := range query {
		if char == '\n' || char == '\r' || char == '\t' {
			formatted += " "
		} else if char == '"' {
			// Remover aspas duplas
			continue
		} else {
			formatted += string(char)
		}
	}

	// Limitar tamanho
	if len(formatted) > maxLength {
		return formatted[:maxLength] + "..."
	}

	return formatted
}

// Implementar interface driver.Valuer para compatibilidade
func (l *BunLogger) Value() (driver.Value, error) {
	return nil, nil
}
