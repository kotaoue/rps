<?php
session_start();

if (!isset($_SESSION['wins']))   $_SESSION['wins']   = 0;
if (!isset($_SESSION['draws']))  $_SESSION['draws']  = 0;
if (!isset($_SESSION['losses'])) $_SESSION['losses'] = 0;

$choices = [
    'rock'     => ['emoji' => '✊', 'label' => 'Rock'],
    'paper'    => ['emoji' => '🖐️', 'label' => 'Paper'],
    'scissors' => ['emoji' => '✌️', 'label' => 'Scissors'],
];

$beats = [
    'rock'     => 'scissors',
    'scissors' => 'paper',
    'paper'    => 'rock',
];

$playerChoice   = null;
$computerChoice = null;
$result         = null;

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (isset($_POST['reset'])) {
        $_SESSION['wins']   = 0;
        $_SESSION['draws']  = 0;
        $_SESSION['losses'] = 0;
    } elseif (isset($_POST['choice']) && array_key_exists($_POST['choice'], $choices)) {
        $playerChoice   = $_POST['choice'];
        $keys           = array_keys($choices);
        $computerChoice = $keys[array_rand($keys)];

        if ($playerChoice === $computerChoice) {
            $result = 'draw';
            $_SESSION['draws']++;
        } elseif ($beats[$playerChoice] === $computerChoice) {
            $result = 'win';
            $_SESSION['wins']++;
        } else {
            $result = 'lose';
            $_SESSION['losses']++;
        }
    }
}

$resultMessages = [
    'win'  => '🎉 You Win!',
    'draw' => '🤝 Draw!',
    'lose' => '😢 You Lose!',
];
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Rock Paper Scissors</title>
  <link rel="stylesheet" href="style.css" />
</head>
<body>
  <div class="container">
    <h1>✊ Rock Paper Scissors</h1>

    <div class="score-board">
      <div class="score-item">
        <div class="score-label">Win</div>
        <div class="score-value win"><?= htmlspecialchars($_SESSION['wins']) ?></div>
      </div>
      <div class="score-item">
        <div class="score-label">Draw</div>
        <div class="score-value draw"><?= htmlspecialchars($_SESSION['draws']) ?></div>
      </div>
      <div class="score-item">
        <div class="score-label">Lose</div>
        <div class="score-value lose"><?= htmlspecialchars($_SESSION['losses']) ?></div>
      </div>
    </div>

    <form method="post" class="choices">
      <?php foreach ($choices as $key => $choice): ?>
      <button class="choice-btn" type="submit" name="choice" value="<?= htmlspecialchars($key) ?>" aria-label="<?= htmlspecialchars($choice['label']) ?>">
        <?= $choice['emoji'] ?>
        <span class="label"><?= htmlspecialchars($choice['label']) ?></span>
      </button>
      <?php endforeach; ?>
    </form>

    <div class="battle-area">
      <?php if ($playerChoice !== null): ?>
      <div class="battle-hands">
        <span title="<?= htmlspecialchars($choices[$playerChoice]['label']) ?>"><?= $choices[$playerChoice]['emoji'] ?></span>
        <span class="battle-vs">VS</span>
        <span title="<?= htmlspecialchars($choices[$computerChoice]['label']) ?>"><?= $choices[$computerChoice]['emoji'] ?></span>
      </div>
      <div class="result-text <?= htmlspecialchars($result) ?>"><?= htmlspecialchars($resultMessages[$result]) ?></div>
      <?php else: ?>
      <p class="waiting-text">Choose your move!</p>
      <?php endif; ?>
    </div>

    <form method="post">
      <button class="reset-btn" type="submit" name="reset" value="1">Reset Score</button>
    </form>
  </div>
</body>
</html>
