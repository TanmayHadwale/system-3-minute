// client/src/components/puzzles/RadarScannerPuzzle.jsx
import { useState, useEffect } from 'react';
import { useGame } from '../../context/GameContext';
import HintButton from '../HintButton';

export default function RadarScannerPuzzle() {
  const { chain, completeModule, solvedModules, playSound, deductScore, status, activeHint } = useGame();
  const puzzle = chain?.modules?.scanner;
  const isRestored = solvedModules?.scanner;

  const [selectedFreq, setSelectedFreq] = useState(null);
  const [locked, setLocked] = useState(false);
  const [pingActive, setPingActive] = useState(false);

  const targetFreq = puzzle?.targetFreq || '142.8';
  const hintForScanner = activeHint?.module === 'scanner' ? activeHint.level : 0;

  const handleTune = (freq) => {
    if (status !== 'playing' || isRestored || locked) return;
    setSelectedFreq(freq);
    playSound('click');

    if (freq === targetFreq) {
      setLocked(true);
      playSound('laser');
      setTimeout(() => {
        playSound('correct');
        completeModule('scanner');
      }, 800);
    } else {
      playSound('incorrect');
      deductScore(5);
    }
  };

  const handleRadarPing = () => {
    if (status !== 'playing' || isRestored) return;
    playSound('pulse');
    setPingActive(true);
    setTimeout(() => setPingActive(false), 1200);
  };

  if (!puzzle) return null;

  return (
    <div className="h-full flex flex-col justify-between select-none relative animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-cyan-500/20 pb-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">📡</span>
          <div>
            <h2 className="font-mono text-base font-black tracking-widest text-cyan-300">
              RADAR FREQUENCY SCANNER
            </h2>
            <div className="text-[10px] font-mono text-slate-500">
              NETWORK SWEEP & SIGNAL LOCK
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {!isRestored && <HintButton moduleName="scanner" />}
          <span className={`badge ${isRestored ? 'badge-restored' : 'badge-active'}`}>
            {isRestored ? 'SIGNAL LOCKED ✓' : 'SWEEPING'}
          </span>
        </div>
      </div>

      {/* Main Radar Display */}
      <div className="flex flex-col items-center justify-center my-auto py-2">
        {/* Radar Scope */}
        <div className="w-56 h-56 rounded-full border-2 border-cyan-500/40 relative overflow-hidden bg-slate-950/80 shadow-[0_0_30px_rgba(6,182,212,0.2)] flex items-center justify-center">
          {/* Circular grid lines */}
          <div className="absolute w-40 h-40 rounded-full border border-cyan-500/20 pointer-events-none" />
          <div className="absolute w-24 h-24 rounded-full border border-cyan-500/20 pointer-events-none" />
          <div className="absolute w-full h-px bg-cyan-500/20 pointer-events-none" />
          <div className="absolute h-full w-px bg-cyan-500/20 pointer-events-none" />

          {/* Rotating Sweep Beam */}
          <div
            className={`absolute inset-0 origin-center pointer-events-none ${
              locked ? 'opacity-20' : 'animate-[spin_3s_linear_infinite]'
            }`}
            style={{
              background: 'conic-gradient(from 0deg, rgba(6,182,212,0.4) 0deg, transparent 60deg, transparent 360deg)',
            }}
          />

          {/* Target Blip */}
          <button
            onClick={() => handleTune(targetFreq)}
            disabled={isRestored}
            className={`absolute w-7 h-7 rounded-full flex items-center justify-center transition-all cursor-pointer z-10 ${
              locked
                ? 'bg-green-400 shadow-[0_0_20px_rgba(34,197,94,1)] scale-125'
                : hintForScanner >= 1
                ? 'bg-yellow-400 shadow-[0_0_25px_rgba(234,179,8,1)] scale-125 animate-ping'
                : 'bg-cyan-400 hover:scale-125 animate-ping'
            }`}
            style={{ top: '28%', left: '62%' }}
            title="Lock Target Signal"
          >
            <span className="w-2 h-2 rounded-full bg-white" />
          </button>

          {/* Center Pivot */}
          <div className="w-3 h-3 rounded-full bg-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.8)] z-10" />

          {/* Locked Reticle */}
          {locked && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-36 h-36 rounded-full border-2 border-green-400 animate-scale-in shadow-[0_0_25px_rgba(34,197,94,0.6)] flex items-center justify-center">
                <span className="font-mono text-xs font-black text-green-400 tracking-widest bg-black/60 px-2 py-0.5 rounded">
                  LOCKED
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Frequency Tuning Channel Selector */}
        <div className="mt-4 flex flex-wrap gap-2 justify-center max-w-sm">
          {puzzle.frequencies.map((freq) => {
            const isMatch = freq === selectedFreq;
            const isCorrectAndLocked = freq === targetFreq && locked;
            const isTarget = freq === targetFreq;

            const isL2TargetHint = hintForScanner >= 2 && isTarget && !isRestored;
            const isL3TargetHint = hintForScanner >= 3 && isTarget && !isRestored;

            return (
              <button
                key={freq}
                onClick={() => handleTune(freq)}
                disabled={isRestored || locked}
                className={`font-mono text-xs px-3 py-1.5 rounded-lg border transition-all cursor-pointer relative ${
                  isCorrectAndLocked
                    ? 'border-green-400 bg-green-500/20 text-green-300 font-bold shadow-[0_0_12px_rgba(34,197,94,0.5)]'
                    : isL3TargetHint
                    ? 'border-yellow-400 bg-yellow-500/25 text-yellow-200 font-black shadow-[0_0_15px_rgba(234,179,8,0.7)] animate-bounce'
                    : isL2TargetHint
                    ? 'border-yellow-400/80 bg-yellow-950/40 text-yellow-300 shadow-[0_0_10px_rgba(234,179,8,0.4)]'
                    : isMatch
                    ? 'border-red-400 bg-red-500/20 text-red-300'
                    : 'border-slate-700 bg-slate-900/60 text-slate-300 hover:border-cyan-400 hover:text-cyan-300'
                }`}
              >
                {isL3TargetHint && (
                  <span className="absolute -top-2 left-1/2 -translate-x-1/2 font-mono text-[7px] bg-yellow-400 text-black px-1 rounded font-black">
                    TARGET
                  </span>
                )}
                {freq} MHz
              </button>
            );
          })}
        </div>

        {/* Quick Ping Button */}
        {!isRestored && (
          <button
            onClick={handleRadarPing}
            className="mt-3 text-xs font-mono text-cyan-400 hover:text-cyan-300 bg-cyan-950/40 border border-cyan-500/40 px-4 py-1.5 rounded-full cursor-pointer transition-all active:scale-95"
          >
            {pingActive ? '⚡ PING TRANSMITTED' : '📡 EMIT RADAR PING'}
          </button>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-cyan-500/20 pt-2 flex items-center justify-between text-xs font-mono text-slate-500">
        <div>TARGET: BLIP OR MATCH FREQUENCY</div>
        <div className="text-cyan-400">{isRestored ? '✓ SIGNAL ESTABLISHED' : 'TAP RADAR BLIP TO LOCK'}</div>
      </div>
    </div>
  );
}
