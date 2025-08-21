package middleware

import (
	"github.com/gin-gonic/gin"
)

// CORS middleware para permitir requisições do frontend Next.js
func CORS() gin.HandlerFunc {
	return gin.HandlerFunc(func(c *gin.Context) {
		// Para desenvolvimento, permitir todas as origens
		c.Header("Access-Control-Allow-Origin", "*")
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
