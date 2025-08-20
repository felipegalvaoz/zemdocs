package service

import (
	"context"
	"fmt"
	"strconv"
	"zemdocs/internal/clientes/nfse"
	"zemdocs/internal/database/model"
	"zemdocs/internal/database/repository"
	"zemdocs/internal/storage"
)

type NFSeService struct {
	nfseRegistry *nfse.Registry
	nfseRepo     *repository.NFSeRepository
	minioClient  *storage.MinIOClient
	useLocalData bool // Flag para usar dados locais ou API externa
}

func NewNFSeService(nfseRegistry *nfse.Registry, nfseRepo *repository.NFSeRepository, minioClient *storage.MinIOClient) *NFSeService {
	return &NFSeService{
		nfseRegistry: nfseRegistry,
		nfseRepo:     nfseRepo,
		minioClient:  minioClient,
		useLocalData: true, // Por padrão, usar dados locais
	}
}

// ConsultarPorNumero consulta NFS-e por número
func (s *NFSeService) ConsultarPorNumero(ctx context.Context, numeroNfse string) (*model.NFSeResponse, error) {
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

	req := nfse.ConsultarRequest{
		NumeroNfse: numeroNfse,
	}

	nfseResp, err := client.ConsultarNFSe(ctx, req)
	if err != nil {
		return nil, err
	}

	return s.toModelResponse(nfseResp), nil
}

// ConsultarPorRPS consulta NFS-e por número do RPS
func (s *NFSeService) ConsultarPorRPS(ctx context.Context, numeroRps string) (*model.NFSeResponse, error) {
	// Por enquanto, usar Imperatriz como padrão (código IBGE: 2105302)
	client, exists := s.nfseRegistry.GetClient("2105302")
	if !exists {
		return nil, fmt.Errorf("cliente para Imperatriz não encontrado")
	}

	req := nfse.ConsultarRequest{
		NumeroRps: numeroRps,
	}

	nfseResp, err := client.ConsultarNFSe(ctx, req)
	if err != nil {
		return nil, err
	}

	return s.toModelResponse(nfseResp), nil
}

// ConsultarXMLPorIntervalo consulta XMLs por intervalo de números
func (s *NFSeService) ConsultarXMLPorIntervalo(ctx context.Context, nrInicial, nrFinal string) ([]*model.NFSeResponse, error) {
	// Por enquanto, usar Imperatriz como padrão (código IBGE: 2105302)
	client, exists := s.nfseRegistry.GetClient("2105302")
	if !exists {
		return nil, fmt.Errorf("cliente para Imperatriz não encontrado")
	}

	req := nfse.ConsultarXMLRequest{
		NrInicial: nrInicial,
		NrFinal:   nrFinal,
	}

	nfses, err := client.ConsultarXMLNFSe(ctx, req)
	if err != nil {
		return nil, err
	}

	var responses []*model.NFSeResponse
	for _, nfseResp := range nfses {
		response := s.toModelResponse(&nfseResp)
		responses = append(responses, response)
	}

	return responses, nil
}

// ConsultarXMLPorData consulta XMLs por intervalo de datas
func (s *NFSeService) ConsultarXMLPorData(ctx context.Context, dtInicial, dtFinal string, page int) ([]*model.NFSeResponse, error) {
	// Por enquanto, usar Imperatriz como padrão (código IBGE: 2105302)
	client, exists := s.nfseRegistry.GetClient("2105302")
	if !exists {
		return nil, fmt.Errorf("cliente para Imperatriz não encontrado")
	}

	pageStr := "1"
	if page > 0 {
		pageStr = strconv.Itoa(page)
	}

	req := nfse.ConsultarXMLRequest{
		DtInicial: dtInicial,
		DtFinal:   dtFinal,
		NrPage:    pageStr,
	}

	nfses, err := client.ConsultarXMLNFSe(ctx, req)
	if err != nil {
		return nil, err
	}

	var responses []*model.NFSeResponse
	for _, nfseResp := range nfses {
		response := s.toModelResponse(&nfseResp)
		responses = append(responses, response)
	}

	return responses, nil
}

// ConsultarXMLPorCompetencia consulta XMLs por competência
func (s *NFSeService) ConsultarXMLPorCompetencia(ctx context.Context, competencia string) ([]*model.NFSeResponse, error) {
	// Por enquanto, usar Imperatriz como padrão (código IBGE: 2105302)
	client, exists := s.nfseRegistry.GetClient("2105302")
	if !exists {
		return nil, fmt.Errorf("cliente para Imperatriz não encontrado")
	}

	req := nfse.ConsultarXMLRequest{
		NrCompetencia: competencia,
	}

	nfses, err := client.ConsultarXMLNFSe(ctx, req)
	if err != nil {
		return nil, err
	}

	var responses []*model.NFSeResponse
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

// toModelResponse converte nfse.Response para model.NFSeResponse
func (s *NFSeService) toModelResponse(nfseResp *nfse.Response) *model.NFSeResponse {
	return &model.NFSeResponse{
		NumeroNfse:        nfseResp.NumeroNfse,
		NumeroRps:         nfseResp.NumeroRps,
		SerieRps:          nfseResp.SerieRps,
		DataEmissao:       nfseResp.DataEmissao,
		Status:            nfseResp.Status,
		CodigoVerificacao: nfseResp.CodigoVerificacao,
		ValorServico:      nfseResp.ValorServico,
		ValorIss:          nfseResp.ValorIss,
		Competencia:       nfseResp.Competencia,
		XMLContent:        nfseResp.XMLContent,
	}
}

// toModelResponseFromDB converte model.NFSe para model.NFSeResponse
func (s *NFSeService) toModelResponseFromDB(nfse *model.NFSe) *model.NFSeResponse {
	return &model.NFSeResponse{
		NumeroNfse:        nfse.NumeroNfse,
		NumeroRps:         nfse.NumeroRps,
		SerieRps:          nfse.SerieRps,
		DataEmissao:       nfse.DataEmissao,
		Status:            nfse.Status,
		CodigoVerificacao: nfse.CodigoVerificacao,
		ValorServico:      nfse.ValorServico,
		ValorIss:          nfse.ValorIss,
		Competencia:       nfse.Competencia,
		XMLContent:        "", // XML será buscado do MinIO se necessário
	}
}

// GetXMLContent busca o conteúdo XML do MinIO
func (s *NFSeService) GetXMLContent(ctx context.Context, numeroNfse, competencia string) (string, error) {
	objectName := s.minioClient.GenerateObjectName(numeroNfse, competencia)
	xmlData, err := s.minioClient.DownloadXML(ctx, objectName)
	if err != nil {
		return "", fmt.Errorf("erro ao buscar XML: %w", err)
	}
	return string(xmlData), nil
}

// toResponse converte model.NFSe para model.NFSeResponse
func (s *NFSeService) toResponse(nfse *model.NFSe) *model.NFSeResponse {
	return &model.NFSeResponse{
		NumeroNfse:        nfse.NumeroNfse,
		NumeroRps:         nfse.NumeroRps,
		SerieRps:          nfse.SerieRps,
		DataEmissao:       nfse.DataEmissao,
		Status:            nfse.Status,
		CodigoVerificacao: nfse.CodigoVerificacao,
		ValorServico:      nfse.ValorServico,
		ValorIss:          nfse.ValorIss,
		Competencia:       nfse.Competencia,
	}
}
