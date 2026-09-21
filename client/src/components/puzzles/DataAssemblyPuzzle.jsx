// client/src/components/puzzles/DataAssemblyPuzzle.jsx
import { useState } from 'react';
import { useGame } from '../../context/GameContext';
import HintButton from '../HintButton';

export default function DataAssemblyPuzzle() {
  const { chain, completeModule, solvedModules, playSound, deductScore, status, activeHint } = useGame();
  const puzzle = chain?.modules?.assembly;
  const isRestored = solvedModules?.assembly;

  const [slotted, setSlotted] = useState([null, null, null]);
  const [errorShake, setErrorShake] = useState(false);

  const solution = puzzle?.solution || ['CORE', 'NODE', '07'];
  const fragments = puzzle?.fragments || [];

  const hintForAssembly = activeHint?.module === 'assembly' ? activeHint.level : 0;

  const handleChipClick = (chip) => {
    if (status !== 'playing' || isRestored) return;

    const existingIdx = slotted.findIndex((s) => s?.id === chip.id);
    if (existingIdx !== -1) {
      playSound('click');
      const next = [...slotted];
      next[existingIdx] = null;
      setSlotted(next);
      return;
    }

    const emptyIdx = slotted.findIndex((s) => s === null);
    if (emptyIdx === -1) return;

    playSound('slot');
    const next = [...slotted];
    next[emptyIdx] = chip;
    setSlotted(next);

    if (next.every((s) => s !== null)) {
      const match = next.every((s, i) => s.label === solution[i]);
      if (match) {
        playSound('correct');
        setTimeout(() => {
          completeModule('assembly');
        }, 700);
      } else {
        playSound('incorrect');
        setErrorShake(true);
        deductScore(5);
        setTimeout(() => setErrorShake(false), 600);
      }
    }
  };

  const handleSlotClick = (idx) => {
    if (status !== 'playing' || isRestored) return;
    if (slotted[idx]) {
      playSound('click');
      const next = [...slotted];
      next[idx] = null;
      setSlotted(next);
    }
  };

  if (!puzzle) return null;

  return (
    <div className="h-full flex flex-col justify-between select-none relative animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-cyan-500/20 pb-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">🧩</span>
          <div>
            <h2 className="font-mono text-base font-black tracking-widest text-cyan-300">
              DATA CHIP ASSEMBLY
            </h2>
            <div className="text-[10px] font-mono text-slate-500">
              SOCKET CHIPS IN ARCHITECTURE SEQUENCE
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {!isRestored && <HintButton moduleName="assembly" />}
          <span className={`badge ${isRestored ? 'badge-restored' : 'badge-active'}`}>
            {isRestored ? 'DATA ASSEMBLED ✓' : 'SLOT CHIPS'}
          </span>
        </div>
      </div>

      {/* Main Assembly Arena */}
      <div className="flex flex-col items-center justify-center my-auto py-2">
        {/* Motherboard Sockets */}
        <div className="text-[10px] font-mono text-slate-400 mb-2 tracking-widest">
          MAINFRAME OVERRIDE SOCKETS
        </div>
        <div className={`flex items-center gap-3 p-4 glass rounded-2xl border border-cyan-500/30 ${errorShake ? 'animate-shake' : ''}`}>
          {slotted.map((chip, idx) => (
            <button
              key={idx}
              onClick={() => handleSlotClick(idx)}
              disabled={isRestored}
              className={`w-20 h-24 rounded-xl border-2 border-dashed flex flex-col items-center justify-center transition-all cursor-pointer relative overflow-hidden ${
                chip
                  ? 'border-cyan-400 bg-cyan-950/60 shadow-[0_0_15px_rgba(6,182,212,0.4)]'
                  : 'border-slate-700 bg-slate-900/40 hover:border-cyan-500/40'
              } ${isRestored ? 'border-green-400 bg-green-950/40' : ''}`}
            >
              {chip ? (
                <>
                  <span className="text-2xl mb-1">{chip.icon}</span>
                  <span className="font-mono text-xs font-black text-cyan-300 tracking-wider">
                    {chip.label}
                  </span>
                  {!isRestored && (
                    <span className="text-[8px] font-mono text-slate-500 absolute bottom-1">
                      TAP TO EJECT
                    </span>
                  )}
                </>
              ) : (
                <span className="font-mono text-[10px] text-slate-600 font-bold">
                  SLOT {idx + 1}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Available Scattered Chips */}
        <div className="mt-6 w-full max-w-md">
          <div className="text-[10px] font-mono text-slate-500 mb-2 text-center tracking-widest">
            AVAILABLE DATA FRAGMENTS (TAP TO INSERT)
          </div>
          <div className="flex flex-wrap gap-2 justify-center">
            {fragments.map((frag) => {
              const isUsed = slotted.some((s) => s?.id === frag.id);
              const targetSlotIndex = solution.indexOf(frag.label);
              const isCorrectChip = targetSlotIndex !== -1;

              // Progressive Hint States
              const isL1Highlight = hintForAssembly >= 1 && isCorrectChip && targetSlotIndex === 0 && !isRestored;
              const isL2Highlight = hintForAssembly >= 2 && isCorrectChip && targetSlotIndex <= 1 && !isRestored;
              const isL3Highlight = hintForAssembly >= 3 && isCorrectChip && !isRestored;

              return (
                <button
                  key={frag.id}
                  onClick={() => handleChipClick(frag)}
                  disabled={isRestored || isUsed}
                  className={`px-4 py-2 rounded-lg border font-mono text-xs flex items-center gap-2 transition-all cursor-pointer relative ${
                    isUsed
                      ? 'opacity-30 border-slate-800 bg-slate-950 cursor-not-allowed'
                      : isL3Highlight
                      ? 'border-yellow-400 bg-yellow-500/25 text-yellow-200 font-black shadow-[0_0_15px_rgba(234,179,8,0.7)] animate-bounce'
                      : isL2Highlight
                      ? 'border-yellow-400/80 bg-yellow-950/40 text-yellow-300 shadow-[0_0_10px_rgba(234,179,8,0.4)]'
                      : isL1Highlight
                      ? 'border-cyan-300 bg-cyan-950/40 text-cyan-200 shadow-[0_0_12px_rgba(6,182,212,0.6)] animate-pulse'
                      : 'border-cyan-500/40 bg-slate-900/80 text-cyan-300 hover:border-cyan-400 hover:bg-cyan-900/30 hover:scale-105 active:scale-95'
                  }`}
                >
                  {isL3Highlight && (
                    <span className="absolute -top-2 left-1/2 -translate-x-1/2 font-mono text-[7px] bg-yellow-400 text-black px-1 rounded font-black">
                      #{targetSlotIndex + 1}
                    </span>
                  )}
                  <span>{frag.icon}</span>
                  <span className="font-black">{frag.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-cyan-500/20 pt-2 flex items-center justify-between text-xs font-mono text-slate-500">
        <div>REQUIRED: 3 CHIP SEQUENCE</div>
        <div className="text-cyan-400">{isRestored ? '✓ OVERRIDE DATA COMPLETE' : 'SELECT CHIPS IN ORDER'}</div>
      </div>
    </div>
  );
}
