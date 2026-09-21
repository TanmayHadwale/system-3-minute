// src/components/puzzles/DatabasePuzzle.jsx
import { useState } from 'react';
import { useGame } from '../../context/GameContext';
import HintButton from '../HintButton';

export default function DatabasePuzzle() {
  const { chain, solveModule, solvedModules, status, clues } = useGame();
  const puzzle = chain?.modules?.database;
  const [answer, setAnswer]       = useState('');
  const [feedback, setFeedback]   = useState(null); // {success, text}
  const [inputClass, setInputClass] = useState('');
  const [shaking, setShaking]     = useState(false);

  if (!puzzle) return null;
  const isRestored = solvedModules.database;

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (!answer.trim() || status !== 'playing' || isRestored) return;

    const result = solveModule('database', answer);
    setFeedback({ success: result.success, text: result.feedback });

    if (result.success) {
      setInputClass('success');
    } else {
      setInputClass('error');
      setShaking(true);
      setTimeout(() => { setShaking(false); setInputClass(''); }, 400);
      setTimeout(() => setFeedback(null), 2500);
    }
  };

  return (
    <div className="animate-fade-in h-full flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="font-mono font-bold text-white text-base tracking-widest">DATABASE</h2>
        <span className={`badge ${isRestored ? 'badge-restored' : 'badge-warning'}`}>
          {isRestored ? '✓ RESTORED' : 'WARNING'}
        </span>
      </div>

      {/* Objective */}
      <div className="text-xs font-mono text-slate-400 border-l-2 border-yellow-600 pl-3 py-1">
        {puzzle.objective}
      </div>

      {isRestored ? (
        <div className="glass-panel rounded-lg p-6 neon-border-green animate-scale-in flex flex-col gap-3">
          <div className="font-mono text-green-400 font-bold text-lg text-glow-green">✓ DATABASE RESTORED</div>
          {puzzle.clueReward && (
            <div className="bg-cyan-900/20 border border-cyan-500/30 rounded p-3">
              <div className="text-[10px] font-mono text-slate-500 mb-1">NEW CLUE UNLOCKED</div>
              <div className="font-mono text-cyan-300 font-bold">{puzzle.clueReward.label}: {puzzle.clueReward.value}</div>
            </div>
          )}
          <div className="text-xs font-mono text-slate-400">Proceed to the FRONTEND module.</div>
        </div>
      ) : (
        <>
          {/* Clue reminder */}
          {clues.length > 0 && (
            <div className="glass-panel rounded p-3 flex gap-3 items-start">
              <span className="text-cyan-400 text-sm">📋</span>
              <div>
                <div className="text-[10px] font-mono text-slate-500 mb-1">CLUE INVENTORY</div>
                {clues.map(c => (
                  <div key={c.key} className="font-mono text-xs text-cyan-300">
                    {c.label}: <span className="font-bold text-white">{c.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Puzzle form */}
          <div className="glass-panel rounded-lg p-5 flex flex-col gap-4 flex-1">
            <div>
              <div className="font-mono text-sm text-red-400 font-bold mb-1">
                ⚠ {puzzle.prompt}
              </div>
              <div className="text-xs font-mono text-slate-400">{puzzle.description}</div>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <input
                type="text"
                value={answer}
                onChange={e => setAnswer(e.target.value)}
                className={`puzzle-input ${inputClass} ${shaking ? 'animate-shake' : ''}`}
                placeholder={puzzle.placeholder}
                autoFocus
                autoComplete="off"
                spellCheck={false}
                disabled={status !== 'playing'}
              />

              <div className="flex items-center gap-3">
                <button type="submit" className="btn-primary flex-1 py-2.5 text-sm"
                  disabled={status !== 'playing'}>
                  SUBMIT
                </button>
                <HintButton moduleName="database" />
              </div>

              {feedback && (
                <div className={`p-3 rounded font-mono text-xs font-bold ${
                  feedback.success
                    ? 'bg-green-900/30 text-green-400 border border-green-500/30 animate-scale-in'
                    : 'bg-red-900/20 text-red-400 border border-red-500/20'
                }`}>
                  {feedback.success ? '✓' : '✗'} {feedback.text}
                </div>
              )}
            </form>
          </div>
        </>
      )}
    </div>
  );
}
