package api

import (
	"net/http"
	"path/filepath"

	"github.com/NoF0rte/gocdp"
	"github.com/gin-gonic/gin"
)

// APIHandler handles HTTP requests for the API
type APIHandler struct {
}

func (h *APIHandler) Parse(c *gin.Context) {
	form, err := c.MultipartForm()
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var allResults gocdp.CDResults
	var errs []error
	for _, fileHeaders := range form.File {
		for _, header := range fileHeaders {
			file, err := header.Open()
			if err != nil {
				errs = append(errs, err)
				continue
			}

			results, err := gocdp.SmartParse(file)
			if err != nil {
				errs = append(errs, err)
				continue
			}

			allResults = append(allResults, results...)
		}
	}

	c.JSON(http.StatusOK, gin.H{"results": allResults, "errors": errs})
}

func (h *APIHandler) ParsePath(c *gin.Context) {
	var req struct {
		Path string `json:"path"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	files, err := filepath.Glob(req.Path)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	results, err := gocdp.SmartParseFiles(files)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"results": results})
}
