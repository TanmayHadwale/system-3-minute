// src/pages/ResultScreen.jsx
import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameContext';
import { MODULE_ORDER } from '../puzzles/puzzleChains';

function formatTime(secs) {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export default function ResultScreen() {
  const { status, score, timeLeft, clues, solvedModules, hintsUsed, hintPenalty, startGame } = useGame();
  const navigate = useNavigate();
  const canvasRef = useRef(null);
  const frameRef  = useRef(null);

  const isWin = status === 'completed';
  const totalModules = MODULE_ORDER.length;
  const puzzlesSolved = Object.values(solvedModules).filter(Boolean).length;

  // Particle celebration on win
  useEffect(() => {
    if (!isWin || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles = Array.from({ length: 80 }, () => ({
      x: canvas.width / 2,
      y: canvas.height / 2,
      vx: (Math.random() - 0.5) * 8,
      vy: (Math.random() - 0.8) * 8,
      color: ['#06b6d4', '#22c55e', '#a5f3fc', '#86efac', '#facc15'][Math.floor(Math.random() * 5)],
      life: 1,
      r: Math.random() * 4 + 2,
    }));

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.x  += p.vx;
        p.y  += p.vy;
        p.vy += 0.14;
        p.life -= 0.012;
        if (p.life <= 0) return;
        ctx.globalAlpha = p.life;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1;
      frameRef.current = requestAnimationFrame(draw);
    }
    draw();
    return () => cancelAnimationFrame(frameRef.current);
  }, [isWin]);

  const handlePlayAgain = async () => {
    await startGame();
    navigate('/game');
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-6 relative select-none"
      style={{ background: 'var(--color-darker)' }}
    >
      {/* Particle canvas on win */}
      {isWin && (
        <canvas ref={canvasRef} className="particle-canvas" style={{ zIndex: 0 }} />
      )}

      <div
        className={`relative z-10 glass rounded-2xl p-8 max-w-md w-full text-center ${
          isWin ? 'win-panel shadow-[0_0_50px_rgba(34,197,94,0.3)]' : 'lose-panel shadow-[0_0_50px_rgba(239,68,68,0.3)]'
        } animate-scale-in`}
      >
        {/* Main Status Header */}
        <div
          className={`font-mono text-3xl sm:text-4xl font-black tracking-widest mb-2 ${
            isWin ? 'text-green-400 text-glow-green' : 'text-red-500 text-glow-red'
          } animate-pulse`}
        >
          {isWin ? 'SYSTEM RESTORED' : 'SYSTEM FAILURE'}
        </div>

        <div className="font-mono text-xs text-slate-400 mb-6 tracking-widest">
          {isWin ? 'ALL SECTORS FULLY OPERATIONAL' : 'TIME EXPIRED — RECOVERY INCOMPLETE'}
        </div>

        {/* Minimal Score & Stats Box */}
        <div className="bg-black/50 border border-slate-800 rounded-xl p-4 mb-6 space-y-2.5">
          <div className="flex items-center justify-between font-mono text-xs border-b border-slate-800/80 pb-2">
            <span className="text-slate-400">TIME {isWin ? 'REMAINING' : ''}</span>
            <span className={`font-black text-sm ${isWin ? 'text-cyan-300' : 'text-red-400'}`}>
              {isWin ? formatTime(timeLeft) : '00:00'}
            </span>
          </div>

          <div className="flex items-center justify-between font-mono text-xs border-b border-slate-800/80 pb-2">
            <span className="text-slate-400">FINAL SCORE</span>
            <span className="font-black text-base text-yellow-400 text-glow-cyan">
              {score.toLocaleString()}
            </span>
          </div>

          <div className="flex items-center justify-between font-mono text-xs border-b border-slate-800/80 pb-2">
            <span className="text-slate-400">MODULES RESTORED</span>
            <span className="font-black text-sm text-green-400">
              {puzzlesSolved} / {totalModules}
            </span>
          </div>

          <div className="flex items-center justify-between font-mono text-xs border-b border-slate-800/80 pb-2">
            <span className="text-slate-400">CLUES DISCOVERED</span>
            <span className="font-black text-sm text-cyan-400">
              {clues.length}
            </span>
          </div>

          <div className="flex items-center justify-between font-mono text-xs">
            <span className="text-slate-400">HINTS USED</span>
            <span className="font-black text-sm text-slate-300">
              {hintsUsed} {hintPenalty > 0 && <span className="text-slate-500 font-normal text-[10px]">(-{hintPenalty} pts)</span>}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 flex-col sm:flex-row">
          <button
            onClick={handlePlayAgain}
            className="btn-primary flex-1 py-3 text-sm tracking-wider cursor-pointer active:scale-95"
          >
            {isWin ? '▶ PLAY AGAIN' : '↻ TRY AGAIN'}
          </button>
          <button
            onClick={() => navigate('/leaderboard')}
            className="btn-secondary flex-1 py-3 text-sm tracking-wider cursor-pointer"
          >
            VIEW SCORES
          </button>
          <button
            onClick={() => navigate('/')}
            className="btn-secondary flex-1 py-3 text-sm tracking-wider cursor-pointer"
          >
            HOME
          </button>
        </div>
      </div>
    </div>
  );
}
