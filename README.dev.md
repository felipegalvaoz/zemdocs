# Desenvolvimento Local - ZemDocs API

## Pré-requisitos

- Go 1.21+
- Docker e Docker Compose
- Make (opcional, mas recomendado)

## Configuração Rápida

### 1. Clonar e configurar o projeto

```bash
git clone <repository-url>
cd zemdocs
```

### 2. Iniciar serviços de desenvolvimento

```bash
# Com Make (recomendado)
make dev-up

# Ou diretamente com Docker Compose
docker-compose -f docker-compose.dev.yml up -d
```

### 3. Executar a API

```bash
# Com Make
make run

# Ou diretamente
go run cmd/api/main.go
```

## Comandos Úteis

### Gerenciamento dos Serviços

```bash
# Iniciar PostgreSQL + Redis
make dev-up

# Parar serviços
make dev-down

# Ver logs dos serviços
make dev-logs

# Limpar tudo (containers + volumes)
make dev-clean

# Resetar ambiente completo
make dev-reset
```

### Desenvolvimento da API

```bash
# Executar API com hot reload (recomendado instalar air)
air

# Executar API normalmente
make run

# Compilar
make build

# Executar testes
make test
```

### Migrações (quando implementadas)

```bash
# Executar migrações
make migrate-up

# Desfazer última migração
make migrate-down

# Ver status das migrações
make migrate-status
```

## Configuração do Ambiente

O arquivo `.env.dev` contém as configurações para desenvolvimento:

```env
DATABASE_URL=postgres://postgres:postgres@localhost:5432/zemdocs_dev?sslmode=disable
REDIS_URL=redis://localhost:6379
PORT=8080
GIN_MODE=debug
BUNDEBUG=2
```

## Endpoints da API

A API estará disponível em `http://localhost:8080`

### Endpoints principais:

- `GET /health` - Health check
- `GET /api/v1/nfse/consultar?NumeroNfse=123` - Consultar NFS-e por número
- `GET /api/v1/nfse/consultar?NumeroRps=456` - Consultar NFS-e por RPS
- `GET /api/v1/nfse/xmlnfse?nr_inicial=100&nr_final=200` - Consultar XMLs por intervalo
- `GET /api/v1/nfse/ultimorpsenviado` - Último RPS enviado

### Autenticação

Todas as requisições precisam do header:
```
Authorization: 5a9bf05cc4321b58dd5966c1cffc67c11ed3fa66ca893d5925d70155e75e87f7
```

## Conectar ao Banco de Dados

### Via psql
```bash
psql -h localhost -p 5432 -U postgres -d zemdocs_dev
```

### Via cliente gráfico
- Host: localhost
- Port: 5432
- Database: zemdocs_dev
- Username: postgres
- Password: postgres

## Conectar ao Redis

```bash
redis-cli -h localhost -p 6379
```

## Estrutura do Projeto

```
zemdocs/
├── cmd/
│   └── api/           # Entrada principal da API
├── internal/
│   ├── api/
│   │   ├── middleware/ # CORS e Auth
│   │   └── router/     # Configuração de rotas
│   ├── database/
│   │   ├── model/      # Modelos Bun ORM (NFSe, User, Empresa)
│   │   ├── repository/ # Camada de acesso a dados
│   │   ├── connection.go # Configuração do banco
│   │   └── migrations.go # Migrações automáticas
│   ├── handler/        # Controllers HTTP
│   └── service/        # Lógica de negócio
├── scripts/           # Scripts SQL de inicialização
├── docker-compose.dev.yml # PostgreSQL + Redis para dev
├── docker-compose.yml     # Stack completa com MinIO
├── .env.dev
├── Makefile
└── test_api.sh       # Script de teste da API
```

## Tecnologias Utilizadas

- **Go 1.21+** - Linguagem principal
- **Gin** - Framework web
- **Bun ORM** - ORM com query builder e migrações automáticas
- **PostgreSQL** - Banco de dados principal
- **Redis** - Cache e sessões
- **MinIO** - Storage de objetos (opcional)
- **Docker** - Containerização dos serviços

## Testando a API

Após iniciar os serviços e a API, você pode testar usando o script fornecido:

```bash
# Executar testes automatizados
./test_api.sh
```

Ou testar manualmente:

```bash
# Health check
curl http://localhost:8080/health

# Consultar NFS-e (com token)
curl -H "Authorization: 5a9bf05cc4321b58dd5966c1cffc67c11ed3fa66ca893d5925d70155e75e87f7" \
  "http://localhost:8080/api/v1/nfse/consultar?NumeroNfse=12345"
```

## Modelos de Dados

### NFSe
- Número da NFS-e, RPS, série
- Data de emissão, status, código de verificação
- Valor do serviço, valor do ISS
- Competência, conteúdo XML

### Empresa
- CNPJ, razão social, nome fantasia
- Endereço completo
- Atividade principal e secundárias
- Situação cadastral

### User
- Nome, email, senha (hash)
- Timestamps de criação e atualização

## Troubleshooting

### Porta já em uso
```bash
# Verificar o que está usando a porta
lsof -i :5432  # PostgreSQL
lsof -i :6379  # Redis
lsof -i :8080  # API

# Parar serviços se necessário
make dev-down
```

### Problemas de conexão com banco
```bash
# Verificar se os containers estão rodando
docker ps

# Ver logs do PostgreSQL
docker logs zemdocs_postgres_dev

# Resetar ambiente
make dev-reset
```

### Limpar cache do Go
```bash
go clean -modcache
go mod download
```

## Próximos Passos

1. **Implementar autenticação JWT** - Substituir token fixo por JWT
2. **Adicionar validações** - Validar dados de entrada mais rigorosamente
3. **Implementar cache Redis** - Cache para consultas frequentes
4. **Adicionar logs estruturados** - Usar slog ou logrus
5. **Testes unitários** - Cobertura de testes para services e handlers
6. **Documentação OpenAPI** - Swagger/OpenAPI spec
7. **Monitoramento** - Métricas e health checks avançados
