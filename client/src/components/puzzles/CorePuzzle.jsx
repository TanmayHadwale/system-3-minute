// client/src/components/puzzles/CorePuzzle.jsx
import { useState } from 'react';
import { useGame } from '../../context/GameContext';
import { MODULE_ORDER, MODULE_LABELS, MODULE_ICONS } from '../../puzzles/puzzleChains';
import HintButton from '../HintButton';

export default function CoreRestorationPuzzle() {
  const { chain, completeModule, solvedModules, finishGame, playSound, status, activeHint } = useGame();
  const puzzle = chain?.modules?.core;
  const isRestored = solvedModules?.core;

  const [relaysEngaged, setRelaysEngaged] = useState({
    files: false,
    circuit: false,
    memory: false,
    scanner: false,
    assembly: false,
    sync: false,
  });

  const [tokenInserted, setTokenInserted] = useState(false);
  const [igniting, setIgniting] = useState(false);
  const [burstPercent, setBurstPercent] = useState(0);

  const prevModules = MODULE_ORDER.filter(m => m !== 'core');
  const allPrevDone = prevModules.every(m => solvedModules[m]);

  const hintForCore = activeHint?.module === 'core' ? activeHint.level : 0;

  const toggleRelay = (modId) => {
    if (isRestored || igniting || status !== 'playing') return;
    playSound('pulse');
    setRelaysEngaged(prev => ({
      ...prev,
      [modId]: !prev[modId],
    }));
  };

  const allRelaysActive = prevModules.every(m => relaysEngaged[m]);

  const handleInsertToken = () => {
    if (isRestored || igniting || status !== 'playing') return;
    playSound('slot');
    setTokenInserted(true);
  };

  const handleIgnite = () => {
    if (!allRelaysActive || !tokenInserted || isRestored || igniting) return;

    setIgniting(true);
    playSound('laser');

    let p = 0;
    const interval = setInterval(() => {
      p += 5;
      setBurstPercent(p);
      if (p >= 100) {
        clearInterval(interval);
        playSound('win');
        completeModule('core');
        setTimeout(() => {
          finishGame(true);
        }, 1200);
      }
    }, 40);
  };

  if (!puzzle) return null;

  return (
    <div className="h-full flex flex-col justify-between select-none relative animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-cyan-500/20 pb-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">⬡</span>
          <div>
            <h2 className="font-mono text-base font-black tracking-widest text-cyan-300">
              SYSTEM CORE MAINFRAME
            </h2>
            <div className="text-[10px] font-mono text-slate-500">
              CENTRAL RECOVERY NEXUS
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {!isRestored && <HintButton moduleName="core" />}
          <span className={`badge ${isRestored ? 'badge-restored' : allPrevDone ? 'badge-active' : 'badge-locked'}`}>
            {isRestored ? '100% ONLINE ✓' : allPrevDone ? 'READY FOR IGNITION' : 'MODULES PENDING'}
          </span>
        </div>
      </div>

      {/* Main Core Stage */}
      <div className="flex flex-col items-center justify-center my-auto py-2 relative">
        {/* Core Holographic Orb */}
        <div className="relative w-48 h-48 sm:w-56 sm:h-56 flex items-center justify-center">
          <div
            className={`absolute inset-0 rounded-full border border-cyan-500/30 transition-all ${
              igniting ? 'animate-[spin_1s_linear_infinite] border-green-400' : 'animate-[spin_20s_linear_infinite]'
            }`}
          />
          <div
            className={`absolute inset-4 rounded-full border border-cyan-400/40 border-dashed transition-all ${
              igniting ? 'animate-[spin_1.5s_linear_infinite_reverse] border-green-300' : 'animate-[spin_14s_linear_infinite_reverse]'
            }`}
          />

          {/* Glowing Central Reactor */}
          <div
            className={`w-28 h-28 sm:w-32 sm:h-32 rounded-full flex flex-col items-center justify-center transition-all duration-500 relative z-10 ${
              isRestored || igniting
                ? 'bg-gradient-to-tr from-green-500 via-emerald-400 to-cyan-300 shadow-[0_0_80px_rgba(34,197,94,0.9)] scale-110'
                : allRelaysActive && tokenInserted
                ? 'bg-gradient-to-tr from-cyan-600 via-cyan-400 to-white shadow-[0_0_60px_rgba(6,182,212,0.8)] animate-pulse'
                : 'bg-gradient-to-tr from-slate-900 to-cyan-950/80 border border-cyan-500/40 shadow-[0_0_30px_rgba(6,182,212,0.3)]'
            }`}
          >
            <span className="text-3xl sm:text-4xl mb-1">{isRestored || igniting ? '⚡' : '⬡'}</span>
            <span className="font-mono text-[9px] font-black tracking-widest text-white/90">
              {igniting ? `${burstPercent}%` : isRestored ? 'RESTORED' : 'CORE'}
            </span>
          </div>

          {/* Module Power Beam Conduits */}
          {prevModules.map((mod, i) => {
            const angle = (i * 360) / prevModules.length;
            const rad = (angle * Math.PI) / 180;
            const x = Math.cos(rad) * 115;
            const y = Math.sin(rad) * 115;
            const isEngaged = relaysEngaged[mod];
            const isModSolved = solvedModules[mod];

            // Hint highlight unengaged nodes
            const isHintPulsing = hintForCore >= 1 && !isEngaged && isModSolved && !isRestored;

            return (
              <button
                key={mod}
                onClick={() => toggleRelay(mod)}
                disabled={!isModSolved || isRestored}
                className={`absolute w-9 h-9 rounded-full flex items-center justify-center font-mono text-xs border transition-all cursor-pointer z-20 ${
                  isEngaged
                    ? 'border-green-400 bg-green-500/30 text-green-300 shadow-[0_0_15px_rgba(34,197,94,0.8)] scale-110'
                    : isHintPulsing
                    ? 'border-yellow-400 bg-yellow-500/30 text-yellow-200 shadow-[0_0_20px_rgba(234,179,8,0.9)] animate-bounce scale-110'
                    : isModSolved
                    ? 'border-cyan-400/80 bg-cyan-950 text-cyan-300 hover:scale-110 shadow-[0_0_10px_rgba(6,182,212,0.5)]'
                    : 'border-slate-800 bg-slate-950 text-slate-600 cursor-not-allowed'
                }`}
                style={{
                  transform: `translate(${x}px, ${y}px)`,
                }}
                title={`${MODULE_LABELS[mod]}: ${isEngaged ? 'ENGAGED' : 'TAP TO CONNECT'}`}
              >
                {MODULE_ICONS[mod]}
              </button>
            );
          })}
        </div>

        {/* Action Controls */}
        <div className="mt-6 flex flex-col items-center gap-3 w-full max-w-sm">
          {!allRelaysActive && (
            <div className="text-xs font-mono text-cyan-400 tracking-wider text-center animate-pulse">
              TAP ORBITAL NODES TO ENGAGE POWER RELAYS (
              {Object.values(relaysEngaged).filter(Boolean).length}/{prevModules.length})
            </div>
          )}

          {allRelaysActive && !tokenInserted && (
            <button
              onClick={handleInsertToken}
              className={`px-6 py-3 rounded-xl border-2 font-mono text-xs font-black tracking-widest cursor-pointer transition-all ${
                hintForCore >= 2
                  ? 'border-yellow-300 bg-yellow-400/30 text-yellow-100 shadow-[0_0_30px_rgba(234,179,8,0.8)] animate-bounce'
                  : 'border-amber-400 bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 shadow-[0_0_20px_rgba(245,158,11,0.5)] animate-bounce'
              }`}
            >
              🔑 INSERT OVERRIDE KEY [{puzzle.requiredToken}]
            </button>
          )}

          {allRelaysActive && tokenInserted && !isRestored && (
            <button
              onClick={handleIgnite}
              disabled={igniting}
              className={`px-10 py-4 btn-primary text-sm font-black tracking-widest cursor-pointer active:scale-95 shadow-[0_0_35px_rgba(6,182,212,0.9)] ${
                hintForCore >= 3 ? 'animate-bounce' : 'animate-pulse-glow'
              }`}
            >
              {igniting ? '⚡ OVERDRIVE INITIALIZING...' : '✦ IGNITE SYSTEM RESTORATION ✦'}
            </button>
          )}

          {isRestored && (
            <div className="text-center font-mono text-green-400 font-black tracking-widest text-sm animate-scale-in">
              ✓ SYSTEM STABILITY 100% — RESTORATION COMPLETE
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-cyan-500/20 pt-2 flex items-center justify-between text-xs font-mono text-slate-500">
        <div>CORE FREQUENCY: LOCKED</div>
        <div className="text-cyan-400">{isRestored ? '✓ NEXUS FULLY OPERATIONAL' : 'COMPLETE ALL RELAYS TO IGNITE'}</div>
      </div>
    </div>
  );
}
