package service

import (
	"context"
	"fmt"
	"strconv"
	"zemdocs/internal/clientes/documents"
	"zemdocs/internal/database/model"
	"zemdocs/internal/database/repository"
	"zemdocs/internal/logger"
	"zemdocs/internal/storage"
	"zemdocs/internal/utils"
)

type NFSeService struct {
	nfseRegistry *documents.Registry
	nfseRepo     *repository.DocumentRepository
	minioClient  *storage.MinIOClient
	useLocalData bool // Flag para usar dados locais ou API externa
}

func NewNFSeService(nfseRegistry *documents.Registry, nfseRepo *repository.DocumentRepository, minioClient *storage.MinIOClient) *NFSeService {
	return &NFSeService{
		nfseRegistry: nfseRegistry,
		nfseRepo:     nfseRepo,
		minioClient:  minioClient,
		useLocalData: true, // Por padrão, usar dados locais
	}
}

// ConsultarPorNumero consulta documento por número
func (s *NFSeService) ConsultarPorNumero(ctx context.Context, numeroNfse string) (*model.DocumentResponse, error) {
	if s.useLocalData {
		// Buscar no banco local
		nfse, err := s.nfseRepo.GetByNumeroNfse(ctx, numeroNfse)
		if err != nil {
			return nil, err
		}
		return s.toModelResponseFromDB(nfse), nil
	}

	// Fallback para API externa
	client, exists := s.nfseRegistry.GetClient("2105302")
	if !exists {
		return nil, fmt.Errorf("cliente para Imperatriz não encontrado")
	}

	req := documents.ConsultarRequest{
		NumeroNfse: numeroNfse,
	}

	nfseResp, err := client.ConsultarDocuments(ctx, req)
	if err != nil {
		return nil, err
	}

	return s.toModelResponse(nfseResp), nil
}

// ConsultarPorRPS consulta documento por número do RPS
func (s *NFSeService) ConsultarPorRPS(ctx context.Context, numeroRps string) (*model.DocumentResponse, error) {
	// Por enquanto, usar Imperatriz como padrão (código IBGE: 2105302)
	client, exists := s.nfseRegistry.GetClient("2105302")
	if !exists {
		return nil, fmt.Errorf("cliente para Imperatriz não encontrado")
	}

	req := documents.ConsultarRequest{
		NumeroRps: numeroRps,
	}

	nfseResp, err := client.ConsultarDocuments(ctx, req)
	if err != nil {
		return nil, err
	}

	return s.toModelResponse(nfseResp), nil
}

// ConsultarXMLPorIntervalo consulta XMLs por intervalo de números
func (s *NFSeService) ConsultarXMLPorIntervalo(ctx context.Context, nrInicial, nrFinal string) ([]*model.DocumentResponse, error) {
	// Por enquanto, usar Imperatriz como padrão (código IBGE: 2105302)
	client, exists := s.nfseRegistry.GetClient("2105302")
	if !exists {
		return nil, fmt.Errorf("cliente para Imperatriz não encontrado")
	}

	req := documents.ConsultarXMLRequest{
		NrInicial: nrInicial,
		NrFinal:   nrFinal,
	}

	nfses, err := client.ConsultarXMLDocuments(ctx, req)
	if err != nil {
		return nil, err
	}

	var responses []*model.DocumentResponse
	for _, nfseResp := range nfses {
		response := s.toModelResponse(&nfseResp)
		responses = append(responses, response)
	}

	return responses, nil
}

