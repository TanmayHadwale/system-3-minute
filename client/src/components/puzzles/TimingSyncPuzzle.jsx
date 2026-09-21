// client/src/components/puzzles/TimingSyncPuzzle.jsx
import { useState, useEffect, useRef } from 'react';
import { useGame } from '../../context/GameContext';
import HintButton from '../HintButton';

export default function TimingSyncPuzzle() {
  const { chain, completeModule, solvedModules, playSound, deductScore, status, activeHint } = useGame();
  const puzzle = chain?.modules?.sync;
  const isRestored = solvedModules?.sync;

  const [position, setPosition] = useState(0);
  const [direction, setDirection] = useState(1);
  const [successfulHits, setSuccessfulHits] = useState(0);
  const [flashSuccess, setFlashSuccess] = useState(false);
  const [flashMiss, setFlashMiss] = useState(false);

  const baseMin = puzzle?.targetZone?.min || 40;
  const baseMax = puzzle?.targetZone?.max || 65;
  const requiredHits = puzzle?.requiredHits || 2;

  const hintForSync = activeHint?.module === 'sync' ? activeHint.level : 0;

  // Level 2 Hint expands target zone
  const targetMin = hintForSync >= 2 ? Math.max(20, baseMin - 10) : baseMin;
  const targetMax = hintForSync >= 2 ? Math.min(85, baseMax + 10) : baseMax;

  // Level 3 Hint slows speed by 50%
  const speed = hintForSync >= 3 ? 0.45 : 0.9;

  const animationFrameRef = useRef(null);

  // Animate oscillating indicator
  useEffect(() => {
    if (isRestored || status !== 'playing') return;

    let pos = 0;
    let dir = 1;

    const loop = () => {
      pos += dir * speed;
      if (pos >= 100) {
        pos = 100;
        dir = -1;
      } else if (pos <= 0) {
        pos = 0;
        dir = 1;
      }
      setPosition(pos);
      setDirection(dir);
      animationFrameRef.current = requestAnimationFrame(loop);
    };

    animationFrameRef.current = requestAnimationFrame(loop);
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [isRestored, status, speed]);

  const handleSyncTap = () => {
    if (status !== 'playing' || isRestored) return;

    if (position >= targetMin && position <= targetMax) {
      playSound('laser');
      setFlashSuccess(true);
      setTimeout(() => setFlashSuccess(false), 400);

      const nextHits = successfulHits + 1;
      setSuccessfulHits(nextHits);

      if (nextHits >= requiredHits) {
        playSound('correct');
        setTimeout(() => {
          completeModule('sync');
        }, 600);
      }
    } else {
      playSound('incorrect');
      setFlashMiss(true);
      deductScore(10);
      setTimeout(() => setFlashMiss(false), 400);
    }
  };

  // Keyboard Space trigger
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === 'Space') {
        e.preventDefault();
        handleSyncTap();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  if (!puzzle) return null;

  return (
    <div className="h-full flex flex-col justify-between select-none relative animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-cyan-500/20 pb-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">⏱️</span>
          <div>
            <h2 className="font-mono text-base font-black tracking-widest text-cyan-300">
              HARMONIC FREQUENCY SYNC
            </h2>
            <div className="text-[10px] font-mono text-slate-500">
              TAP SYNC WHEN SIGNAL ENTERS GREEN ZONE
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {!isRestored && <HintButton moduleName="sync" />}
          <span className={`badge ${isRestored ? 'badge-restored' : 'badge-active'}`}>
            {isRestored ? 'LOCKED ✓' : `LOCKS: ${successfulHits}/${requiredHits}`}
          </span>
        </div>
      </div>

      {/* Main Timing Arena */}
      <div className="flex flex-col items-center justify-center my-auto py-4 w-full max-w-lg mx-auto">
        {/* Oscilloscope Track */}
        <div className="w-full glass rounded-xl p-6 border border-cyan-500/30 relative">
          <div className="text-[10px] font-mono text-slate-500 mb-4 flex justify-between items-center">
            <span>FREQUENCY OSCILLOSCOPE</span>
            <span className={hintForSync >= 2 ? 'text-yellow-400 font-bold' : ''}>
              TARGET: {targetMin}% - {targetMax}% {hintForSync >= 2 ? '(EXPANDED)' : ''}
            </span>
          </div>

          {/* Slider track */}
          <div className="h-12 bg-slate-950 rounded-lg relative overflow-hidden border border-slate-700">
            {/* Target Window */}
            <div
              className={`absolute top-0 bottom-0 bg-green-500/20 border-x-2 border-green-400 flex items-center justify-center font-mono text-[9px] font-black text-green-300 tracking-widest transition-all ${
                hintForSync >= 1 ? 'shadow-[0_0_20px_rgba(34,197,94,0.6)] bg-green-500/30' : ''
              } ${flashSuccess ? 'bg-green-400/50 shadow-[0_0_25px_rgba(34,197,94,0.9)]' : ''}`}
              style={{
                left: `${targetMin}%`,
                width: `${targetMax - targetMin}%`,
              }}
            >
              SYNC ZONE
            </div>

            {/* Moving Laser Indicator */}
            <div
              className={`absolute top-0 bottom-0 w-2.5 -translate-x-1/2 transition-colors rounded-sm shadow-[0_0_15px_rgba(6,182,212,1)] ${
                flashMiss
                  ? 'bg-red-500 shadow-[0_0_15px_rgba(239,68,68,1)]'
                  : flashSuccess
                  ? 'bg-green-400 shadow-[0_0_15px_rgba(34,197,94,1)]'
                  : 'bg-cyan-300'
              }`}
              style={{ left: `${position}%` }}
            />
          </div>

          {/* Hits Counter */}
          <div className="flex justify-center gap-3 mt-4">
            {Array.from({ length: requiredHits }).map((_, i) => (
              <div
                key={i}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full font-mono text-xs border ${
                  i < successfulHits
                    ? 'border-green-400 bg-green-500/20 text-green-300 font-bold'
                    : 'border-slate-800 bg-slate-900/60 text-slate-500'
                }`}
              >
                <span>{i < successfulHits ? '✓' : '○'}</span>
                <span>SYNC {i + 1}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Big Action Sync Button */}
        {!isRestored && (
          <button
            onClick={handleSyncTap}
            className="mt-6 px-10 py-4 btn-primary text-base font-black tracking-widest animate-pulse-glow cursor-pointer active:scale-95 shadow-[0_0_25px_rgba(6,182,212,0.6)]"
          >
            ⚡ [ SYNC NOW ] (OR SPACE)
          </button>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-cyan-500/20 pt-2 flex items-center justify-between text-xs font-mono text-slate-500">
        <div>STATUS: {isRestored ? 'HARMONIC LOCK ACHIEVED' : 'TIMING SEQUENCE ACTIVE'}</div>
        <div className="text-cyan-400">{isRestored ? '✓ POWER SURGE TRANSFERRED' : 'TAP SYNC BUTTON'}</div>
      </div>
    </div>
  );
}
