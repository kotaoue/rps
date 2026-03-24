package rps

import (
	"encoding/base64"
	"encoding/json"
	"fmt"
	"html"
	"math/rand"
	"net/http"
	"strings"
)

// Session holds the player's score across requests.
type Session struct {
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

// DecodeSession parses a base64-encoded JSON session cookie value.
func DecodeSession(val string) Session {
	s := Session{}
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

// EncodeSession serialises a Session to a base64-encoded JSON string.
func EncodeSession(s Session) string {
	data, _ := json.Marshal(s)
	return base64.StdEncoding.EncodeToString(data)
}

// RenderPage renders the full HTML page for the given game state.
// cssPath is the URL of the stylesheet to link (e.g. "/style.css" or "/go/style.css").
func RenderPage(s Session, playerChoice, computerChoice, result, cssPath string) string {
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

// HandleGame processes a single HTTP request for the RPS game.
// cssPath is the stylesheet URL; secureCookie should be true when serving over HTTPS.
func HandleGame(w http.ResponseWriter, r *http.Request, cssPath string, secureCookie bool) {
	var s Session
	if c, err := r.Cookie("rps_session"); err == nil {
		s = DecodeSession(c.Value)
	}

	var playerChoice, computerChoice, result string

	if r.Method == http.MethodPost {
		if err := r.ParseForm(); err == nil {
			if r.FormValue("reset") != "" {
				s = Session{}
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
		Value:    EncodeSession(s),
		Path:     "/",
		HttpOnly: true,
		Secure:   secureCookie,
		SameSite: http.SameSiteLaxMode,
	})
	w.Header().Set("Content-Type", "text/html; charset=utf-8")
	fmt.Fprint(w, RenderPage(s, playerChoice, computerChoice, result, cssPath))
}
