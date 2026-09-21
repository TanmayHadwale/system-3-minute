// client/src/components/puzzles/PowerRoutingPuzzle.jsx
import { useState, useEffect, useMemo } from 'react';
import { useGame } from '../../context/GameContext';
import HintButton from '../HintButton';

// Helper to determine active ports based on tile type and rotation
function getTilePorts(type, rot) {
  const normRot = ((rot % 360) + 360) % 360;
  // Directions: 0: Up, 1: Right, 2: Down, 3: Left
  if (type === 'cross') return [true, true, true, true];

  if (type === 'straight') {
    if (normRot === 0 || normRot === 180) return [true, false, true, false]; // Up-Down
    return [false, true, false, true]; // Left-Right
  }

  if (type === 'corner') {
    if (normRot === 0) return [true, true, false, false];   // Up-Right
    if (normRot === 90) return [false, true, true, false];  // Right-Down
    if (normRot === 180) return [false, false, true, true]; // Down-Left
    if (normRot === 270) return [true, false, false, true]; // Left-Up
  }

  return [false, false, false, false];
}

export default function PowerRoutingPuzzle() {
  const { chain, completeModule, solvedModules, playSound, status, activeHint } = useGame();
  const puzzle = chain?.modules?.circuit;
  const isRestored = solvedModules?.circuit;

  const [tiles, setTiles] = useState(() => {
    return (puzzle?.tiles || []).map(t => ({ ...t }));
  });

  const hintForCircuit = activeHint?.module === 'circuit' ? activeHint.level : 0;

  // Key path tiles indices: [0, 1, 2, 5, 8]
  const solutionPathIndices = [0, 1, 2, 5, 8];

  // Calculate connected path using BFS from (0,0) with incoming Left connection
  const { isConnected, energizedIds } = useMemo(() => {
    if (!tiles || tiles.length < 9) return { isConnected: false, energizedIds: new Set() };

    const energized = new Set();
    const queue = [];

    // Check if (0, 0) accepts input from Left (direction 3)
    const t0Ports = getTilePorts(tiles[0].type, tiles[0].currentRot);
    if (t0Ports[3]) {
      energized.add(tiles[0].id);
      queue.push({ r: 0, c: 0, index: 0 });
    }

    const opposite = [2, 3, 0, 1]; // Up <-> Down, Right <-> Left
    const deltas = [
      { dr: -1, dc: 0, dir: 0 }, // Up
      { dr: 0, dc: 1, dir: 1 },  // Right
      { dr: 1, dc: 0, dir: 2 },  // Down
      { dr: 0, dc: -1, dir: 3 }, // Left
    ];

    while (queue.length > 0) {
      const { r, c, index } = queue.shift();
      const curTile = tiles[index];
      const curPorts = getTilePorts(curTile.type, curTile.currentRot);

      for (const d of deltas) {
        if (!curPorts[d.dir]) continue;
        const nr = r + d.dr;
        const nc = c + d.dc;
        if (nr < 0 || nr > 2 || nc < 0 || nc > 2) continue;

        const nextIndex = nr * 3 + nc;
        const nextTile = tiles[nextIndex];
        if (energized.has(nextTile.id)) continue;

        const nextPorts = getTilePorts(nextTile.type, nextTile.currentRot);
        if (nextPorts[opposite[d.dir]]) {
          energized.add(nextTile.id);
          queue.push({ r: nr, c: nc, index: nextIndex });
        }
      }
    }

    // Check if exit tile (2, 2) is energized and points Right (direction 1)
    const tEnd = tiles[8];
    const tEndPorts = getTilePorts(tEnd.type, tEnd.currentRot);
    const win = energized.has(tEnd.id) && tEndPorts[1];

    return { isConnected: win, energizedIds: energized };
  }, [tiles]);

  // Handle victory completion
  useEffect(() => {
    if (isConnected && !isRestored && status === 'playing') {
      playSound('correct');
      const timer = setTimeout(() => {
        completeModule('circuit');
      }, 700);
      return () => clearTimeout(timer);
    }
  }, [isConnected, isRestored, status, completeModule, playSound]);

  const handleRotate = (idx) => {
    if (status !== 'playing' || isRestored) return;
    playSound('rotate');
    setTiles(prev => {
      const next = [...prev];
      next[idx] = {
        ...next[idx],
        currentRot: (next[idx].currentRot + 90) % 360,
      };
      return next;
    });
  };

  return (
    <div className="h-full flex flex-col justify-between select-none relative animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-cyan-500/20 pb-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">⚡</span>
          <div>
            <h2 className="font-mono text-base font-black tracking-widest text-cyan-300">
              POWER ROUTING GRID
            </h2>
            <div className="text-[10px] font-mono text-slate-500">
              CLICK TILES TO ROTATE CONDUIT
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {!isRestored && <HintButton moduleName="circuit" />}
          <span className={`badge ${isRestored ? 'badge-restored' : 'badge-active'}`}>
            {isRestored ? 'CONNECTED ✓' : 'GRID MISALIGNED'}
          </span>
        </div>
      </div>

      {/* Interactive Circuit Arena */}
      <div className="flex items-center justify-center my-auto py-2">
        {/* Source Power In Node */}
        <div className="flex flex-col items-center mr-3">
          <div className="w-8 h-8 rounded-full bg-cyan-500/20 border-2 border-cyan-400 flex items-center justify-center text-cyan-300 font-mono text-xs font-bold animate-pulse shadow-[0_0_15px_rgba(6,182,212,0.6)]">
            PWR
          </div>
          <div className="w-4 h-1 bg-cyan-400 mt-1 shadow-[0_0_8px_rgba(6,182,212,0.8)]" />
        </div>

        {/* 3x3 Tile Matrix */}
        <div className="grid grid-cols-3 gap-2 p-3 glass rounded-xl border border-cyan-500/30">
          {tiles.map((tile, idx) => {
            const isEnergized = energizedIds.has(tile.id);
            const ports = getTilePorts(tile.type, tile.currentRot);

            // Progressive Hint Indicators
            const isL1Highlight = hintForCircuit >= 1 && idx === 0 && !isRestored;
            const isL2Highlight = hintForCircuit >= 2 && [0, 1, 2].includes(idx) && !isRestored;
            const isL3Highlight = hintForCircuit >= 3 && solutionPathIndices.includes(idx) && !isRestored;

            return (
              <button
                key={tile.id}
                onClick={() => handleRotate(idx)}
                disabled={isRestored}
                className={`w-16 h-16 sm:w-20 sm:h-20 rounded-lg relative flex items-center justify-center cursor-pointer transition-all duration-150 overflow-hidden ${
                  isEnergized
                    ? 'bg-cyan-950/60 border-2 border-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.5)]'
                    : isL3Highlight
                    ? 'bg-yellow-950/40 border-2 border-yellow-400 shadow-[0_0_15px_rgba(234,179,8,0.5)]'
                    : isL2Highlight
                    ? 'bg-yellow-950/30 border border-yellow-400/80 shadow-[0_0_10px_rgba(234,179,8,0.4)]'
                    : isL1Highlight
                    ? 'bg-cyan-950/40 border-2 border-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.6)] animate-pulse'
                    : 'bg-slate-900/80 border border-slate-700 hover:border-cyan-500/60'
                } ${isRestored && isEnergized ? 'border-green-400 bg-green-950/40' : ''}`}
              >
                {/* Visual hint indicator badge */}
                {isL1Highlight && (
                  <div className="absolute top-1 left-1 text-[8px] font-mono text-cyan-300 bg-black/60 px-1 rounded">
                    START
                  </div>
                )}
                {isL3Highlight && !isL1Highlight && (
                  <div className="absolute top-1 left-1 text-[8px] font-mono text-yellow-300 bg-black/60 px-1 rounded">
                    CONDUIT
                  </div>
                )}

                {/* SVG Conduit Pipe Renderer */}
                <svg
                  className="w-full h-full p-2 pointer-events-none"
                  viewBox="0 0 100 100"
                >
                  {/* Center Node */}
                  <circle
                    cx="50"
                    cy="50"
                    r="8"
                    className={isEnergized ? (isRestored ? 'fill-green-400' : 'fill-cyan-400') : isL3Highlight ? 'fill-yellow-400' : 'fill-slate-600'}
                  />

                  {/* Ports lines */}
                  {ports[0] && (
                    <line
                      x1="50"
                      y1="50"
                      x2="50"
                      y2="0"
                      strokeWidth="10"
                      className={isEnergized ? (isRestored ? 'stroke-green-400' : 'stroke-cyan-400') : isL3Highlight ? 'stroke-yellow-400' : 'stroke-slate-600'}
                      strokeLinecap="round"
                    />
                  )}
                  {ports[1] && (
                    <line
                      x1="50"
                      y1="50"
                      x2="100"
                      y2="50"
                      strokeWidth="10"
                      className={isEnergized ? (isRestored ? 'stroke-green-400' : 'stroke-cyan-400') : isL3Highlight ? 'stroke-yellow-400' : 'stroke-slate-600'}
                      strokeLinecap="round"
                    />
                  )}
                  {ports[2] && (
                    <line
                      x1="50"
                      y1="50"
                      x2="50"
                      y2="100"
                      strokeWidth="10"
                      className={isEnergized ? (isRestored ? 'stroke-green-400' : 'stroke-cyan-400') : isL3Highlight ? 'stroke-yellow-400' : 'stroke-slate-600'}
                      strokeLinecap="round"
                    />
                  )}
                  {ports[3] && (
                    <line
                      x1="50"
                      y1="50"
                      x2="0"
                      y2="50"
                      strokeWidth="10"
                      className={isEnergized ? (isRestored ? 'stroke-green-400' : 'stroke-cyan-400') : isL3Highlight ? 'stroke-yellow-400' : 'stroke-slate-600'}
                      strokeLinecap="round"
                    />
                  )}
                </svg>

                {/* Subtle rotate indicator on hover */}
                <div className="absolute bottom-1 right-1 text-[8px] font-mono text-slate-500 opacity-40">
                  ↻
                </div>
              </button>
            );
          })}
        </div>

        {/* Target Module Out Node */}
        <div className="flex flex-col items-center ml-3">
          <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center font-mono text-xs font-bold transition-all ${
            isRestored
              ? 'bg-green-500/20 border-green-400 text-green-300 shadow-[0_0_18px_rgba(34,197,94,0.8)]'
              : 'bg-slate-800 border-slate-600 text-slate-400'
          }`}>
            OUT
          </div>
          <div className={`w-4 h-1 mt-1 transition-all ${isRestored ? 'bg-green-400 shadow-[0_0_8px_rgba(34,197,94,0.8)]' : 'bg-slate-700'}`} />
        </div>
      </div>

      {/* Success Notification Bar */}
      {isRestored && (
        <div className="p-3 bg-green-950/40 border border-green-400/40 rounded-lg text-center animate-slide-up">
          <span className="font-mono text-xs font-bold text-green-400 tracking-wider">
            ✓ CIRCUIT SYNCHRONIZED — POWER FLOWING TO DATABASE (+100)
          </span>
        </div>
      )}

      {/* Footer Instructions */}
      <div className="border-t border-cyan-500/20 pt-2 flex items-center justify-between text-xs font-mono text-slate-500">
        <div>INPUT: (0,0) LEFT ➔ OUTPUT: (2,2) RIGHT</div>
        <div className="text-cyan-400">{isRestored ? '✓ POWER CONDUIT LOCKED' : 'TAP TO ROTATE SEGMENTS'}</div>
      </div>
    </div>
  );
}
