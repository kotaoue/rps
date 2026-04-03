import { cookies } from 'next/headers';
import { play, reset } from './actions';

const CHOICES = {
  rock:     { emoji: '✊', label: 'Rock' },
  paper:    { emoji: '🖐️', label: 'Paper' },
  scissors: { emoji: '✌️', label: 'Scissors' },
};

const RESULT_MESSAGES = {
  win:  '🎉 You Win!',
  draw: '🤝 Draw!',
  lose: '😢 You Lose!',
};

async function getSession() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('rps_session');
  try {
    if (sessionCookie) {
      const parsed = JSON.parse(Buffer.from(sessionCookie.value, 'base64').toString('utf8'));
      return {
        wins:   Math.max(0, parseInt(parsed.wins,   10) || 0),
        draws:  Math.max(0, parseInt(parsed.draws,  10) || 0),
        losses: Math.max(0, parseInt(parsed.losses, 10) || 0),
      };
    }
  } catch {}
  return { wins: 0, draws: 0, losses: 0 };
}

export default async function Home({ searchParams }) {
  console.log('nextjs: GET /nextjs');
  const session = await getSession();
  const params = await searchParams;
  const { player, computer, result } = params;

  const validResult =
    result && ['win', 'draw', 'lose'].includes(result) &&
    player && Object.prototype.hasOwnProperty.call(CHOICES, player) &&
    computer && Object.prototype.hasOwnProperty.call(CHOICES, computer);

  return (
    <div className="container">
      <h1>✊ Rock Paper Scissors</h1>

      <div className="score-board">
        <div className="score-item">
          <div className="score-label">Win</div>
          <div className="score-value win">{session.wins}</div>
        </div>
        <div className="score-item">
          <div className="score-label">Draw</div>
          <div className="score-value draw">{session.draws}</div>
        </div>
        <div className="score-item">
          <div className="score-label">Lose</div>
          <div className="score-value lose">{session.losses}</div>
        </div>
      </div>

      <form action={play} className="choices">
        {Object.entries(CHOICES).map(([key, choice]) => (
          <button key={key} type="submit" name="choice" value={key} className="choice-btn" aria-label={choice.label}>
            {choice.emoji}
            <span className="label">{choice.label}</span>
          </button>
        ))}
      </form>

      <div className="battle-area">
        {validResult ? (
          <>
            <div className="battle-hands">
              <span title={CHOICES[player].label}>{CHOICES[player].emoji}</span>
              <span className="battle-vs">VS</span>
              <span title={CHOICES[computer].label}>{CHOICES[computer].emoji}</span>
            </div>
            <div className={`result-text ${result}`}>{RESULT_MESSAGES[result]}</div>
          </>
        ) : (
          <p className="waiting-text">Choose your move!</p>
        )}
      </div>

      <form action={reset}>
        <button type="submit" className="reset-btn">Reset Score</button>
      </form>
    </div>
  );
}
