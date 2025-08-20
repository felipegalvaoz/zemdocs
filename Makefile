# Makefile para desenvolvimento

.PHONY: help dev-up dev-down dev-logs dev-clean run build test migrate-up migrate-down migrate-status

# Ajuda
help:
	@echo "Comandos disponíveis:"
	@echo "  dev-up      - Inicia os serviços de desenvolvimento (PostgreSQL + Redis)"
	@echo "  dev-down    - Para os serviços de desenvolvimento"
	@echo "  dev-logs    - Mostra os logs dos serviços"
	@echo "  dev-clean   - Remove volumes e containers de desenvolvimento"
	@echo "  run         - Executa a API localmente"
	@echo "  build       - Compila a aplicação"
	@echo "  test        - Executa os testes"
	@echo "  migrate-up  - Executa as migrações"
	@echo "  migrate-down- Desfaz a última migração"
	@echo "  migrate-status - Mostra o status das migrações"

# Desenvolvimento
dev-up:
	@echo "Iniciando serviços de desenvolvimento..."
	docker-compose -f docker-compose.dev.yml up -d
	@echo "Aguardando serviços ficarem prontos..."
	@sleep 5
	@echo "Serviços prontos! PostgreSQL: localhost:5432, Redis: localhost:6379"

dev-down:
	@echo "Parando serviços de desenvolvimento..."
	docker-compose -f docker-compose.dev.yml down

dev-logs:
	docker-compose -f docker-compose.dev.yml logs -f

dev-clean:
	@echo "Removendo containers e volumes de desenvolvimento..."
	docker-compose -f docker-compose.dev.yml down -v --remove-orphans
	docker volume prune -f

# Aplicação
run:
	@echo "Executando API..."
	go run cmd/api/main.go

build:
	@echo "Compilando aplicação..."
	go build -o bin/api cmd/api/main.go

test:
	@echo "Executando testes..."
	go test -v ./...

# Migrações (quando implementadas)
migrate-up:
	@echo "Executando migrações..."
	@if [ -f .env.dev ]; then export $$(cat .env.dev | xargs) && go run cmd/migrate/main.go up; else go run cmd/migrate/main.go up; fi

migrate-down:
	@echo "Desfazendo última migração..."
	@if [ -f .env.dev ]; then export $$(cat .env.dev | xargs) && go run cmd/migrate/main.go down; else go run cmd/migrate/main.go down; fi

migrate-status:
	@echo "Status das migrações..."
	@if [ -f .env.dev ]; then export $$(cat .env.dev | xargs) && go run cmd/migrate/main.go status; else go run cmd/migrate/main.go status; fi

# Comandos combinados
dev: dev-up
	@echo "Aguardando 10 segundos para os serviços iniciarem..."
	@sleep 10
	@make run

dev-reset: dev-clean dev-up
	@echo "Ambiente de desenvolvimento resetado!"
