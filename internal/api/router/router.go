package router

import (
	"zemdocs/internal/api/middleware"
	"zemdocs/internal/handler"

	"github.com/gin-gonic/gin"
)

// SetupRouter configura as rotas da API
func SetupRouter(nfseHandler *handler.NFSeHandler) *gin.Engine {
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
		// Rotas de consulta NFS-e
		nfse := api.Group("/nfse")
		{
			nfse.GET("/consultar", nfseHandler.ConsultarNFSe)
			nfse.GET("/xmlnfse", nfseHandler.ConsultarXMLNFSe)
			nfse.GET("/ultimorpsenviado", nfseHandler.UltimoRPSEnviado)
			nfse.GET("/testar-api", nfseHandler.TestarAPIExterna)
			nfse.POST("/sincronizar", nfseHandler.SincronizarManual)
		}
	}

	return router
}
