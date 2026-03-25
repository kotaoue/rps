'use strict';

const choices = {
  rock:     { emoji: '✊', label: 'Rock' },
  paper:    { emoji: '🖐️', label: 'Paper' },
  scissors: { emoji: '✌️', label: 'Scissors' },
};

const beats = {
  rock:     'scissors',
  scissors: 'paper',
  paper:    'rock',
};

const resultMessages = {
  win:  '🎉 You Win!',
  draw: '🤝 Draw!',
  lose: '😢 You Lose!',
};

function htmlspecialchars(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function parseCookies(cookieHeader) {
  const cookies = {};
  if (!cookieHeader) return cookies;
  cookieHeader.split(';').forEach(cookie => {
    const idx = cookie.indexOf('=');
    if (idx < 0) return;
    const name = cookie.slice(0, idx).trim();
    const val  = cookie.slice(idx + 1).trim();
    try { cookies[name] = decodeURIComponent(val); } catch { cookies[name] = val; }
  });
  return cookies;
}

module.exports = async (req, res) => {
  const cookies = parseCookies(req.headers.cookie);
  let session = { wins: 0, draws: 0, losses: 0 };

  try {
    if (cookies.rps_session) {
      const parsed = JSON.parse(Buffer.from(cookies.rps_session, 'base64').toString('utf8'));
      session = {
        wins:   Math.max(0, parseInt(parsed.wins,   10) || 0),
        draws:  Math.max(0, parseInt(parsed.draws,  10) || 0),
        losses: Math.max(0, parseInt(parsed.losses, 10) || 0),
      };
    }
  } catch {
    session = { wins: 0, draws: 0, losses: 0 };
  }

  let playerChoice   = null;
  let computerChoice = null;
  let result         = null;

  if (req.method === 'POST') {
    const body = await new Promise((resolve) => {
      let data = '';
      req.on('data', chunk => { data += chunk; });
      req.on('end', () => resolve(data));
    });

    const params = new URLSearchParams(body);

    if (params.has('reset')) {
      session = { wins: 0, draws: 0, losses: 0 };
    } else if (params.has('choice') && Object.prototype.hasOwnProperty.call(choices, params.get('choice'))) {
      playerChoice   = params.get('choice');
      const keys     = Object.keys(choices);
      computerChoice = keys[Math.floor(Math.random() * keys.length)];

      if (playerChoice === computerChoice) {
        result = 'draw';
        session.draws++;
      } else if (beats[playerChoice] === computerChoice) {
        result = 'win';
        session.wins++;
      } else {
        result = 'lose';
        session.losses++;
      }
    }
  }

  const sessionCookie = Buffer.from(JSON.stringify(session)).toString('base64');
  res.setHeader('Set-Cookie', `rps_session=${sessionCookie}; Path=/; HttpOnly; SameSite=Lax`);
  res.setHeader('Content-Type', 'text/html; charset=utf-8');

  const battleAreaContent = playerChoice
    ? `<div class="battle-hands">
        <span title="${htmlspecialchars(choices[playerChoice].label)}">${choices[playerChoice].emoji}</span>
        <span class="battle-vs">VS</span>
        <span title="${htmlspecialchars(choices[computerChoice].label)}">${choices[computerChoice].emoji}</span>
      </div>
      <div class="result-text ${htmlspecialchars(result)}">${htmlspecialchars(resultMessages[result])}</div>`
    : `<p class="waiting-text">Choose your move!</p>`;

  const choiceButtons = Object.entries(choices).map(([key, choice]) =>
    `<button class="choice-btn" type="submit" name="choice" value="${htmlspecialchars(key)}" aria-label="${htmlspecialchars(choice.label)}">
        ${choice.emoji}
        <span class="label">${htmlspecialchars(choice.label)}</span>
      </button>`
  ).join('\n      ');

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Rock Paper Scissors</title>
  <link rel="stylesheet" href="/style.css" />
</head>
<body>
  <div class="container">
    <h1>✊ Rock Paper Scissors</h1>

    <div class="score-board">
      <div class="score-item">
        <div class="score-label">Win</div>
        <div class="score-value win">${htmlspecialchars(session.wins)}</div>
      </div>
      <div class="score-item">
        <div class="score-label">Draw</div>
        <div class="score-value draw">${htmlspecialchars(session.draws)}</div>
      </div>
      <div class="score-item">
        <div class="score-label">Lose</div>
        <div class="score-value lose">${htmlspecialchars(session.losses)}</div>
      </div>
    </div>

    <form method="post" class="choices">
      ${choiceButtons}
    </form>

    <div class="battle-area">
      ${battleAreaContent}
    </div>

    <form method="post">
      <button class="reset-btn" type="submit" name="reset" value="1">Reset Score</button>
    </form>
  </div>
</body>
</html>`;

  res.status(200).send(html);
};
