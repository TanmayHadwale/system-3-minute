// src/pages/Dashboard.jsx
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameContext';
import { MODULE_ORDER, MODULE_LABELS, MODULE_ICONS } from '../puzzles/puzzleChains';
import Timer from '../components/Timer';
import ScoreCounter from '../components/ScoreCounter';
import ObjectivePanel from '../components/ObjectivePanel';
import CluePanel from '../components/CluePanel';
import TerminalPanel from '../components/TerminalPanel';

import FileHuntPuzzle from '../components/puzzles/FileHuntPuzzle';
import PowerRoutingPuzzle from '../components/puzzles/PowerRoutingPuzzle';
import MemorySyncPuzzle from '../components/puzzles/MemorySyncPuzzle';
import RadarScannerPuzzle from '../components/puzzles/RadarScannerPuzzle';
import DataAssemblyPuzzle from '../components/puzzles/DataAssemblyPuzzle';
import TimingSyncPuzzle from '../components/puzzles/TimingSyncPuzzle';
import CoreRestorationPuzzle from '../components/puzzles/CorePuzzle';

const PUZZLE_COMPONENTS = {
  files:    FileHuntPuzzle,
  circuit:  PowerRoutingPuzzle,
  memory:   MemorySyncPuzzle,
  scanner:  RadarScannerPuzzle,
  assembly: DataAssemblyPuzzle,
  sync:     TimingSyncPuzzle,
  core:     CoreRestorationPuzzle,
};

