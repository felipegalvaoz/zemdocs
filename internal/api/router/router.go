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

	// Grupo de rotas da API (sem autenticação para desenvolvimento)
	api := router.Group("/api/v1")
	// api.Use(middleware.Auth()) // Comentado para desenvolvimento
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
			// CRUD básico de empresas
			empresas.GET("/", empresaHandler.ListarEmpresas)           // Listar todas as empresas
			empresas.GET("/:id", empresaHandler.ConsultarEmpresaPorID) // Buscar empresa por ID
			empresas.POST("/", empresaHandler.CriarEmpresaCompleta)    // Criar empresa com dados completos
			empresas.PUT("/:id", empresaHandler.AtualizarEmpresa)      // Atualizar empresa existente
			empresas.DELETE("/:id", empresaHandler.ExcluirEmpresa)     // Excluir empresa

			// Consultas especializadas
			empresas.GET("/cnpj/:cnpj", empresaHandler.ConsultarEmpresaPorCNPJ) // Buscar empresa por CNPJ (banco local)
			empresas.GET("/stats", empresaHandler.EstatisticasEmpresas)         // Estatísticas das empresas

			// Integração com API externa CNPJ
			empresas.GET("/cnpj-api/:cnpj", empresaHandler.ConsultarCNPJAPI)     // Consultar CNPJ na API externa
			empresas.POST("/cnpj-api/:cnpj", empresaHandler.CriarEmpresaPorCNPJ) // Criar empresa direto da API CNPJ
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
