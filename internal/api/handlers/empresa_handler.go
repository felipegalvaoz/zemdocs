package handlers

import (
	"net/http"
	"strconv"

	"zemdocs/internal/database/model"
	"zemdocs/internal/service"

	"github.com/gin-gonic/gin"
)

// EmpresaHandler handler para operações de empresas
type EmpresaHandler struct {
	empresaService *service.EmpresaService
}

// NewEmpresaHandler cria uma nova instância do handler de empresas
func NewEmpresaHandler(empresaService *service.EmpresaService) *EmpresaHandler {
	return &EmpresaHandler{
		empresaService: empresaService,
	}
}

// ConsultarCNPJAPI consulta dados de CNPJ na API CNPJA
func (h *EmpresaHandler) ConsultarCNPJAPI(c *gin.Context) {
	cnpj := c.Param("cnpj")

	if cnpj == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "CNPJ é obrigatório"})
		return
	}

	// Consultar na API
	cnpjaResp, err := h.empresaService.ConsultarCNPJAPI(c.Request.Context(), cnpj)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, cnpjaResp)
}

// CriarEmpresaPorCNPJ cria uma empresa consultando dados na API CNPJA
func (h *EmpresaHandler) CriarEmpresaPorCNPJ(c *gin.Context) {
	cnpj := c.Param("cnpj")

	if cnpj == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "CNPJ é obrigatório"})
		return
	}

	// Criar empresa
	empresa, err := h.empresaService.CriarEmpresaPorCNPJ(c.Request.Context(), cnpj)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, empresa)
}

// ListarEmpresas lista todas as empresas com paginação
func (h *EmpresaHandler) ListarEmpresas(c *gin.Context) {
	// Parâmetros de paginação
	limitStr := c.DefaultQuery("limit", "20")
	offsetStr := c.DefaultQuery("offset", "0")
	search := c.Query("search")

	limit, err := strconv.Atoi(limitStr)
	if err != nil || limit <= 0 {
		limit = 20
	}

	offset, err := strconv.Atoi(offsetStr)
	if err != nil || offset < 0 {
		offset = 0
	}

	var empresas []*model.EmpresaResponse

	if search != "" {
		empresas, err = h.empresaService.BuscarEmpresas(c.Request.Context(), search, limit, offset)
	} else {
		empresas, err = h.empresaService.ListarEmpresas(c.Request.Context(), limit, offset)
	}

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao listar empresas"})
		return
	}

	response := gin.H{
		"empresas": empresas,
		"limit":    limit,
		"offset":   offset,
		"total":    len(empresas),
	}

	c.JSON(http.StatusOK, response)
}

// CriarEmpresa cria uma empresa com dados fornecidos
func (h *EmpresaHandler) CriarEmpresa(c *gin.Context) {
	var req model.EmpresaCreateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Dados inválidos"})
		return
	}

	// Criar empresa
	empresa, err := h.empresaService.CriarEmpresa(c.Request.Context(), &req)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, empresa)
}

// ConsultarEmpresaPorID consulta uma empresa por ID
func (h *EmpresaHandler) ConsultarEmpresaPorID(c *gin.Context) {
	idStr := c.Param("id")

	id, err := strconv.Atoi(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID inválido"})
		return
	}

	empresa, err := h.empresaService.ConsultarPorID(c.Request.Context(), id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Empresa não encontrada"})
		return
	}

	c.JSON(http.StatusOK, empresa)
}

// ConsultarEmpresaPorCNPJ consulta uma empresa por CNPJ
func (h *EmpresaHandler) ConsultarEmpresaPorCNPJ(c *gin.Context) {
	cnpj := c.Param("cnpj")

	if cnpj == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "CNPJ é obrigatório"})
		return
	}

	empresa, err := h.empresaService.ConsultarPorCNPJ(c.Request.Context(), cnpj)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Empresa não encontrada"})
		return
	}

	c.JSON(http.StatusOK, empresa)
}

// AtualizarEmpresa atualiza uma empresa
func (h *EmpresaHandler) AtualizarEmpresa(c *gin.Context) {
	idStr := c.Param("id")

	id, err := strconv.Atoi(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID inválido"})
		return
	}

	var req model.EmpresaUpdateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Dados inválidos"})
		return
	}

	empresa, err := h.empresaService.AtualizarEmpresa(c.Request.Context(), id, &req)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, empresa)
}

// ExcluirEmpresa exclui uma empresa
func (h *EmpresaHandler) ExcluirEmpresa(c *gin.Context) {
	idStr := c.Param("id")

	id, err := strconv.Atoi(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID inválido"})
		return
	}

	if err := h.empresaService.ExcluirEmpresa(c.Request.Context(), id); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Empresa excluída com sucesso",
	})
}