// ConsultarXMLPorData consulta XMLs por intervalo de datas
func (s *NFSeService) ConsultarXMLPorData(ctx context.Context, dtInicial, dtFinal string, page int) ([]*model.DocumentResponse, error) {
	// Por enquanto, usar Imperatriz como padrão (código IBGE: 2105302)
	client, exists := s.nfseRegistry.GetClient("2105302")
	if !exists {
		return nil, fmt.Errorf("cliente para Imperatriz não encontrado")
	}

	pageStr := "1"
	if page > 0 {
		pageStr = strconv.Itoa(page)
	}

	req := documents.ConsultarXMLRequest{
		DtInicial: dtInicial,
		DtFinal:   dtFinal,
		NrPage:    pageStr,
	}

	nfses, err := client.ConsultarXMLDocuments(ctx, req)
	if err != nil {
		return nil, err
	}

	var responses []*model.DocumentResponse
	for _, nfseResp := range nfses {
		response := s.toModelResponse(&nfseResp)
		responses = append(responses, response)
	}

	return responses, nil
}

// ConsultarXMLPorCompetencia consulta XMLs por competência
func (s *NFSeService) ConsultarXMLPorCompetencia(ctx context.Context, competencia string) ([]*model.DocumentResponse, error) {
	// Por enquanto, usar Imperatriz como padrão (código IBGE: 2105302)
	client, exists := s.nfseRegistry.GetClient("2105302")
	if !exists {
		return nil, fmt.Errorf("cliente para Imperatriz não encontrado")
	}

	req := documents.ConsultarXMLRequest{
		NrCompetencia: competencia,
	}

	nfses, err := client.ConsultarXMLDocuments(ctx, req)
	if err != nil {
		return nil, err
	}

	var responses []*model.DocumentResponse
	for _, nfseResp := range nfses {
		response := s.toModelResponse(&nfseResp)
		responses = append(responses, response)
	}

	return responses, nil
}

// UltimoRPSEnviado retorna o número do último RPS enviado
func (s *NFSeService) UltimoRPSEnviado(ctx context.Context) (string, error) {
	// Por enquanto, usar Imperatriz como padrão (código IBGE: 2105302)
	client, exists := s.nfseRegistry.GetClient("2105302")
	if !exists {
		return "", fmt.Errorf("cliente para Imperatriz não encontrado")
	}

	return client.UltimoRPSEnviado(ctx)
}

// toModelResponse converte documents.Response para model.DocumentResponse
func (s *NFSeService) toModelResponse(nfseResp *documents.Response) *model.DocumentResponse {
	return &model.DocumentResponse{
		DocumentType:      model.DocumentType(nfseResp.DocumentType),
		NumeroDocumento:   nfseResp.NumeroDocumento,
		NumeroRps:         nfseResp.NumeroRps,
		SerieRps:          nfseResp.SerieRps,
		DataEmissao:       nfseResp.DataEmissao,
		Status:            nfseResp.Status,
		CodigoVerificacao: nfseResp.CodigoVerificacao,
		ValorNota:         nfseResp.ValorServico, // Mapear ValorServico para ValorNota
		AliquotaIss:       0,                     // Será extraído do XML se necessário
		ValorIss:          nfseResp.ValorIss,
		Competencia:       nfseResp.Competencia,
		XMLContent:        nfseResp.XMLContent,
	}
}

// toModelResponseFromDB converte model.Document para model.DocumentResponse
func (s *NFSeService) toModelResponseFromDB(document *model.Document) *model.DocumentResponse {
	return &model.DocumentResponse{
		ID:                         document.ID,
		DocumentType:               document.DocumentType,
		NumeroDocumento:            document.NumeroDocumento,
		NumeroRps:                  document.NumeroRps,
		SerieRps:                   document.SerieRps,
		DataEmissao:                document.DataEmissao,
		Status:                     document.Status,
		CodigoVerificacao:          document.CodigoVerificacao,
		ValorNota:                  document.ValorNota,
		AliquotaIss:                document.AliquotaIss,
		ValorIss:                   document.ValorIss,
		Competencia:                document.Competencia,
		CNPJEmitente:               document.CNPJEmitente,
		RazaoSocialEmitente:        document.RazaoSocialEmitente,
		InscricaoMunicipalEmitente: document.InscricaoMunicipalEmitente,
		CNPJDestinatario:           document.CNPJDestinatario,
		RazaoSocialDestinatario:    document.RazaoSocialDestinatario,
		Discriminacao:              document.Discriminacao,
		CodigoServico:              document.CodigoServico,
		ItemListaServico:           document.ItemListaServico,
		CodigoMunicipio:            document.CodigoMunicipio,
		CodigoIBGE:                 document.CodigoIBGE,
		XMLContent:                 "", // XML será buscado do MinIO se necessário
	}
}

