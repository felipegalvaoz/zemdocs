package config

import (
	"fmt"
	"os"
	"strconv"

	"github.com/joho/godotenv"
)

// Config estrutura que contém todas as configurações da aplicação
type Config struct {
	Database  DatabaseConfig
	Redis     RedisConfig
	Server    ServerConfig
	App       AppConfig
	MinIO     MinIOConfig
	Scheduler SchedulerConfig
	NFSe      NFSeConfig
}

// DatabaseConfig configurações do banco de dados
type DatabaseConfig struct {
	Host     string
	Port     string
	User     string
	Password string
	Name     string
	SSLMode  string
	DSN      string
}

// RedisConfig configurações do Redis
type RedisConfig struct {
	URL string
}

// ServerConfig configurações do servidor
type ServerConfig struct {
	Port string
	Host string
}

// AppConfig configurações da aplicação
type AppConfig struct {
	Environment string
	Debug       bool
	BunDebug    int
	LogLevel    string
}

// MinIOConfig configurações do MinIO
type MinIOConfig struct {
	Endpoint   string
	AccessKey  string
	SecretKey  string
	BucketName string
	UseSSL     bool
}

// SchedulerConfig configurações do scheduler
type SchedulerConfig struct {
	Enabled          bool
	SyncInterval     string
	CompetenciaAtual string
}

// NFSeConfig configurações dos clientes NFS-e
type NFSeConfig struct {
	Environment       string // homologacao ou producao
	ImperatrizBaseURL string
	ImperatrizToken   string
	HomologacaoURL    string
	HomologacaoToken  string
}

// Load carrega as configurações do arquivo .env e variáveis de ambiente
func Load() (*Config, error) {
	// Tentar carregar arquivo .env
	if err := godotenv.Load(".env"); err != nil {
		// Se não encontrar .env, continua com variáveis do sistema
		fmt.Println("Arquivo .env não encontrado, usando variáveis do sistema")
	}

	config := &Config{
		Database: DatabaseConfig{
			Host:     getEnv("DB_HOST", "localhost"),
			Port:     getEnv("DB_PORT", "5432"),
			User:     getEnv("DB_USER", "postgres"),
			Password: getEnv("DB_PASSWORD", "postgres"),
			Name:     getEnv("DB_NAME", "zemdocs_dev"),
			SSLMode:  getEnv("DB_SSLMODE", "disable"),
		},
		Redis: RedisConfig{
			URL: getEnv("REDIS_URL", "redis://localhost:6379"),
		},
		Server: ServerConfig{
			Port: getEnv("PORT", "8080"),
			Host: getEnv("HOST", "0.0.0.0"),
		},
		App: AppConfig{
			Environment: getEnv("GIN_MODE", "debug"),
			Debug:       getEnvBool("DEBUG", true),
			BunDebug:    getEnvInt("BUNDEBUG", 2),
			LogLevel:    getEnv("LOG_LEVEL", "debug"),
		},
		MinIO: MinIOConfig{
			Endpoint:   getEnv("MINIO_ENDPOINT", "localhost:9000"),
			AccessKey:  getEnv("MINIO_ACCESS_KEY", "minioadmin"),
			SecretKey:  getEnv("MINIO_SECRET_KEY", "minioadmin"),
			BucketName: getEnv("MINIO_BUCKET_NAME", "zemdocs"),
			UseSSL:     getEnvBool("MINIO_USE_SSL", false),
		},
		Scheduler: SchedulerConfig{
			Enabled:          getEnvBool("SCHEDULER_ENABLED", true),
			SyncInterval:     getEnv("SYNC_INTERVAL", "0 */6 * * *"), // A cada 6 horas
			CompetenciaAtual: getEnv("COMPETENCIA_ATUAL", "202408"),
		},
		NFSe: NFSeConfig{
			ImperatrizBaseURL: getEnv("IMPERATRIZ_BASE_URL", "https://nfse.imperatriz.ma.gov.br/api/v1/nfse"),
			ImperatrizToken:   getEnv("IMPERATRIZ_TOKEN", "5a9bf05cc4321b58dd5966c1cffc67c11ed3fa66ca893d5925d70155e75e87f7"),
		},
	}

	// Construir DSN do banco de dados
	config.Database.DSN = fmt.Sprintf("postgres://%s:%s@%s:%s/%s?sslmode=%s",
		config.Database.User,
		config.Database.Password,
		config.Database.Host,
		config.Database.Port,
		config.Database.Name,
		config.Database.SSLMode,
	)

	return config, nil
}

// getEnv obtém uma variável de ambiente ou retorna um valor padrão
func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}

// getEnvBool obtém uma variável de ambiente como boolean ou retorna um valor padrão
func getEnvBool(key string, defaultValue bool) bool {
	if value := os.Getenv(key); value != "" {
		if parsed, err := strconv.ParseBool(value); err == nil {
			return parsed
		}
	}
	return defaultValue
}

// getEnvInt obtém uma variável de ambiente como int ou retorna um valor padrão
func getEnvInt(key string, defaultValue int) int {
	if value := os.Getenv(key); value != "" {
		if parsed, err := strconv.Atoi(value); err == nil {
			return parsed
		}
	}
	return defaultValue
}

// Validate valida se as configurações estão corretas
func (c *Config) Validate() error {
	if c.Database.Host == "" {
		return fmt.Errorf("DB_HOST é obrigatório")
	}
	if c.Database.User == "" {
		return fmt.Errorf("DB_USER é obrigatório")
	}
	if c.Database.Name == "" {
		return fmt.Errorf("DB_NAME é obrigatório")
	}
	if c.Server.Port == "" {
		return fmt.Errorf("PORT é obrigatório")
	}
	return nil
}

// IsDevelopment verifica se está em modo de desenvolvimento
func (c *Config) IsDevelopment() bool {
	return c.App.Environment == "debug" || c.App.Environment == "development"
}

// IsProduction verifica se está em modo de produção
func (c *Config) IsProduction() bool {
	return c.App.Environment == "release" || c.App.Environment == "production"
}
