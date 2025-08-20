package handler

import (
	"net/http"
	"strconv"

	"zemdocs/internal/service"

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