// GetXMLContent busca o conteúdo XML do MinIO
func (s *NFSeService) GetXMLContent(ctx context.Context, numeroNfse, competencia string) (string, error) {
	// Primeiro tentar buscar pela estrutura nova (com CNPJ)
	// Para isso, precisamos buscar o CNPJ do prestador no banco
	nfse, err := s.nfseRepo.GetByNumeroNfse(ctx, numeroNfse)
	if err == nil && nfse.CNPJEmitente != "" {
		objectName := s.minioClient.GenerateObjectNameWithCNPJ(numeroNfse, competencia, nfse.CNPJEmitente)
		xmlData, err := s.minioClient.DownloadXML(ctx, objectName)
		if err == nil {
			return string(xmlData), nil
		}
	}

	// Fallback para estrutura antiga
	objectName := s.minioClient.GenerateObjectName(numeroNfse, competencia)
	xmlData, err := s.minioClient.DownloadXML(ctx, objectName)
	if err != nil {
		return "", fmt.Errorf("erro ao buscar XML: %w", err)
	}
	return string(xmlData), nil
}

// GetClient retorna um cliente de documentos por código IBGE
func (s *NFSeService) GetClient(codigoIBGE string) (documents.Client, bool) {
	return s.nfseRegistry.GetClient(codigoIBGE)
}

// SincronizarNFSe executa sincronização manual das NFS-e
func (s *NFSeService) SincronizarNFSe(ctx context.Context, competencia string) error {
	// Obter cliente de Imperatriz (código IBGE: 2105302)
	client, exists := s.nfseRegistry.GetClient("2105302")
	if !exists {
		return fmt.Errorf("cliente de Imperatriz não encontrado")
	}

	// Buscar documentos da API externa
	req := documents.ConsultarXMLRequest{
		NrCompetencia: competencia,
	}

	nfseList, err := client.ConsultarXMLDocuments(ctx, req)
	if err != nil {
		return fmt.Errorf("erro ao buscar NFS-e da API: %w", err)
	}

	totalProcessed := 0
	totalErrors := 0

	// Processar cada NFS-e
	for _, nfseResp := range nfseList {
		if err := s.processarNFSe(ctx, &nfseResp); err != nil {
			logger.Error(err, fmt.Sprintf("Erro ao processar NFS-e %s", nfseResp.NumeroNfse))
			totalErrors++
		} else {
			totalProcessed++
		}
	}

	logger.Info(fmt.Sprintf("Sincronização concluída - competencia: %s, processadas: %d, erros: %d",
		competencia, totalProcessed, totalErrors))

	return nil
}

