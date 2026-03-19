const HANDS = {
  rock:     { emoji: '✊', label: 'グー' },
  scissors: { emoji: '✌️', label: 'チョキ' },
  paper:    { emoji: '🖐️', label: 'パー' }
};

// rock beats scissors, scissors beats paper, paper beats rock
const WINS_AGAINST = {
  rock: 'scissors',
  scissors: 'paper',
  paper: 'rock'
};

let scores = { player: 0, cpu: 0, draw: 0 };

function getRandomHand() {
  const keys = Object.keys(HANDS);
  return keys[Math.floor(Math.random() * keys.length)];
}

function judge(player, cpu) {
  if (player === cpu) return 'draw';
  if (WINS_AGAINST[player] === cpu) return 'win';
  return 'lose';
}

function play(playerChoice) {
  const cpuChoice = getRandomHand();
  const outcome = judge(playerChoice, cpuChoice);

  document.getElementById('player-hand').textContent = HANDS[playerChoice].emoji;
  document.getElementById('cpu-hand').textContent = HANDS[cpuChoice].emoji;

  const resultEl = document.getElementById('result');
  resultEl.className = 'result ' + outcome;

  if (outcome === 'win') {
    scores.player++;
    resultEl.textContent = `あなたの勝ち！ 🎉 ${HANDS[playerChoice].label} が ${HANDS[cpuChoice].label} に勝ちました`;
  } else if (outcome === 'lose') {
    scores.cpu++;
    resultEl.textContent = `あなたの負け… 😢 ${HANDS[cpuChoice].label} が ${HANDS[playerChoice].label} に勝ちました`;
  } else {
    scores.draw++;
    resultEl.textContent = `引き分け！ 🤝 お互い ${HANDS[playerChoice].label}`;
  }

  document.getElementById('player-score').textContent = scores.player;
  document.getElementById('cpu-score').textContent = scores.cpu;
  document.getElementById('draw-score').textContent = scores.draw;
}

function resetScore() {
  scores = { player: 0, cpu: 0, draw: 0 };
  document.getElementById('player-score').textContent = 0;
  document.getElementById('cpu-score').textContent = 0;
  document.getElementById('draw-score').textContent = 0;
  document.getElementById('player-hand').textContent = '❓';
  document.getElementById('cpu-hand').textContent = '❓';
  const resultEl = document.getElementById('result');
  resultEl.className = 'result';
  resultEl.textContent = '手を選んでください';
}
