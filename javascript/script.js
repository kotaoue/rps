console.log('javascript: ' + location.href);

const CHOICES = {
  rock: { emoji: '✊', label: 'Rock' },
  scissors: { emoji: '✌️', label: 'Scissors' },
  paper: { emoji: '🖐️', label: 'Paper' },
};

const BEATS = {
  rock: 'scissors',
  scissors: 'paper',
  paper: 'rock',
};

let wins = 0, draws = 0, losses = 0;

function getComputerChoice() {
  const options = ['rock', 'scissors', 'paper'];
  return options[Math.floor(Math.random() * options.length)];
}

function getResult(player, computer) {
  if (player === computer) return 'draw';
  if (BEATS[player] === computer) return 'win';
  return 'lose';
}

function play(playerChoice) {
  const computerChoice = getComputerChoice();
  const result = getResult(playerChoice, computerChoice);

  if (result === 'win') wins++;
  else if (result === 'draw') draws++;
  else losses++;

  updateScore();
  updateBattleArea(playerChoice, computerChoice, result);
}

function updateScore() {
  document.getElementById('win-count').textContent = wins;
  document.getElementById('draw-count').textContent = draws;
  document.getElementById('lose-count').textContent = losses;
}

function updateBattleArea(player, computer, result) {
  const resultMessages = {
    win: '🎉 You Win!',
    draw: '🤝 Draw!',
    lose: '😢 You Lose!',
  };

  const area = document.getElementById('battle-area');
  area.innerHTML = `
    <div class="battle-hands">
      <span title="${CHOICES[player].label}">${CHOICES[player].emoji}</span>
      <span class="battle-vs">VS</span>
      <span title="${CHOICES[computer].label}">${CHOICES[computer].emoji}</span>
    </div>
    <div class="result-text ${result}">${resultMessages[result]}</div>
  `;
}

function resetScore() {
  wins = 0; draws = 0; losses = 0;
  updateScore();
  document.getElementById('battle-area').innerHTML = '<p class="waiting-text">Choose your move!</p>';
}
