package jobs

import (
	"context"
	"fmt"
	"strconv"
	"time"

	"zemdocs/internal/clientes/nfse"
	"zemdocs/internal/database/model"
	"zemdocs/internal/database/repository"
	"zemdocs/internal/logger"
	"zemdocs/internal/storage"
	"zemdocs/internal/utils"
)

// NFSeSyncJob job para sincronizar NFS-e da prefeitura
type NFSeSyncJob struct {
	nfseClient  nfse.Client
	nfseRepo    *repository.NFSeRepository
	minioClient *storage.MinIOClient
	competencia string
	maxRetries  int
	pageSize    int
}

// NewNFSeSyncJob cria uma nova instância do job
func NewNFSeSyncJob(
	nfseClient nfse.Client,
	nfseRepo *repository.NFSeRepository,
	minioClient *storage.MinIOClient,
	competencia string,
) *NFSeSyncJob {
	return &NFSeSyncJob{
		nfseClient:  nfseClient,
		nfseRepo:    nfseRepo,
		minioClient: minioClient,
		competencia: competencia,
		maxRetries:  3,
		pageSize:    100,
	}
}

// Name retorna o nome do job
func (j *NFSeSyncJob) Name() string {
	return fmt.Sprintf("nfse-sync-%s", j.competencia)
}

// Execute executa o job de sincronização
func (j *NFSeSyncJob) Execute(ctx context.Context) error {
	logger.Database().Info().
		Str("competencia", j.competencia).
		Msg("Iniciando sincronização de NFS-e")

	// Buscar NFS-e por competência com paginação
	page := 1
	totalProcessed := 0
	totalErrors := 0

	for {
		select {
		case <-ctx.Done():
			return ctx.Err()
		default:
		}

		// Buscar página atual
		nfseList, err := j.fetchNFSeByCompetencia(ctx, page)
		if err != nil {
			logger.Database().Error().
				Err(err).
				Int("page", page).
				Str("competencia", j.competencia).
				Msg("Erro ao buscar NFS-e")

			if page == 1 {
				return fmt.Errorf("erro na primeira página: %w", err)
			}
			break
		}

		// Se não há mais dados, parar
		if len(nfseList) == 0 {
			break
		}

		// Processar cada NFS-e
		for _, nfseResp := range nfseList {
			if err := j.processNFSe(ctx, &nfseResp); err != nil {
				logger.Database().Error().
					Err(err).
					Str("numero_nfse", nfseResp.NumeroNfse).
					Msg("Erro ao processar NFS-e")
				totalErrors++
			} else {
				totalProcessed++
			}
		}

		logger.Database().Info().
			Int("page", page).
			Int("count", len(nfseList)).
			Int("processed", totalProcessed).
			Int("errors", totalErrors).
			Msg("Página processada")

		// Se retornou menos que o tamanho da página, é a última
		if len(nfseList) < j.pageSize {
			break
		}

		page++
	}

	logger.Database().Info().
		Str("competencia", j.competencia).
		Int("total_processed", totalProcessed).
		Int("total_errors", totalErrors).
		Msg("Sincronização de NFS-e concluída")

	return nil
}

// fetchNFSeByCompetencia busca NFS-e por competência
func (j *NFSeSyncJob) fetchNFSeByCompetencia(ctx context.Context, page int) ([]nfse.Response, error) {
	req := nfse.ConsultarXMLRequest{
		NrCompetencia: j.competencia,
		NrPage:        strconv.Itoa(page),
	}

	var nfseList []nfse.Response
	var err error

	// Retry com backoff exponencial
	for attempt := 1; attempt <= j.maxRetries; attempt++ {
		nfseList, err = j.nfseClient.ConsultarXMLNFSe(ctx, req)
		if err == nil {
			break
		}

		if attempt < j.maxRetries {
			backoff := time.Duration(attempt*attempt) * time.Second
			logger.Database().Warn().
				Err(err).
				Int("attempt", attempt).
				Dur("backoff", backoff).
				Msg("Tentativa falhou, tentando novamente")

			select {
			case <-ctx.Done():
				return nil, ctx.Err()
			case <-time.After(backoff):
			}
		}
	}

	return nfseList, err
}

