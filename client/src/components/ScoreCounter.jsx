// src/components/ScoreCounter.jsx
import { useGame } from '../context/GameContext';

export default function ScoreCounter() {
  const { score, scorePopups } = useGame();

  return (
    <div className="text-right relative">
      <div className="text-[10px] font-mono text-slate-500 tracking-widest">SCORE</div>
      <div
        className="font-mono font-black text-yellow-400 text-glow-cyan tabular-nums"
        style={{ fontSize: 'clamp(1.1rem, 2vw, 1.5rem)' }}
      >
        {score.toLocaleString()}
      </div>

      {/* Floating score indicator popups */}
      {scorePopups.map((p) => (
        <div
          key={p.id}
          className={`absolute -top-3 right-0 font-mono text-xs font-black pointer-events-none animate-slide-up ${
            p.type === 'pos' ? 'text-green-400 text-glow-green' : 'text-red-400 text-glow-red'
          }`}
        >
          {p.text}
        </div>
      ))}
    </div>
  );
}
