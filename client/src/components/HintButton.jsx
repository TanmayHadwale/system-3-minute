// src/components/HintButton.jsx
import { useState, useEffect } from 'react';
import { useGame } from '../context/GameContext';

export default function HintButton({ moduleName }) {
  const {
    status,
    timeLeft,
    score,
    getHintCost,
    getNextHintLevel,
    requestHint,
    hintCooldownUntil,
    activeHint,
  } = useGame();

  const [cooldownRemaining, setCooldownRemaining] = useState(0);
  const [assistNotice, setAssistNotice] = useState(null);

  const cost = getHintCost(moduleName);
  const nextLevel = getNextHintLevel(moduleName);
  const hasEnoughScore = score >= cost;
  const isGameOver = status !== 'playing' || timeLeft <= 0;

  // Track cooldown countdown
  useEffect(() => {
    const interval = setInterval(() => {
      const remaining = Math.max(0, Math.ceil((hintCooldownUntil - Date.now()) / 1000));
      setCooldownRemaining(remaining);
    }, 200);
    return () => clearInterval(interval);
  }, [hintCooldownUntil]);

  // Show short assist toast when hint activates
  useEffect(() => {
    if (activeHint && activeHint.module === moduleName) {
      const levelLabels = {
        1: 'VISUAL NUDGE',
        2: 'PARTIAL CLUE',
        3: 'STRONG GUIDANCE',
      };
      setAssistNotice(`SYSTEM ASSIST: ${levelLabels[activeHint.level] || 'ACTIVE'}`);
      const t = setTimeout(() => setAssistNotice(null), 3500);
      return () => clearTimeout(t);
    }
  }, [activeHint, moduleName]);

  const handleClick = () => {
    if (isGameOver || cooldownRemaining > 0 || !hasEnoughScore) return;
    const res = requestHint(moduleName);
    if (!res.success && res.reason === 'NO_SCORE') {
      setAssistNotice('INSUFFICIENT SCORE');
      setTimeout(() => setAssistNotice(null), 1500);
    }
  };

  const buttonLabel = isGameOver
    ? '? HINT'
    : cooldownRemaining > 0
    ? `HINT ACTIVE (${cooldownRemaining}s)`
    : !hasEnoughScore
    ? `NO SCORE (${cost})`
    : `? HINT -${cost}`;

  return (
    <div className="relative inline-flex items-center">
      <button
        onClick={handleClick}
        disabled={isGameOver || cooldownRemaining > 0 || !hasEnoughScore}
        className={`text-xs font-mono font-bold tracking-wider px-3 py-1 rounded-lg border transition-all cursor-pointer select-none active:scale-95 ${
          cooldownRemaining > 0
            ? 'border-cyan-500/40 bg-cyan-950/40 text-cyan-300 opacity-80 cursor-wait'
            : !hasEnoughScore
            ? 'border-slate-800 bg-slate-900/60 text-slate-500 cursor-not-allowed opacity-50'
            : isGameOver
            ? 'border-slate-800 bg-slate-900/40 text-slate-600 cursor-not-allowed'
            : 'border-yellow-500/50 bg-yellow-950/30 text-yellow-300 hover:border-yellow-400 hover:bg-yellow-900/40 hover:scale-105 shadow-[0_0_12px_rgba(234,179,8,0.3)]'
        }`}
        title={`Request Level ${nextLevel} System Assist (-${cost} pts)`}
      >
        <span>{buttonLabel}</span>
      </button>

      {/* Assist notice banner */}
      {assistNotice && (
        <div className="absolute -top-7 right-0 whitespace-nowrap bg-yellow-500 text-black font-mono text-[9px] font-black px-2 py-0.5 rounded shadow-[0_0_12px_rgba(234,179,8,0.8)] animate-slide-up pointer-events-none z-30">
          {assistNotice}
        </div>
      )}
    </div>
  );
}
