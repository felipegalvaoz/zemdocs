package database

import (
	"context"
	"zemdocs/internal/database/model"
	"zemdocs/internal/logger"
)

// RunMigrations executa as migrações automáticas baseadas nos modelos
func RunMigrations(ctx context.Context) error {
	logger.Database().Info().Msg("Executando migrações automáticas...")

	// Lista de modelos para criar tabelas
	models := []interface{}{
		(*model.NFSe)(nil),
		(*model.User)(nil),
		(*model.Empresa)(nil),
		(*model.AtividadeSecundaria)(nil),
		(*model.EmpresaMembro)(nil),
		(*model.EmpresaInscricaoEstadual)(nil),
		(*model.EmpresaSuframa)(nil),
		(*model.EmpresaTelefone)(nil),
		(*model.EmpresaEmail)(nil),
	}

	// Criar tabelas se não existirem
	for _, model := range models {
		_, err := DB.NewCreateTable().
			Model(model).
			IfNotExists().
			Exec(ctx)
		if err != nil {
			logger.Database().Error().Err(err).Interface("model", model).Msg("Erro ao criar tabela")
			return err
		}
	}

	// Criar índices adicionais
	if err := createIndexes(ctx); err != nil {
		return err
	}

	logger.Database().Info().Msg("Migrações executadas com sucesso!")
	return nil
}

// createIndexes cria índices adicionais necessários
func createIndexes(ctx context.Context) error {
	indexes := []string{
		// Índices para NFSe
		"CREATE INDEX IF NOT EXISTS idx_nfse_numero_nfse ON nfse (numero_nfse)",
		"CREATE INDEX IF NOT EXISTS idx_nfse_numero_rps ON nfse (numero_rps)",
		"CREATE INDEX IF NOT EXISTS idx_nfse_data_emissao ON nfse (data_emissao)",
		"CREATE INDEX IF NOT EXISTS idx_nfse_competencia ON nfse (competencia)",
		"CREATE INDEX IF NOT EXISTS idx_nfse_status ON nfse (status)",

		// Índices para Empresa
		"CREATE INDEX IF NOT EXISTS idx_empresa_cnpj ON empresas (cnpj)",
		"CREATE INDEX IF NOT EXISTS idx_empresa_razao_social ON empresas (razao_social)",
		"CREATE INDEX IF NOT EXISTS idx_empresa_nome_fantasia ON empresas (nome_fantasia)",
		"CREATE INDEX IF NOT EXISTS idx_empresa_situacao ON empresas (situacao_cadastral)",

		// Índices para User
		"CREATE INDEX IF NOT EXISTS idx_user_email ON users (email)",

		// Índices para AtividadeSecundaria
		"CREATE INDEX IF NOT EXISTS idx_atividade_empresa_id ON atividades_secundarias (empresa_id)",
		"CREATE INDEX IF NOT EXISTS idx_atividade_codigo ON atividades_secundarias (codigo)",

		// Índices para EmpresaMembro
		"CREATE INDEX IF NOT EXISTS idx_empresa_membro_empresa_id ON empresa_membros (empresa_id)",
		"CREATE INDEX IF NOT EXISTS idx_empresa_membro_documento ON empresa_membros (numero_documento)",
		"CREATE INDEX IF NOT EXISTS idx_empresa_membro_nome ON empresa_membros (nome)",

		// Índices para EmpresaInscricaoEstadual
		"CREATE INDEX IF NOT EXISTS idx_empresa_inscricao_empresa_id ON empresa_inscricoes_estaduais (empresa_id)",
		"CREATE INDEX IF NOT EXISTS idx_empresa_inscricao_numero ON empresa_inscricoes_estaduais (numero)",
		"CREATE INDEX IF NOT EXISTS idx_empresa_inscricao_estado ON empresa_inscricoes_estaduais (estado)",

		// Índices para EmpresaSuframa
		"CREATE INDEX IF NOT EXISTS idx_empresa_suframa_empresa_id ON empresa_suframa (empresa_id)",
		"CREATE INDEX IF NOT EXISTS idx_empresa_suframa_numero ON empresa_suframa (numero)",

		// Índices para EmpresaTelefone
		"CREATE INDEX IF NOT EXISTS idx_empresa_telefone_empresa_id ON empresa_telefones (empresa_id)",
		"CREATE INDEX IF NOT EXISTS idx_empresa_telefone_principal ON empresa_telefones (principal)",

		// Índices para EmpresaEmail
		"CREATE INDEX IF NOT EXISTS idx_empresa_email_empresa_id ON empresa_emails (empresa_id)",
		"CREATE INDEX IF NOT EXISTS idx_empresa_email_principal ON empresa_emails (principal)",
		"CREATE INDEX IF NOT EXISTS idx_empresa_email_email ON empresa_emails (email)",
	}

	for _, indexSQL := range indexes {
		_, err := DB.ExecContext(ctx, indexSQL)
		if err != nil {
			logger.Database().Error().Err(err).Str("sql", indexSQL).Msg("Erro ao criar índice")
			return err
		}
	}

	return nil
}
