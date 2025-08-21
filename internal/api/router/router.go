package router

import (
	"zemdocs/internal/api/handlers"
	"zemdocs/internal/api/middleware"

	"github.com/gin-gonic/gin"
)

// SetupRouter configura as rotas da API
func SetupRouter(documentHandler *handlers.DocumentHandler, empresaHandler *handlers.EmpresaHandler) *gin.Engine {
	// Configurar modo do Gin
	gin.SetMode(gin.ReleaseMode)

	router := gin.New()

	// Middlewares globais
	router.Use(middleware.RequestLogger())
	router.Use(middleware.ErrorLogger())
	router.Use(gin.Recovery())
	router.Use(middleware.CORS())

	// Rota de health check (sem autenticação)
	router.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"status":  "ok",
			"message": "API NFS-e Imperatriz-MA está funcionando",
		})
	})

	// Grupo de rotas da API (com autenticação)
	api := router.Group("/api/v1")
	api.Use(middleware.Auth())
	{
		// Rotas de documentos (antigo NFS-e)
		documents := api.Group("/documents")
		{
			documents.GET("/", documentHandler.ListarDocumentos)
			documents.GET("/:id", documentHandler.ConsultarDocumento)
			documents.POST("/", documentHandler.CriarDocumento)
			documents.PUT("/:id", documentHandler.AtualizarDocumento)
			documents.DELETE("/:id", documentHandler.ExcluirDocumento)
			documents.GET("/chart-data", documentHandler.DadosGrafico)
			documents.GET("/recent", documentHandler.DocumentosRecentes)
			documents.GET("/revenue", documentHandler.DadosReceita)
			documents.GET("/growth", documentHandler.DadosCrescimento)
			documents.GET("/iss-metrics", documentHandler.MetricasISS)
		}

		// Rotas de empresas
		empresas := api.Group("/empresas")
		{
			empresas.GET("/", empresaHandler.ListarEmpresas)
			empresas.GET("/stats", empresaHandler.EstatisticasEmpresas)
			empresas.GET("/:id", empresaHandler.ConsultarEmpresaPorID)
			empresas.GET("/cnpj/:cnpj", empresaHandler.ConsultarEmpresaPorCNPJ)
			empresas.POST("/", empresaHandler.CriarEmpresa)
			empresas.PUT("/:id", empresaHandler.AtualizarEmpresa)
			empresas.DELETE("/:id", empresaHandler.ExcluirEmpresa)
			empresas.GET("/consultar-cnpj/:cnpj", empresaHandler.ConsultarCNPJAPI)
			empresas.POST("/criar-por-cnpj/:cnpj", empresaHandler.CriarEmpresaPorCNPJ)
		}

		// Manter compatibilidade com rotas antigas de NFS-e
		nfse := api.Group("/nfse")
		{
			nfse.GET("/consultar", documentHandler.ConsultarDocumento)
			nfse.GET("/recent", documentHandler.DocumentosRecentes)
		}
	}

	return router
}