// processarNFSe processa um documento individual
func (s *NFSeService) processarNFSe(ctx context.Context, nfseResp *documents.Response) error {
	// Verificar se já existe no banco
	exists, err := s.nfseRepo.ExistsByNumeroNfse(ctx, nfseResp.NumeroNfse)
	if err != nil {
		return fmt.Errorf("erro ao verificar existência: %w", err)
	}

	if exists {
		logger.Debug(fmt.Sprintf("NFS-e %s já existe, pulando", nfseResp.NumeroNfse))
		return nil
	}

	// Extrair metadados do XML se disponível
	var metadata *XMLMetadata
	if nfseResp.XMLContent != "" {
		if xmlData, err := s.extractMetadataFromXML(nfseResp.XMLContent); err == nil && xmlData != nil {
			metadata = xmlData
		}
	}

	// Criar modelo Document com valores da resposta da API
	nfse := &model.Document{
		DocumentType:        model.DocumentTypeNFSe,
		NumeroDocumento:     nfseResp.NumeroNfse,
		NumeroRps:           nfseResp.NumeroRps,
		SerieRps:            nfseResp.SerieRps,
		TipoRps:             1, // Padrão
		DataEmissao:         nfseResp.DataEmissao,
		Status:              nfseResp.Status,
		CodigoVerificacao:   nfseResp.CodigoVerificacao,
		ValorNota:           nfseResp.ValorServico, // Mapear ValorServico para ValorNota
		AliquotaIss:         0,                     // Será extraído do XML se necessário
		ValorIss:            nfseResp.ValorIss,
		Competencia:         nfseResp.Competencia,
		CNPJEmitente:        "",
		RazaoSocialEmitente: "",
		XMLContent:          nfseResp.XMLContent, // Salvar XML no banco também
	}

	// Aplicar metadados extraídos do XML
	if metadata != nil {
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
	if err := s.nfseRepo.Create(ctx, nfse); err != nil {
		return fmt.Errorf("erro ao salvar no banco: %w", err)
	}

	// Salvar XML no MinIO
	if nfseResp.XMLContent != "" {
		// Usar CNPJ do prestador se disponível, senão usar estrutura padrão
		var objectName string
		if metadata != nil && metadata.CNPJPrestador != "" {
			objectName = s.minioClient.GenerateObjectNameWithCNPJ(nfseResp.NumeroNfse, nfseResp.Competencia, metadata.CNPJPrestador)
		} else {
			objectName = s.minioClient.GenerateObjectName(nfseResp.NumeroNfse, nfseResp.Competencia)
		}

		if err := s.minioClient.UploadXML(ctx, objectName, []byte(nfseResp.XMLContent)); err != nil {
			logger.Error(err, fmt.Sprintf("Erro ao salvar XML no MinIO para NFS-e %s", nfseResp.NumeroNfse))
			// Não retornar erro, pois o registro já foi salvo no banco
		} else {
			logger.Info(fmt.Sprintf("XML da NFS-e %s salvo no MinIO: %s", nfseResp.NumeroNfse, objectName))
		}
	}

	logger.Debug(fmt.Sprintf("Documento %s processado com sucesso - valor: R$ %.2f",
		nfse.NumeroDocumento, nfse.ValorNota))

	return nil
}

// XMLMetadata metadados extraídos do XML para o serviço
type XMLMetadata struct {
	CNPJPrestador               string
	RazaoSocialPrestador        string
	InscricaoMunicipalPrestador string
	CNPJTomador                 string
	RazaoSocialTomador          string
	Discriminacao               string
	CodigoServico               string
	ItemListaServico            string
	CodigoMunicipio             string
	CodigoIBGE                  string
}

// extractMetadataFromXML extrai metadados do XML da NFS-e
func (s *NFSeService) extractMetadataFromXML(xmlContent string) (*XMLMetadata, error) {
	if xmlContent == "" {
		return nil, nil
	}

	// Usar o parser completo do XML
	xmlData, err := utils.ParseNFSeXML(xmlContent)
	if err != nil {
		return nil, err
	}

	metadata := &XMLMetadata{
		CNPJPrestador:               xmlData.CNPJPrestador,
		RazaoSocialPrestador:        xmlData.RazaoSocialPrestador,
		InscricaoMunicipalPrestador: xmlData.InscricaoMunicipalPrestador,
		CNPJTomador:                 xmlData.CNPJTomador,
		RazaoSocialTomador:          xmlData.RazaoSocialTomador,
		Discriminacao:               xmlData.Discriminacao,
		CodigoServico:               xmlData.CodigoServico,
		ItemListaServico:            xmlData.ItemListaServico,
		CodigoMunicipio:             xmlData.CodigoMunicipio,
		CodigoIBGE:                  xmlData.CodigoMunicipio, // Usar CodigoMunicipio como IBGE
	}

	return metadata, nil
}
