'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

const CHOICES = {
  rock:     { emoji: '✊', label: 'Rock' },
  paper:    { emoji: '🖐️', label: 'Paper' },
  scissors: { emoji: '✌️', label: 'Scissors' },
};

const BEATS = {
  rock:     'scissors',
  scissors: 'paper',
  paper:    'rock',
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

async function saveSession(session) {
  const cookieStore = await cookies();
  const value = Buffer.from(JSON.stringify(session)).toString('base64');
  cookieStore.set('rps_session', value, { path: '/', httpOnly: true, sameSite: 'lax' });
}

export async function play(formData) {
  const choice = formData.get('choice');
  console.log(`nextjs: play ${choice}`);
  if (!choice || !Object.prototype.hasOwnProperty.call(CHOICES, choice)) {
    redirect('/');
  }

  const session = await getSession();
  const playerChoice = choice;
  const keys = Object.keys(CHOICES);
  const computerChoice = keys[Math.floor(Math.random() * keys.length)];

  let result;
  if (playerChoice === computerChoice) {
    result = 'draw';
    session.draws++;
  } else if (BEATS[playerChoice] === computerChoice) {
    result = 'win';
    session.wins++;
  } else {
    result = 'lose';
    session.losses++;
  }

  await saveSession(session);
  redirect(`/?player=${playerChoice}&computer=${computerChoice}&result=${result}`);
}

export async function reset() {
  console.log('nextjs: reset');
  await saveSession({ wins: 0, draws: 0, losses: 0 });
  redirect('/');
}
