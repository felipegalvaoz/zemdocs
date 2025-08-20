package jobs

import (
	"context"
	"fmt"
	"strconv"
	"time"

	"zemdocs/internal/clientes/documents"
	"zemdocs/internal/database/model"
	"zemdocs/internal/database/repository"
	"zemdocs/internal/logger"
	"zemdocs/internal/storage"
	"zemdocs/internal/utils"
)

// NFSeSyncJob job para sincronizar NFS-e da prefeitura
type NFSeSyncJob struct {
	nfseClient  documents.Client
	nfseRepo    *repository.DocumentRepository
	minioClient *storage.MinIOClient
	competencia string
	maxRetries  int
	pageSize    int
}

// NewNFSeSyncJob cria uma nova instância do job
func NewNFSeSyncJob(
	nfseClient documents.Client,
	nfseRepo *repository.DocumentRepository,
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
func (j *NFSeSyncJob) fetchNFSeByCompetencia(ctx context.Context, page int) ([]documents.Response, error) {
	req := documents.ConsultarXMLRequest{
		NrCompetencia: j.competencia,
		NrPage:        strconv.Itoa(page),
	}

	var nfseList []documents.Response
	var err error

	// Retry com backoff exponencial
	for attempt := 1; attempt <= j.maxRetries; attempt++ {
		nfseList, err = j.nfseClient.ConsultarXMLDocuments(ctx, req)
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
func (j *NFSeSyncJob) processNFSe(ctx context.Context, nfseResp *documents.Response) error {
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

	// Criar modelo Document
	nfse := &model.Document{
		DocumentType:      model.DocumentTypeNFSe,
		NumeroDocumento:   nfseResp.NumeroNfse,
		NumeroRps:         nfseResp.NumeroRps,
		SerieRps:          nfseResp.SerieRps,
		TipoRps:           1, // Padrão
		DataEmissao:       nfseResp.DataEmissao,
		Status:            nfseResp.Status,
		CodigoVerificacao: nfseResp.CodigoVerificacao,
		ValorNota:         nfseResp.ValorServico, // Mapear ValorServico para ValorNota
		AliquotaIss:       0,                     // Será extraído do XML se necessário
		ValorIss:          nfseResp.ValorIss,
		Competencia:       nfseResp.Competencia,
		XMLContent:        "", // Não armazenar XML no banco
	}

	// Aplicar metadados extraídos
	if metadata != nil {
		if metadata.ValorServico > 0 {
			nfse.ValorNota = metadata.ValorServico
		}
		if metadata.ValorIss > 0 {
			nfse.ValorIss = metadata.ValorIss
		}
		if metadata.Aliquota > 0 {
			nfse.AliquotaIss = metadata.Aliquota
		}
		if metadata.CNPJPrestador != "" {
			nfse.CNPJEmitente = metadata.CNPJPrestador
		}
		if metadata.RazaoSocialPrestador != "" {
			nfse.RazaoSocialEmitente = metadata.RazaoSocialPrestador
		}
		if metadata.InscricaoMunicipalPrestador != "" {
			nfse.InscricaoMunicipalEmitente = metadata.InscricaoMunicipalPrestador
		}
		if metadata.CNPJTomador != "" {
			nfse.CNPJDestinatario = metadata.CNPJTomador
		}
		if metadata.RazaoSocialTomador != "" {
			nfse.RazaoSocialDestinatario = metadata.RazaoSocialTomador
		}
		if metadata.Discriminacao != "" {
			nfse.Discriminacao = metadata.Discriminacao
		}
		if metadata.CodigoServico != "" {
			nfse.CodigoServico = metadata.CodigoServico
		}
		if metadata.ItemListaServico != "" {
			nfse.ItemListaServico = metadata.ItemListaServico
		}
		if metadata.CodigoMunicipio != "" {
			nfse.CodigoMunicipio = metadata.CodigoMunicipio
		}
		if metadata.CodigoIBGE != "" {
			nfse.CodigoIBGE = metadata.CodigoIBGE
		}
	}

	// Salvar no banco
	if err := j.nfseRepo.Create(ctx, nfse); err != nil {
		return fmt.Errorf("erro ao salvar no banco: %w", err)
	}

	// Salvar XML no MinIO
	if nfseResp.XMLContent != "" {
		// Usar CNPJ do prestador se disponível nos metadados, senão usar padrão
		var objectName string
		if metadata != nil && len(nfse.CNPJEmitente) > 0 {
			objectName = j.minioClient.GenerateObjectNameWithCNPJ(nfseResp.NumeroNfse, nfseResp.Competencia, nfse.CNPJEmitente)
		} else {
			objectName = j.minioClient.GenerateObjectName(nfseResp.NumeroNfse, nfseResp.Competencia)
		}

		if err := j.minioClient.UploadXML(ctx, objectName, []byte(nfseResp.XMLContent)); err != nil {
			logger.Database().Error().
				Err(err).
				Str("numero_nfse", nfseResp.NumeroNfse).
				Str("object_name", objectName).
				Msg("Erro ao salvar XML no MinIO")
			// Não retornar erro, pois o registro já foi salvo no banco
		} else {
			logger.Database().Info().
				Str("numero_nfse", nfseResp.NumeroNfse).
				Str("object_name", objectName).
				Msg("XML salvo no MinIO com sucesso")
		}
	}

	logger.Database().Debug().
		Str("numero_nfse", nfseResp.NumeroNfse).
		Float64("valor_nota", nfse.ValorNota).
		Msg("NFS-e processada com sucesso")

	return nil
}

// XMLMetadata metadados extraídos do XML
type XMLMetadata struct {
	ValorServico                float64
	ValorIss                    float64
	Aliquota                    float64
	Discriminacao               string
	CodigoServico               string
	ItemListaServico            string
	CodigoMunicipio             string
	CodigoIBGE                  string
	CNPJPrestador               string
	RazaoSocialPrestador        string
	InscricaoMunicipalPrestador string
	CNPJTomador                 string
	RazaoSocialTomador          string
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
		ValorServico:                xmlData.ValorServico,
		ValorIss:                    xmlData.ValorIss,
		Aliquota:                    xmlData.Aliquota,
		Discriminacao:               xmlData.Discriminacao,
		CodigoServico:               xmlData.CodigoServico,
		ItemListaServico:            xmlData.ItemListaServico,
		CodigoMunicipio:             xmlData.CodigoMunicipio,
		CodigoIBGE:                  xmlData.CodigoMunicipio, // Usar CodigoMunicipio como IBGE
		CNPJPrestador:               xmlData.CNPJPrestador,
		RazaoSocialPrestador:        xmlData.RazaoSocialPrestador,
		InscricaoMunicipalPrestador: xmlData.InscricaoMunicipalPrestador,
		CNPJTomador:                 xmlData.CNPJTomador,
		RazaoSocialTomador:          xmlData.RazaoSocialTomador,
	}

	return metadata, nil
}
