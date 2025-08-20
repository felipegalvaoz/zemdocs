-- Script de inicialização para desenvolvimento
-- Cria extensões necessárias

-- Extensão para UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Extensão para funções de texto
CREATE EXTENSION IF NOT EXISTS "unaccent";

-- Configurações para desenvolvimento
SET timezone = 'America/Sao_Paulo';

-- Criar usuário de desenvolvimento (opcional)
-- CREATE USER dev_user WITH PASSWORD 'dev_password';
-- GRANT ALL PRIVILEGES ON DATABASE zemdocs_dev TO dev_user;
