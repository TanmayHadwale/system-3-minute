// client/src/components/puzzles/MemorySyncPuzzle.jsx
import { useState, useEffect, useRef } from 'react';
import { useGame } from '../../context/GameContext';
import HintButton from '../HintButton';

export default function MemorySyncPuzzle() {
  const { chain, completeModule, solvedModules, deductScore, playSound, status, activeHint } = useGame();
  const puzzle = chain?.modules?.memory;
  const isRestored = solvedModules?.memory;

  const [activePad, setActivePad] = useState(null);
  const [isPlayingSeq, setIsPlayingSeq] = useState(false);
  const [playerInput, setPlayerInput] = useState([]);
  const [errorShake, setErrorShake] = useState(false);
  const [statusMsg, setStatusMsg] = useState('WATCH SEQUENCE');

  const timeoutIdsRef = useRef([]);

  const hintForMemory = activeHint?.module === 'memory' ? activeHint.level : 0;

  const clearAllTimeouts = () => {
    timeoutIdsRef.current.forEach(clearTimeout);
    timeoutIdsRef.current = [];
  };

  // Play sequence on load or reset
  const playSequence = (customSteps = null) => {
    if (!puzzle?.sequence || isRestored) return;
    clearAllTimeouts();
    setIsPlayingSeq(true);
    setPlayerInput([]);
    setStatusMsg('OBSERVE PATTERN...');

    const seqToPlay = customSteps !== null
      ? puzzle.sequence.slice(0, customSteps)
      : puzzle.sequence;

    seqToPlay.forEach((glyphIdx, step) => {
      const startId = setTimeout(() => {
        setActivePad(glyphIdx);
        playSound('memoryTone', glyphIdx);
      }, (step + 1) * 600);

      const stopId = setTimeout(() => {
        setActivePad(null);
      }, (step + 1) * 600 + 350);

      timeoutIdsRef.current.push(startId, stopId);
    });

    const finishId = setTimeout(() => {
      setIsPlayingSeq(false);
      setStatusMsg('REPEAT PATTERN NOW');
    }, (seqToPlay.length + 1) * 600);

    timeoutIdsRef.current.push(finishId);
  };

  useEffect(() => {
    if (!isRestored && status === 'playing') {
      const initialDelay = setTimeout(() => {
        playSequence();
      }, 500);
      return () => clearTimeout(initialDelay);
    }
    return () => clearAllTimeouts();
  }, [isRestored, status]);

  // Replay partial or full on hint trigger
  useEffect(() => {
    if (activeHint?.module === 'memory' && !isRestored && !isPlayingSeq) {
      if (activeHint.level === 1) {
        playSequence(1); // 1st symbol
      } else if (activeHint.level === 2) {
        playSequence(2); // first 2 symbols
      } else if (activeHint.level === 3) {
        playSequence(); // full sequence
      }
    }
  }, [activeHint]);

  const handlePadClick = (idx) => {
    if (isPlayingSeq || isRestored || status !== 'playing') return;

    setActivePad(idx);
    playSound('memoryTone', idx);
    setTimeout(() => setActivePad(null), 200);

    const nextInput = [...playerInput, idx];
    setPlayerInput(nextInput);

    const curStep = nextInput.length - 1;
    if (idx !== puzzle.sequence[curStep]) {
      playSound('incorrect');
      setErrorShake(true);
      deductScore(10);
      setStatusMsg('MISALIGNED — REPLAYING');
      setTimeout(() => {
        setErrorShake(false);
        playSequence();
      }, 900);
      return;
    }

    if (nextInput.length === puzzle.sequence.length) {
      playSound('correct');
      setStatusMsg('SYNCED ✓');
      setTimeout(() => {
        completeModule('memory');
      }, 800);
    }
  };

  if (!puzzle) return null;

  const glyphColorStyles = {
    cyan: {
      border: 'border-cyan-400',
      activeBg: 'bg-cyan-500 shadow-[0_0_35px_rgba(6,182,212,0.9)] text-black',
      inactiveBg: 'bg-cyan-950/40 text-cyan-400 hover:bg-cyan-900/50',
    },
    amber: {
      border: 'border-amber-400',
      activeBg: 'bg-amber-500 shadow-[0_0_35px_rgba(245,158,11,0.9)] text-black',
      inactiveBg: 'bg-amber-950/40 text-amber-400 hover:bg-amber-900/50',
    },
    magenta: {
      border: 'border-fuchsia-400',
      activeBg: 'bg-fuchsia-500 shadow-[0_0_35px_rgba(217,70,239,0.9)] text-black',
      inactiveBg: 'bg-fuchsia-950/40 text-fuchsia-400 hover:bg-fuchsia-900/50',
    },
    emerald: {
      border: 'border-emerald-400',
      activeBg: 'bg-emerald-500 shadow-[0_0_35px_rgba(16,185,129,0.9)] text-black',
      inactiveBg: 'bg-emerald-950/40 text-emerald-400 hover:bg-emerald-900/50',
    },
  };

  return (
    <div className="h-full flex flex-col justify-between select-none relative animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-cyan-500/20 pb-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">🧠</span>
          <div>
            <h2 className="font-mono text-base font-black tracking-widest text-cyan-300">
              MEMORY SYNC MATRIX
            </h2>
            <div className="text-[10px] font-mono text-slate-500">
              HARMONIC FREQUENCY SYNCHRONIZATION
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {!isRestored && <HintButton moduleName="memory" />}
          <span className={`badge ${isRestored ? 'badge-restored' : 'badge-active'}`}>
            {isRestored ? 'SYNCED ✓' : isPlayingSeq ? 'READOUT...' : 'YOUR TURN'}
          </span>
        </div>
      </div>

      {/* Center Cyber-Pads */}
      <div className="flex flex-col items-center justify-center my-auto">
        {/* Status prompt */}
        <div className={`font-mono text-xs font-bold tracking-widest mb-4 px-4 py-1.5 rounded-full glass border ${
          isRestored ? 'text-green-400 border-green-500/50' : isPlayingSeq ? 'text-cyan-400 border-cyan-500/50 animate-pulse' : 'text-amber-400 border-amber-500/50'
        }`}>
          {isRestored ? 'HARMONIC ALIGNMENT LOCKED ✓' : statusMsg}
        </div>

        {/* Pad Grid */}
        <div className={`grid grid-cols-2 gap-4 max-w-xs w-full p-4 glass rounded-2xl border border-cyan-500/30 ${errorShake ? 'animate-shake' : ''}`}>
          {puzzle.glyphs.map((g) => {
            const isLit = activePad === g.id;
            const colors = glyphColorStyles[g.color];

            // Level 3 Hint: Step badge on the pad
            const stepIndexInSeq = puzzle.sequence.indexOf(g.id);
            const isL3Badge = hintForMemory >= 3 && stepIndexInSeq !== -1 && !isRestored;

            return (
              <button
                key={g.id}
                onClick={() => handlePadClick(g.id)}
                disabled={isPlayingSeq || isRestored}
                className={`h-28 rounded-xl border-2 font-mono flex flex-col items-center justify-center transition-all duration-150 cursor-pointer relative overflow-hidden ${
                  colors.border
                } ${isLit ? colors.activeBg : colors.inactiveBg} ${
                  isPlayingSeq ? 'cursor-wait' : 'active:scale-95'
                }`}
              >
                {isL3Badge && (
                  <div className="absolute top-1 right-2 bg-yellow-400 text-black font-black text-[9px] px-1.5 py-0.5 rounded-full shadow-[0_0_8px_rgba(234,179,8,1)]">
                    STEP {stepIndexInSeq + 1}
                  </div>
                )}
                <span className="text-3xl mb-1">{g.symbol}</span>
                <span className="text-[10px] font-bold tracking-widest">{g.label}</span>
              </button>
            );
          })}
        </div>

        {/* Step Progress Dots */}
        {!isRestored && (
          <div className="flex items-center gap-2 mt-4">
            {puzzle.sequence.map((_, i) => {
              const isFilled = i < playerInput.length;
              return (
                <div
                  key={i}
                  className={`w-3 h-3 rounded-full border transition-all ${
                    isFilled ? 'bg-cyan-400 border-cyan-300 shadow-[0_0_8px_rgba(6,182,212,0.8)]' : 'bg-slate-800 border-slate-600'
                  }`}
                />
              );
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-cyan-500/20 pt-2 flex items-center justify-between text-xs font-mono text-slate-500">
        <div>LENGTH: {puzzle.sequence.length} STEPS</div>
        <button
          onClick={() => playSequence()}
          disabled={isPlayingSeq || isRestored}
          className="text-cyan-400 hover:text-cyan-300 underline cursor-pointer disabled:opacity-30 text-[10px]"
        >
          REPLAY SEQUENCE
        </button>
      </div>
    </div>
  );
}
