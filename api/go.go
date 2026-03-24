package handler

import (
	"net/http"

	"rps/internal/rps"
)

// Handler is the Vercel serverless function entry point.
func Handler(w http.ResponseWriter, r *http.Request) {
	rps.HandleGame(w, r, "/go/style.css", true)
}