function StabilityBar({ value }) {
  const clampedValue = Math.max(0, Math.min(100, value ?? 100));
  const fillClass = clampedValue > 60 ? 'stability-fill-high'
                  : clampedValue > 30 ? 'stability-fill-medium'
                  : 'stability-fill-low';
  return (
    <div className="text-right">
      <div className="text-[10px] font-mono text-slate-500 tracking-widest mb-0.5">STABILITY</div>
      <div className="flex items-center gap-2">
        <div className="progress-bar-wrap w-24 sm:w-28" style={{ height: '6px' }}>
          <div className={`progress-bar-fill ${fillClass}`} style={{ width: `${clampedValue}%` }} />
        </div>
        <span className="font-mono text-xs text-slate-400 w-8 text-right font-bold">{clampedValue}%</span>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const {
    status,
    activeModule,
    setActiveModule,
    getModuleState,
    solvedModules,
    timeLeft,
    chain,
    soundEnabled,
    toggleSound,
    glitchActive,
  } = useGame();

  const navigate = useNavigate();

  // Redirect if game not active
  useEffect(() => {
    if (status === 'idle') navigate('/', { replace: true });
  }, [status, navigate]);

  // Default module
  useEffect(() => {
    if (!activeModule && chain) {
      setActiveModule('files');
    }
  }, [activeModule, chain, setActiveModule]);

  if (status === 'idle' || !chain) return null;

  const ActivePuzzle = activeModule ? PUZZLE_COMPONENTS[activeModule] : null;

  // Calculate arcade stability based on progress and remaining time
  const solvedCount = Object.values(solvedModules).filter(Boolean).length;
  const stability = Math.max(
    15,
    Math.min(100, Math.round((solvedCount / MODULE_ORDER.length) * 70 + (timeLeft / 180) * 30))
  );

  const isCritical = timeLeft <= 30 && status === 'playing';

  return (
    <div
      className={`min-h-screen flex flex-col transition-colors duration-1000 select-none ${
        isCritical ? 'bg-red-950/20' : ''
      }`}
      style={{ background: 'var(--color-darker)' }}
    >
      {/* Glitch Overlay Event */}
      {glitchActive && (
        <div className="fixed inset-0 bg-cyan-400/20 z-50 pointer-events-none mix-blend-difference animate-pulse">
          <div className="absolute inset-0 bg-red-500/10 flex items-center justify-center font-mono text-3xl font-black text-cyan-300 tracking-widest">
            OVERRIDE SIGNAL DETECTED
          </div>
        </div>
      )}

      {/* ── HEADER ─────────────────────────────────────── */}
      <header className="glass-panel border-b border-slate-800 px-4 py-2.5 flex items-center justify-between z-20 shrink-0">
        {/* Left: Branding & Sound */}
        <div className="flex items-center gap-3">
          <div>
            <div className="font-mono font-black text-lg text-cyan-400 text-glow-cyan tracking-widest leading-tight">
              SYSTEM: 3:00
            </div>
            <div className="text-[9px] font-mono text-slate-500 tracking-wider">
              {status === 'playing' ? 'ARCADE RECOVERY MATRIX' : status.toUpperCase()}
            </div>
          </div>
          <button
            onClick={toggleSound}
            className="text-[10px] font-mono px-2 py-1 rounded border border-slate-700 bg-slate-800/60 text-slate-400 hover:text-cyan-300 cursor-pointer"
            title="Toggle Sound"
          >
            {soundEnabled ? '♪ ON' : '♪ OFF'}
          </button>
        </div>

        {/* Center: Objective banner (desktop) */}
        <div className="hidden md:block flex-1 mx-6 max-w-md">
          <ObjectivePanel />
        </div>

        {/* Right: Modules Dots + Stability + Time + Score */}
        <div className="flex items-center gap-4 sm:gap-6">
          {/* Module Progress Dots */}
          <div className="hidden lg:flex items-center gap-1">
            {MODULE_ORDER.map((m) => {
              const mState = getModuleState(m);
              const isCurrent = activeModule === m;
              return (
                <div
                  key={m}
                  title={`${MODULE_LABELS[m]}: ${mState}`}
                  className={`w-2.5 h-2.5 rounded-full transition-all ${
                    mState === 'RESTORED'
                      ? 'bg-green-400 shadow-[0_0_8px_rgba(34,197,94,0.8)]'
                      : isCurrent
                      ? 'bg-cyan-400 animate-ping'
                      : mState === 'ACTIVE'
                      ? 'bg-cyan-600'
                      : 'bg-slate-700'
                  }`}
                />
              );
            })}
          </div>

          <div className="hidden sm:block">
            <StabilityBar value={stability} />
          </div>

          <div className="text-right border-l border-slate-800 pl-4 sm:pl-6">
            <div className="text-[10px] font-mono text-slate-500 tracking-widest mb-0.5">TIME</div>
            <Timer />
          </div>

          <div className="border-l border-slate-800 pl-4 sm:pl-6">
            <ScoreCounter />
          </div>
        </div>
      </header>

      {/* Mobile objective banner */}
      <div className="md:hidden px-3 pt-2">
        <ObjectivePanel />
      </div>

      {/* ── BODY ───────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">
        {/* ── SIDEBAR ─────────────────────────── */}
        <aside className="dashboard-sidebar w-48 sm:w-52 shrink-0 glass-panel border-r border-slate-800 flex flex-col overflow-y-auto z-10">
          <div className="p-3 border-b border-slate-800">
            <div className="text-[10px] font-mono text-slate-500 tracking-widest">
              SYSTEM MODULES ({solvedCount}/{MODULE_ORDER.length})
            </div>
          </div>

          {/* Module buttons */}
          <div className="flex flex-col p-2 gap-1.5 flex-1">
            {MODULE_ORDER.map((mod) => {
              const mState  = getModuleState(mod);
              const isActive = activeModule === mod;
              return (
                <button
                  key={mod}
                  onClick={() => {
                    if (mState !== 'LOCKED' || mod === 'core') setActiveModule(mod);
                  }}
                  disabled={mState === 'LOCKED'}
                  className={`w-full text-left p-2 rounded-lg border font-mono text-xs transition-all cursor-pointer ${
                    isActive
                      ? 'border-cyan-400 bg-cyan-500/15 text-cyan-200 shadow-[0_0_12px_rgba(6,182,212,0.3)]'
                      : mState === 'RESTORED'
                      ? 'border-green-500/30 bg-green-950/20 text-green-400 hover:border-green-400/50'
                      : mState === 'ACTIVE'
                      ? 'border-slate-700 bg-slate-900/60 text-slate-300 hover:border-cyan-500/50 hover:text-cyan-300'
                      : 'border-slate-900 bg-black/40 text-slate-700 cursor-not-allowed opacity-50'
                  }`}
                >
                  <div className="font-bold flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <span>{MODULE_ICONS[mod]}</span>
                      <span>{MODULE_LABELS[mod]}</span>
                    </span>
                    {mState === 'RESTORED' && <span className="text-green-400 font-bold">✓</span>}
                    {mState === 'ACTIVE' && <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />}
                  </div>
                  <div className={`text-[8px] mt-0.5 tracking-wider ${
                    mState === 'RESTORED' ? 'text-green-500'
                    : mState === 'ACTIVE' ? 'text-cyan-500'
                    : 'text-slate-700'
                  }`}>
                    {mState}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Clue Panel */}
          <div className="p-2 border-t border-slate-800">
            <CluePanel />
          </div>
        </aside>

        {/* ── MAIN WORKSPACE ──────────────────── */}
        <main className="dashboard-main flex-1 flex flex-col overflow-hidden bg-slate-950/40 relative">
          {/* Active Puzzle Canvas */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6">
            {ActivePuzzle ? (
              <ActivePuzzle />
            ) : (
              <div className="flex items-center justify-center h-full text-slate-500 font-mono text-sm">
                SELECT A MODULE
              </div>
            )}
          </div>

          {/* Collapsible Terminal Toolbar */}
          <div className="shrink-0">
            <TerminalPanel />
          </div>
        </main>
      </div>
    </div>
  );
}
