package middleware

import (
	"github.com/gin-gonic/gin"
)

// CORS middleware para permitir requisições do frontend Next.js
func CORS() gin.HandlerFunc {
	return gin.HandlerFunc(func(c *gin.Context) {
		origin := c.Request.Header.Get("Origin")
		
		// Lista de origens permitidas (incluindo localhost para desenvolvimento)
		allowedOrigins := []string{
			"http://localhost:3000",
			"http://localhost:3001",
			"https://your-nextjs-app.vercel.app", // Substitua pela URL do seu app em produção
		}

		// Verificar se a origem está na lista permitida
		isAllowed := false
		for _, allowedOrigin := range allowedOrigins {
			if origin == allowedOrigin {
				isAllowed = true
				break
			}
		}

		if isAllowed {
			c.Header("Access-Control-Allow-Origin", origin)
		}

		c.Header("Access-Control-Allow-Credentials", "true")
		c.Header("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, accept, origin, Cache-Control, X-Requested-With")
		c.Header("Access-Control-Allow-Methods", "POST, OPTIONS, GET, PUT, DELETE")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}

		c.Next()
	})
}
