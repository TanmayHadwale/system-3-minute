// src/components/puzzles/LogsPuzzle.jsx
import { useState } from 'react';
import { useGame } from '../../context/GameContext';
import HintButton from '../HintButton';

export default function LogsPuzzle() {
  const { chain, extractLogClue, solvedModules, status } = useGame();
  const puzzle = chain?.modules?.logs;
  const [extracted, setExtracted] = useState(false);
  const [showFlash, setShowFlash] = useState(false);

  if (!puzzle) return null;

  const isRestored = solvedModules.logs;

  const handleExtract = () => {
    if (isRestored || extracted || status !== 'playing') return;
    const ok = extractLogClue('logs');
    if (ok) {
      setExtracted(true);
      setShowFlash(true);
      setTimeout(() => setShowFlash(false), 3000);
    }
  };

  return (
    <div className="animate-fade-in h-full flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="font-mono font-bold text-white text-base tracking-widest">
          SYSTEM LOGS
        </h2>
        <span className={`badge ${isRestored ? 'badge-restored' : 'badge-active'}`}>
          {isRestored ? '✓ INVESTIGATED' : 'ACTIVE'}
        </span>
      </div>

      {/* Objective */}
      <div className="text-xs font-mono text-slate-400 border-l-2 border-cyan-700 pl-3 py-1">
        {puzzle.objective}
      </div>

      {/* Log file */}
      <div className="glass-panel rounded-lg p-4 flex-1 overflow-y-auto">
        <div className="text-[10px] font-mono text-slate-600 mb-3 tracking-widest">
          ── SYSTEM.LOG ──────────────────────────
        </div>
        <div className="space-y-1">
          {puzzle.logs.map((entry, i) => (
            <div
              key={i}
              className={`log-entry ${entry.highlight ? 'highlighted' : ''}`}
            >
              <span className="log-time">[{entry.time}]</span>
              <span className={`log-text ${entry.highlight ? 'highlight-text' : ''}`}>
                {entry.text}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Extract button */}
      {!isRestored && (
        <div className="flex items-center justify-between gap-4">
          <button
            onClick={handleExtract}
            disabled={extracted || status !== 'playing'}
            className={`flex-1 btn-primary py-2.5 text-sm ${
              extracted ? 'opacity-50 cursor-not-allowed' : 'animate-pulse-glow'
            }`}
          >
            {extracted ? '✓ CLUE EXTRACTED' : '⬇ EXTRACT CLUE FROM LOG'}
          </button>
          <HintButton moduleName="logs" />
        </div>
      )}

      {/* Flash notification */}
      {showFlash && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 glass neon-border rounded-full px-6 py-3 animate-slide-down">
          <span className="font-mono text-sm text-cyan-300 font-bold">
            🔎 CLUE EXTRACTED: {puzzle.clueToExtract?.value}
          </span>
        </div>
      )}

      {/* Restored state */}
      {isRestored && (
        <div className="glass-panel rounded-lg p-4 neon-border-green animate-fade-in">
          <div className="font-mono text-green-400 text-sm font-bold text-glow-green">
            ✓ MODULE INVESTIGATED — Clue secured in inventory.
          </div>
          <div className="text-xs font-mono text-slate-400 mt-1">
            Proceed to the DATABASE module.
          </div>
        </div>
      )}
    </div>
  );
}
