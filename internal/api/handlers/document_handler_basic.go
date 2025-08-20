package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

// DocumentHandler handler básico para documentos (compatibilidade)
type DocumentHandler struct{}

// NewDocumentHandler cria uma nova instância do handler de documentos
func NewDocumentHandler() *DocumentHandler {
	return &DocumentHandler{}
}

// ListarDocumentos lista documentos (placeholder)
func (h *DocumentHandler) ListarDocumentos(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"message": "Endpoint em desenvolvimento",
		"data":    []interface{}{},
	})
}

// ConsultarDocumento consulta um documento (placeholder)
func (h *DocumentHandler) ConsultarDocumento(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"message": "Endpoint em desenvolvimento",
	})
}

// CriarDocumento cria um documento (placeholder)
func (h *DocumentHandler) CriarDocumento(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"message": "Endpoint em desenvolvimento",
	})
}

// AtualizarDocumento atualiza um documento (placeholder)
func (h *DocumentHandler) AtualizarDocumento(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"message": "Endpoint em desenvolvimento",
	})
}

// ExcluirDocumento exclui um documento (placeholder)
func (h *DocumentHandler) ExcluirDocumento(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"message": "Endpoint em desenvolvimento",
	})
}

// DadosGrafico retorna dados para gráfico (placeholder)
func (h *DocumentHandler) DadosGrafico(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"message": "Endpoint em desenvolvimento",
	})
}

// DocumentosRecentes retorna documentos recentes (placeholder)
func (h *DocumentHandler) DocumentosRecentes(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"message": "Endpoint em desenvolvimento",
	})
}

// DadosReceita retorna dados de receita (placeholder)
func (h *DocumentHandler) DadosReceita(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"message": "Endpoint em desenvolvimento",
	})
}

// DadosCrescimento retorna dados de crescimento (placeholder)
func (h *DocumentHandler) DadosCrescimento(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"message": "Endpoint em desenvolvimento",
	})
}

// MetricasISS retorna métricas de ISS (placeholder)
func (h *DocumentHandler) MetricasISS(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"message": "Endpoint em desenvolvimento",
	})
}