// processNFSe processa uma NFS-e individual
func (j *NFSeSyncJob) processNFSe(ctx context.Context, nfseResp *nfse.Response) error {
	// Verificar se já existe no banco
	exists, err := j.nfseRepo.ExistsByNumeroNfse(ctx, nfseResp.NumeroNfse)
	if err != nil {
		return fmt.Errorf("erro ao verificar existência: %w", err)
	}

	if exists {
		logger.Database().Debug().
			Str("numero_nfse", nfseResp.NumeroNfse).
			Msg("NFS-e já existe, pulando")
		return nil
	}

	// Extrair metadados do XML
	metadata, err := j.extractMetadata(nfseResp.XMLContent)
	if err != nil {
		return fmt.Errorf("erro ao extrair metadados: %w", err)
	}

	// Criar modelo NFS-e
	nfse := &model.NFSe{
		NumeroNfse:        nfseResp.NumeroNfse,
		NumeroRps:         nfseResp.NumeroRps,
		SerieRps:          nfseResp.SerieRps,
		TipoRps:           1, // Padrão
		DataEmissao:       nfseResp.DataEmissao,
		Status:            nfseResp.Status,
		CodigoVerificacao: nfseResp.CodigoVerificacao,
		ValorServico:      nfseResp.ValorServico,
		ValorIss:          nfseResp.ValorIss,
		Competencia:       nfseResp.Competencia,
		XMLContent:        "", // Não armazenar XML no banco
	}

	// Aplicar metadados extraídos
	if metadata != nil {
		if metadata.ValorServico > 0 {
			nfse.ValorServico = metadata.ValorServico
		}
		if metadata.ValorIss > 0 {
			nfse.ValorIss = metadata.ValorIss
		}
	}

	// Salvar no banco
	if err := j.nfseRepo.Create(ctx, nfse); err != nil {
		return fmt.Errorf("erro ao salvar no banco: %w", err)
	}

	// Salvar XML no MinIO
	if nfseResp.XMLContent != "" {
		objectName := j.minioClient.GenerateObjectName(nfseResp.NumeroNfse, nfseResp.Competencia)
		if err := j.minioClient.UploadXML(ctx, objectName, []byte(nfseResp.XMLContent)); err != nil {
			logger.Database().Error().
				Err(err).
				Str("numero_nfse", nfseResp.NumeroNfse).
				Msg("Erro ao salvar XML no MinIO")
			// Não retornar erro, pois o registro já foi salvo no banco
		}
	}

	logger.Database().Debug().
		Str("numero_nfse", nfseResp.NumeroNfse).
		Float64("valor_servico", nfse.ValorServico).
		Msg("NFS-e processada com sucesso")

	return nil
}

// XMLMetadata metadados extraídos do XML
type XMLMetadata struct {
	ValorServico float64
	ValorIss     float64
	Descricao    string
}

// extractMetadata extrai metadados do XML da NFS-e usando o parser completo
func (j *NFSeSyncJob) extractMetadata(xmlContent string) (*XMLMetadata, error) {
	if xmlContent == "" {
		return nil, nil
	}

	// Usar o parser completo do XML
	xmlData, err := utils.ParseNFSeXML(xmlContent)
	if err != nil {
		// Se não conseguir fazer parse, não é erro crítico
		logger.Database().Debug().
			Err(err).
			Msg("Erro ao fazer parse do XML, usando valores da API")
		return nil, nil
	}

	metadata := &XMLMetadata{
		ValorServico: xmlData.ValorServico,
		ValorIss:     xmlData.ValorIss,
		Descricao:    xmlData.Discriminacao,
	}

	return metadata, nil
}
