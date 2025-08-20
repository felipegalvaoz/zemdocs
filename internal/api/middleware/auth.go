package middleware

import (
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
)

// Auth middleware para validar o token de autorização
func Auth() gin.HandlerFunc {
	return gin.HandlerFunc(func(c *gin.Context) {
		// Token de produção
		expectedToken := "69415f14b56ccabe8cc5ec8cf5d5a2d2dc2ac66f0bb9859484dd5f8ce7ae2d2a"

		// Obter token do header Authorization
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Token de autorização requerido"})
			c.Abort()
			return
		}

		// Remover prefixo "Bearer " se presente
		token := strings.TrimPrefix(authHeader, "Bearer ")
		token = strings.TrimSpace(token)

		// Validar token
		if token != expectedToken {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Token de autorização inválido"})
			c.Abort()
			return
		}

		c.Next()
	})
}
