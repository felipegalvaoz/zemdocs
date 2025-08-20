package logger

import (
	"io"
	"log"
	"os"
	"time"

	"zemdocs/internal/config"

	"github.com/rs/zerolog"
)

// Logger é a instância global do logger
var Logger zerolog.Logger

// Init inicializa o sistema de logging
func Init(cfg *config.Config) {
	// Configurar nível de log baseado no ambiente
	var level zerolog.Level
	if cfg.IsDevelopment() {
		level = zerolog.DebugLevel
	} else {
		level = zerolog.InfoLevel
	}

	// Configurar output
	var output io.Writer = os.Stdout

	// Em desenvolvimento, usar output colorido e formatado
	if cfg.IsDevelopment() {
		output = zerolog.ConsoleWriter{
			Out:        os.Stdout,
			TimeFormat: time.RFC3339,
			NoColor:    false,
		}
	}

	// Configurar logger global
	zerolog.SetGlobalLevel(level)
	Logger = zerolog.New(output).With().
		Timestamp().
		Logger()

	// Configurar logger padrão do Go para usar zerolog
	log.SetOutput(Logger)
	log.SetFlags(0) // Remove timestamps do log padrão pois zerolog já adiciona
}

// GetLogger retorna uma instância do logger com contexto adicional
func GetLogger(component string) zerolog.Logger {
	return Logger
}

// Database retorna um logger específico para operações de banco de dados
func Database() *zerolog.Logger {
	logger := GetLogger("database")
	return &logger
}

// HTTP retorna um logger específico para requisições HTTP
func HTTP() *zerolog.Logger {
	logger := GetLogger("http")
	return &logger
}

// Service retorna um logger específico para serviços
func Service(serviceName string) zerolog.Logger {
	return Logger.With().
		Str("component", "service").
		Str("service", serviceName).
		Logger()
}

// Repository retorna um logger específico para repositórios
func Repository(repoName string) zerolog.Logger {
	return Logger.With().
		Str("component", "repository").
		Str("repository", repoName).
		Logger()
}

// Handler retorna um logger específico para handlers HTTP
func Handler(handlerName string) zerolog.Logger {
	return Logger.With().
		Str("component", "handler").
		Str("handler", handlerName).
		Logger()
}

// Middleware retorna um logger específico para middlewares
func Middleware(middlewareName string) zerolog.Logger {
	return Logger.With().
		Str("component", "middleware").
		Str("middleware", middlewareName).
		Logger()
}

// Info log de informação
func Info(msg string) {
	Logger.Info().Msg(msg)
}

// Debug log de debug
func Debug(msg string) {
	Logger.Debug().Msg(msg)
}

// Error log de erro
func Error(err error, msg string) {
	Logger.Error().Err(err).Msg(msg)
}

// Fatal log fatal (encerra a aplicação)
func Fatal(err error, msg string) {
	Logger.Fatal().Err(err).Msg(msg)
}

// Warn log de warning
func Warn(msg string) {
	Logger.Warn().Msg(msg)
}

// WithFields cria um logger com campos adicionais
func WithFields(fields map[string]interface{}) zerolog.Logger {
	logger := Logger
	for key, value := range fields {
		logger = logger.With().Interface(key, value).Logger()
	}
	return logger
}
