package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"

	"zemdocs/internal/clientes/documents"
	"zemdocs/internal/service"
	"zemdocs/internal/utils"

	"github.com/gin-gonic/gin"
)

type NFSeHandler struct {
	nfseService *service.NFSeService
}

func NewNFSeHandler(nfseService *service.NFSeService) *NFSeHandler {
	return &NFSeHandler{
		nfseService: nfseService,
	}
}

// ConsultarNFSe consulta uma NFS-e por número ou RPS
func (h *NFSeHandler) ConsultarNFSe(c *gin.Context) {
	numeroNfse := c.Query("NumeroNfse")
	numeroRps := c.Query("NumeroRps")

	if numeroNfse == "" && numeroRps == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Informe NumeroNfse ou NumeroRps"})
		return
	}

	ctx := c.Request.Context()
	var nfse interface{}
	var err error

	if numeroNfse != "" {
		nfse, err = h.nfseService.ConsultarPorNumero(ctx, numeroNfse)
	} else {
		nfse, err = h.nfseService.ConsultarPorRPS(ctx, numeroRps)
	}

	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, nfse)
}

// ConsultarXMLNFSe consulta XMLs de NFS-e em massa
func (h *NFSeHandler) ConsultarXMLNFSe(c *gin.Context) {
	// Por intervalo de números
	nrInicial := c.Query("nr_inicial")
	nrFinal := c.Query("nr_final")

	// Por intervalo de datas
	dtInicial := c.Query("dt_inicial")
	dtFinal := c.Query("dt_final")
	nrPage := c.Query("nr_page")

	// Por competência
	nrCompetencia := c.Query("nr_competencia")

	ctx := c.Request.Context()
	var result interface{}
	var err error

	if nrInicial != "" && nrFinal != "" {
		// Consulta por intervalo de números
		result, err = h.nfseService.ConsultarXMLPorIntervalo(ctx, nrInicial, nrFinal)
	} else if dtInicial != "" && dtFinal != "" {
		// Consulta por intervalo de datas
		page := 1
		if nrPage != "" {
			if p, parseErr := strconv.Atoi(nrPage); parseErr == nil {
				page = p
			}
		}
		result, err = h.nfseService.ConsultarXMLPorData(ctx, dtInicial, dtFinal, page)
	} else if nrCompetencia != "" {
		// Consulta por competência
		result, err = h.nfseService.ConsultarXMLPorCompetencia(ctx, nrCompetencia)
	} else {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Informe os parâmetros de consulta válidos"})
		return
	}

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, result)
}

// UltimoRPSEnviado recupera o número do último RPS enviado
func (h *NFSeHandler) UltimoRPSEnviado(c *gin.Context) {
	ctx := c.Request.Context()
	ultimoRps, err := h.nfseService.UltimoRPSEnviado(ctx)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"ultimo_rps": ultimoRps})
}

// TestarAPIExterna testa a conexão direta com a API da prefeitura
func (h *NFSeHandler) TestarAPIExterna(c *gin.Context) {
	competencia := c.DefaultQuery("competencia", "202408")

	ctx := c.Request.Context()

	// Usar o cliente diretamente para testar
	client, exists := h.nfseService.GetClient("2105302") // Código IBGE de Imperatriz
	if !exists {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Cliente não encontrado"})
		return
	}

	// Fazer requisição de teste
	req := documents.ConsultarXMLRequest{
		NrCompetencia: competencia,
	}

	nfseList, err := client.ConsultarXMLDocuments(ctx, req)
	if err != nil {
		c.JSON(http.StatusBadGateway, gin.H{
			"error":       "Erro na API externa",
			"details":     err.Error(),
			"competencia": competencia,
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success":           true,
		"competencia":       competencia,
		"total_encontradas": len(nfseList),
		"primeira_nfse": func() interface{} {
			if len(nfseList) > 0 {
				return map[string]interface{}{
					"numero":        nfseList[0].NumeroNfse,
					"data_emissao":  nfseList[0].DataEmissao,
					"valor_servico": nfseList[0].ValorServico,
				}
			}
			return nil
		}(),
	})
}

// SincronizarManual executa sincronização manual das NFS-e
func (h *NFSeHandler) SincronizarManual(c *gin.Context) {
	competencia := c.DefaultQuery("competencia", "202408")

	ctx := c.Request.Context()

	// Executar sincronização
	err := h.nfseService.SincronizarNFSe(ctx, competencia)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":       "Erro na sincronização",
			"details":     err.Error(),
			"competencia": competencia,
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success":     true,
		"message":     "Sincronização executada com sucesso",
		"competencia": competencia,
	})
}

// AnalisarXMLMetadados analisa os metadados de um XML de NFS-e
func (h *NFSeHandler) AnalisarXMLMetadados(c *gin.Context) {
	numeroNfse := c.Param("numero")
	if numeroNfse == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Número da NFS-e é obrigatório"})
		return
	}

	ctx := c.Request.Context()

	// Primeiro buscar a NFS-e no banco para obter a competência
	nfse, err := h.nfseService.ConsultarPorNumero(ctx, numeroNfse)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "NFS-e não encontrada: " + err.Error()})
		return
	}

	// Buscar o XML do MinIO
	xmlContent, err := h.nfseService.GetXMLContent(ctx, numeroNfse, nfse.Competencia)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "XML não encontrado: " + err.Error()})
		return
	}

	// Analisar metadados do XML
	metadata, err := utils.ParseNFSeXML(xmlContent)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao analisar XML: " + err.Error()})
		return
	}

	// Converter para JSON para resposta
	metadataJSON, err := json.Marshal(metadata)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao converter metadados: " + err.Error()})
		return
	}

	var metadataMap map[string]interface{}
	json.Unmarshal(metadataJSON, &metadataMap)

	c.JSON(http.StatusOK, gin.H{
		"numero_nfse": numeroNfse,
		"metadados":   metadataMap,
		"xml_size":    len(xmlContent),
	})
}
