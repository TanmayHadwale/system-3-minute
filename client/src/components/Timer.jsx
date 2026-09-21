// src/components/Timer.jsx
import { useGame } from '../context/GameContext';

function formatTime(secs) {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export default function Timer() {
  const { timeLeft, status } = useGame();

  const isWarning  = timeLeft <= 60;
  const isCritical = timeLeft <= 20;
  const isDead     = timeLeft <= 0 || status === 'game_over';

  return (
    <div className={`font-mono font-black tabular-nums transition-all duration-300 ${
      isDead
        ? 'text-red-600 text-glow-red'
        : isCritical
          ? 'text-red-500 text-glow-red animate-pulse-red'
          : isWarning
            ? 'text-orange-400'
            : 'text-white'
    }`}
    style={{ fontSize: 'clamp(1.6rem, 3vw, 2.5rem)' }}
    >
      {isDead ? '00:00' : formatTime(timeLeft)}
    </div>
  );
}
