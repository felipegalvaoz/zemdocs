package middleware

import (
	"time"

	"zemdocs/internal/logger"

	"github.com/gin-gonic/gin"
)

// Logging middleware para log de requisições HTTP
func Logging() gin.HandlerFunc {
	return gin.LoggerWithFormatter(func(param gin.LogFormatterParams) string {
		// Log usando zerolog
		logger.HTTP().Info().
			Str("method", param.Method).
			Str("path", param.Path).
			Str("protocol", param.Request.Proto).
			Int("status_code", param.StatusCode).
			Dur("latency", param.Latency).
			Str("client_ip", param.ClientIP).
			Str("user_agent", param.Request.UserAgent()).
			Int("body_size", param.BodySize).
			Msg("HTTP Request")

		// Retornar string vazia para não duplicar logs
		return ""
	})
}

// RequestLogger middleware mais detalhado para logging de requisições
func RequestLogger() gin.HandlerFunc {
	return func(c *gin.Context) {
		start := time.Now()
		path := c.Request.URL.Path
		raw := c.Request.URL.RawQuery

		// Processar requisição
		c.Next()

		// Calcular latência
		latency := time.Since(start)

		// Obter informações da requisição
		clientIP := c.ClientIP()
		method := c.Request.Method
		statusCode := c.Writer.Status()

		if raw != "" {
			path = path + "?" + raw
		}

		// Log baseado no status code
		logEvent := logger.HTTP().Info()
		if statusCode >= 400 && statusCode < 500 {
			logEvent = logger.HTTP().Warn()
		} else if statusCode >= 500 {
			logEvent = logger.HTTP().Error()
		}

		logEvent.
			Str("method", method).
			Str("path", path).
			Int("status", statusCode).
			Dur("dur", latency).
			Str("ip", clientIP).
			Msg("HTTP")
	}
}

// ErrorLogger middleware para capturar e logar erros
func ErrorLogger() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Next()

		// Verificar se houve erros
		if len(c.Errors) > 0 {
			for _, err := range c.Errors {
				logEvent := logger.HTTP().Error().
					Err(err.Err).
					Str("path", c.Request.URL.Path).
					Str("method", c.Request.Method)

				// Adicionar meta se existir
				if err.Meta != nil {
					logEvent = logEvent.Interface("meta", err.Meta)
				}

				logEvent.Msg("Request error")
			}
		}
	}
}
