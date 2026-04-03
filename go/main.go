package main

import (
	"log"
	"net/http"
	"os"
	"path/filepath"

	"rps/pkg/rps"
)

func main() {
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	http.HandleFunc("/style.css", func(w http.ResponseWriter, r *http.Request) {
		http.ServeFile(w, r, filepath.Join(".", "style.css"))
	})

	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		log.Printf("go: %s %s", r.Method, r.URL.String())
		rps.HandleGame(w, r, "/style.css", false)
	})

	log.Printf("Go RPS server running on http://localhost:%s", port)
	log.Fatal(http.ListenAndServe(":"+port, nil))
}

