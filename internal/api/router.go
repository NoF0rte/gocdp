package api

import (
	"github.com/gin-gonic/gin"
)

// SetupRoutes configures all API routes
func SetupRoutes(r *gin.Engine) {
	// Create API handler
	handler := &APIHandler{}

	// API routes
	api := r.Group("/api")
	{
		api.POST("/parse/files", handler.Parse)
		api.POST("/parse/path", handler.ParsePath)
	}
}
