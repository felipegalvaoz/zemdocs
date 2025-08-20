package middleware

import (
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
)

// Auth middleware para validar o token de autorização
func Auth() gin.HandlerFunc {
	return gin.HandlerFunc(func(c *gin.Context) {
		// Token esperado (mesmo do arquivo api.md)
		expectedToken := "5a9bf05cc4321b58dd5966c1cffc67c11ed3fa66ca893d5925d70155e75e87f7"

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
