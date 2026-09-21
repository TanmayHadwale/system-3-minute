// client/src/components/puzzles/FileHuntPuzzle.jsx
import { useState } from 'react';
import { useGame } from '../../context/GameContext';
import HintButton from '../HintButton';

export default function FileHuntPuzzle() {
  const { chain, completeModule, solvedModules, triggerGlitch, playSound, status, activeHint } = useGame();
  const puzzle = chain?.modules?.files;
  const isRestored = solvedModules?.files;

  const [inspectingFile, setInspectingFile] = useState(null);
  const [decoyAlert, setDecoyAlert] = useState(null);

  if (!puzzle) return null;

  const hintForFiles = activeHint?.module === 'files' ? activeHint.level : 0;

  const handleFileClick = (file) => {
    if (status !== 'playing' || isRestored) return;
    playSound('click');

    if (file.isDecoy) {
      if (file.isGlitch) {
        triggerGlitch();
      }
      setDecoyAlert({
        name: file.name,
        note: file.note,
        isGlitch: !!file.isGlitch,
      });
      setTimeout(() => setDecoyAlert(null), 1800);
    } else if (file.isTarget) {
      setInspectingFile(file);
      setTimeout(() => {
        completeModule('files');
      }, 1200);
    }
  };

  return (
    <div className="h-full flex flex-col justify-between select-none relative animate-fade-in">
      {/* Action Header */}
      <div className="flex items-center justify-between border-b border-cyan-500/20 pb-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">📁</span>
          <div>
            <h2 className="font-mono text-base font-black tracking-widest text-cyan-300">
              FILE EXPLORER
            </h2>
            <div className="text-[10px] font-mono text-slate-500">
              SECTOR 07 / REPOSITORY ROOT
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {!isRestored && <HintButton moduleName="files" />}
          <span className={`badge ${isRestored ? 'badge-restored' : 'badge-active'}`}>
            {isRestored ? 'RECOVERED ✓' : 'SEARCHING'}
          </span>
        </div>
      </div>

      {/* Main File Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 my-auto py-4">
        {puzzle.files.map((f) => {
          const isTargetAndSolved = f.isTarget && isRestored;
          const isTarget = f.isTarget;

          // Progressive visual hint highlights
          const isL1Hint = hintForFiles >= 1 && isTarget && !isRestored;
          const isL2Hint = hintForFiles >= 2 && isTarget && !isRestored;
          const isL3Hint = hintForFiles >= 3 && isTarget && !isRestored;

          return (
            <button
              key={f.id}
              onClick={() => handleFileClick(f)}
              disabled={isRestored}
              className={`glass-panel p-4 rounded-lg flex flex-col items-center justify-center text-center transition-all duration-200 cursor-pointer group relative overflow-hidden ${
                isTargetAndSolved
                  ? 'border-green-500 bg-green-500/10 shadow-[0_0_20px_rgba(34,197,94,0.3)]'
                  : isL3Hint
                  ? 'border-green-400 bg-green-500/20 shadow-[0_0_25px_rgba(34,197,94,0.7)] scale-105'
                  : isL2Hint
                  ? 'border-yellow-400 bg-yellow-500/15 shadow-[0_0_20px_rgba(234,179,8,0.6)] scale-[1.03]'
                  : isL1Hint
                  ? 'border-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.6)] animate-pulse'
                  : 'hover:border-cyan-400 hover:bg-cyan-500/10 hover:scale-[1.03] active:scale-95'
              }`}
            >
              {/* Level 3 Pointer Arrow */}
              {isL3Hint && (
                <div className="absolute top-1 left-1/2 -translate-x-1/2 font-mono text-[9px] font-black text-green-400 animate-bounce tracking-widest bg-black/70 px-1.5 rounded">
                  ⬇ TARGET
                </div>
              )}

              {/* Level 2 Sub-badge */}
              {isL2Hint && !isL3Hint && (
                <div className="absolute top-1 right-1 font-mono text-[8px] font-black text-yellow-300 bg-yellow-950/80 border border-yellow-500/50 px-1 rounded">
                  SYS CHIP
                </div>
              )}

              <div className="text-3xl mb-2 transition-transform group-hover:scale-110">
                {isTargetAndSolved ? '💾' : f.isGlitch ? '⚠️' : '📄'}
              </div>
              <div className="font-mono text-xs font-bold text-slate-200 tracking-wider group-hover:text-cyan-300">
                {f.name}
              </div>
              <div className="text-[9px] font-mono text-slate-500 mt-1">
                {isTargetAndSolved ? 'RECOVERED' : 'CLICK TO INSPECT'}
              </div>

              {isTargetAndSolved && (
                <div className="absolute top-1 right-2 text-green-400 font-mono text-xs font-bold">
                  ✓
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Decoy Alert Overlay */}
      {decoyAlert && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30">
          <div className="glass neon-border border-red-500/60 bg-red-950/70 p-4 rounded-lg text-center animate-shake">
            <div className="text-red-400 font-mono text-xs font-bold tracking-widest mb-1">
              {decoyAlert.isGlitch ? '⚠️ GLITCH DETECTED — DECOY FILE' : '⚠️ EMPTY SECTOR'}
            </div>
            <div className="text-slate-300 font-mono text-xs">
              {decoyAlert.note}
            </div>
          </div>
        </div>
      )}

      {/* Clue Discovery Notification / Modal */}
      {inspectingFile && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-30 animate-fade-in">
          <div className="glass neon-border-green p-6 rounded-xl text-center max-w-sm w-full mx-4 animate-scale-in">
            <div className="text-4xl mb-3 animate-bounce">⚡</div>
            <div className="font-mono text-green-400 font-bold text-sm tracking-widest mb-1">
              KEY FRAGMENT EXTRACTED
            </div>
            <div className="text-xs font-mono text-slate-300 mb-4">
              Found in <span className="text-cyan-300 font-bold">{inspectingFile.name}</span>
            </div>

            <div className="bg-cyan-950/40 border border-cyan-400/40 rounded-lg p-3 mb-4">
              <div className="text-[10px] font-mono text-slate-400 mb-1">RECOVERED TOKEN</div>
              <div className="text-xl font-mono font-black text-cyan-300 tracking-wider">
                {inspectingFile.clue.value}
              </div>
            </div>

            <div className="text-green-400 font-mono text-xs font-bold tracking-widest animate-pulse">
              ADDED TO CLUES +100
            </div>
          </div>
        </div>
      )}

      {/* Footer State */}
      <div className="border-t border-cyan-500/20 pt-2 flex items-center justify-between text-xs font-mono text-slate-500">
        <div>STATUS: {isRestored ? 'SECTOR RECOVERED' : 'AWAITING DISCOVERY'}</div>
        <div className="text-cyan-400">{isRestored ? '✓ MODULE RESTORED' : 'TAP FILES TO SCAN'}</div>
      </div>
    </div>
  );
}
