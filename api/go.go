package handler

import (
	"log"
	"net/http"

	"rps/pkg/rps"
)

// Handler is the Vercel serverless function entry point.
func Handler(w http.ResponseWriter, r *http.Request) {
	log.Printf("go: %s %s", r.Method, r.URL.String())
	rps.HandleGame(w, r, "/style.css", true)
}
