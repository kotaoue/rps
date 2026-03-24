package main

import (
	"encoding/base64"
	"encoding/json"
	"fmt"
	"html"
	"log"
	"math/rand"
	"net/http"
	"os"
	"path/filepath"
	"strings"
)

type session struct {
	Wins   int `json:"wins"`
	Draws  int `json:"draws"`
	Losses int `json:"losses"`
}

type choiceInfo struct {
	Emoji string
	Label string
}

var choiceKeys = []string{"rock", "paper", "scissors"}

var choiceMap = map[string]choiceInfo{
	"rock":     {"✊", "Rock"},
	"paper":    {"🖐️", "Paper"},
	"scissors": {"✌️", "Scissors"},
}

var beats = map[string]string{
	"rock":     "scissors",
	"scissors": "paper",
	"paper":    "rock",
}

var resultMessages = map[string]string{
	"win":  "🎉 You Win!",
	"draw": "🤝 Draw!",
	"lose": "😢 You Lose!",
}

func decodeSession(val string) session {
	s := session{}
	data, err := base64.StdEncoding.DecodeString(val)
	if err != nil {
		return s
	}
	if err := json.Unmarshal(data, &s); err != nil {
		return s
	}
	if s.Wins < 0 {
		s.Wins = 0
	}
	if s.Draws < 0 {
		s.Draws = 0
	}
	if s.Losses < 0 {
		s.Losses = 0
	}
	return s
}

func encodeSession(s session) string {
	data, _ := json.Marshal(s)
	return base64.StdEncoding.EncodeToString(data)
}

func renderPage(s session, playerChoice, computerChoice, result, cssPath string) string {
	var battleAreaContent string
	if playerChoice != "" {
		pc := choiceMap[playerChoice]
		cc := choiceMap[computerChoice]
		battleAreaContent = fmt.Sprintf(
			`<div class="battle-hands">
        <span title="%s">%s</span>
        <span class="battle-vs">VS</span>
        <span title="%s">%s</span>
      </div>
      <div class="result-text %s">%s</div>`,
			html.EscapeString(pc.Label), pc.Emoji,
			html.EscapeString(cc.Label), cc.Emoji,
			html.EscapeString(result), html.EscapeString(resultMessages[result]),
		)
	} else {
		battleAreaContent = `<p class="waiting-text">Choose your move!</p>`
	}

	var btnBuf strings.Builder
	for _, key := range choiceKeys {
		c := choiceMap[key]
		fmt.Fprintf(&btnBuf,
			"<button class=\"choice-btn\" type=\"submit\" name=\"choice\" value=\"%s\" aria-label=\"%s\">\n        %s\n        <span class=\"label\">%s</span>\n      </button>",
			html.EscapeString(key), html.EscapeString(c.Label),
			c.Emoji, html.EscapeString(c.Label),
		)
		if key != choiceKeys[len(choiceKeys)-1] {
			btnBuf.WriteString("\n      ")
		}
	}

	return fmt.Sprintf(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Rock Paper Scissors</title>
  <link rel="stylesheet" href="%s" />
</head>
<body>
  <div class="container">
    <h1>✊ Rock Paper Scissors</h1>

    <div class="score-board">
      <div class="score-item">
        <div class="score-label">Win</div>
        <div class="score-value win">%d</div>
      </div>
      <div class="score-item">
        <div class="score-label">Draw</div>
        <div class="score-value draw">%d</div>
      </div>
      <div class="score-item">
        <div class="score-label">Lose</div>
        <div class="score-value lose">%d</div>
      </div>
    </div>

    <form method="post" class="choices">
      %s
    </form>

    <div class="battle-area">
      %s
    </div>

    <form method="post">
      <button class="reset-btn" type="submit" name="reset" value="1">Reset Score</button>
    </form>
  </div>
</body>
</html>`, cssPath, s.Wins, s.Draws, s.Losses, btnBuf.String(), battleAreaContent)
}

func gameHandler(cssPath string) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var s session
		if c, err := r.Cookie("rps_session"); err == nil {
			s = decodeSession(c.Value)
		}

		var playerChoice, computerChoice, result string

		if r.Method == http.MethodPost {
			if err := r.ParseForm(); err == nil {
				if r.FormValue("reset") != "" {
					s = session{}
				} else if choice := r.FormValue("choice"); choice != "" {
					if _, ok := choiceMap[choice]; ok {
						playerChoice = choice
						computerChoice = choiceKeys[rand.Intn(len(choiceKeys))]
						if playerChoice == computerChoice {
							result = "draw"
							s.Draws++
						} else if beats[playerChoice] == computerChoice {
							result = "win"
							s.Wins++
						} else {
							result = "lose"
							s.Losses++
						}
					}
				}
			}
		}

		http.SetCookie(w, &http.Cookie{
			Name:     "rps_session",
			Value:    encodeSession(s),
			Path:     "/",
			HttpOnly: true,
			SameSite: http.SameSiteLaxMode,
		})
		w.Header().Set("Content-Type", "text/html; charset=utf-8")
		fmt.Fprint(w, renderPage(s, playerChoice, computerChoice, result, cssPath))
	}
}

func main() {
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	http.HandleFunc("/style.css", func(w http.ResponseWriter, r *http.Request) {
		http.ServeFile(w, r, filepath.Join(".", "style.css"))
	})

	http.HandleFunc("/", gameHandler("/style.css"))

	log.Printf("Go RPS server running on http://localhost:%s", port)
	log.Fatal(http.ListenAndServe(":"+port, nil))
}
