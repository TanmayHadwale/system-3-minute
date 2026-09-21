// src/pages/Landing.jsx
import { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameContext';

// ── Particle system ────────────────────────────────────────────
function ParticleCanvas() {
  const canvasRef = useRef(null);
  const frameRef  = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let W = canvas.width  = window.innerWidth;
    let H = canvas.height = window.innerHeight;

    const particles = Array.from({ length: 60 }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      r: Math.random() * 1.5 + 0.3,
      alpha: Math.random() * 0.5 + 0.1,
    }));

    function draw() {
      ctx.clearRect(0, 0, W, H);
      particles.forEach(p => {
        p.x = (p.x + p.vx + W) % W;
        p.y = (p.y + p.vy + H) % H;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(6,182,212,${p.alpha})`;
        ctx.fill();
      });
      // Draw faint connection lines
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 100) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(6,182,212,${0.04 * (1 - dist / 100)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
      frameRef.current = requestAnimationFrame(draw);
    }

    draw();

    const resize = () => {
      W = canvas.width  = window.innerWidth;
      H = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resize);
    return () => {
      cancelAnimationFrame(frameRef.current);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="particle-canvas"
      style={{ position: 'fixed', inset: 0, zIndex: 0 }}
    />
  );
}

// ── Typing effect ──────────────────────────────────────────────
function TypingText({ text, delay = 0 }) {
  const [shown, setShown] = useState('');
  useEffect(() => {
    let i = 0;
    const t = setTimeout(() => {
      const interval = setInterval(() => {
        setShown(text.slice(0, i + 1));
        i++;
        if (i >= text.length) clearInterval(interval);
      }, 35);
      return () => clearInterval(interval);
    }, delay);
    return () => clearTimeout(t);
  }, [text, delay]);
  return (
    <span>
      {shown}
      <span className="inline-block w-0.5 h-4 bg-cyan-400 ml-0.5 animate-pulse" />
    </span>
  );
}

// ── Main Landing component ─────────────────────────────────────
export default function Landing() {
  const { startGame, soundEnabled, toggleSound, status } = useGame();
  const navigate  = useNavigate();
  const cardRef   = useRef(null);
  const [loading, setLoading] = useState(false);
  const [booting, setBooting] = useState(false);
  const [bootLines, setBootLines] = useState([]);
  const [revealed, setRevealed] = useState(false);

  const BOOT_LINES = [
    'INITIALIZING CORE SYSTEMS...',
    'LOADING GAME ENGINE...',
    'GENERATING PUZZLE CHAIN...',
    'SYSTEM READY.',
  ];

  // Reveal animation on mount
  useEffect(() => {
    const t = setTimeout(() => setRevealed(true), 200);
    return () => clearTimeout(t);
  }, []);

  // 3D card tilt on mouse move
  const handleMouseMove = useCallback((e) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const cx = rect.left + rect.width  / 2;
    const cy = rect.top  + rect.height / 2;
    const dx = (e.clientX - cx) / (rect.width  / 2);
    const dy = (e.clientY - cy) / (rect.height / 2);
    card.style.transform = `perspective(800px) rotateY(${dx * 6}deg) rotateX(${-dy * 4}deg)`;
  }, []);

  const handleMouseLeave = useCallback(() => {
    if (cardRef.current) {
      cardRef.current.style.transform = 'perspective(800px) rotateY(0deg) rotateX(0deg)';
    }
  }, []);

  const handleStart = async () => {
    if (loading) return;
    setLoading(true);
    setBooting(true);

    // Play boot sequence animation
    for (let i = 0; i < BOOT_LINES.length; i++) {
      await new Promise(r => setTimeout(r, 350));
      setBootLines(prev => [...prev, BOOT_LINES[i]]);
    }
    await new Promise(r => setTimeout(r, 300));

    await startGame();
    navigate('/game');
  };

  return (
    <div className="landing-bg grid-bg min-h-screen flex flex-col items-center justify-center relative overflow-hidden select-none">
      <ParticleCanvas />

      {/* Decorative rings */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-96 h-96 rounded-full border border-cyan-500/5 animate-[spin_30s_linear_infinite]" />
        <div className="absolute w-64 h-64 rounded-full border border-cyan-500/10 animate-[spin_20s_linear_infinite_reverse]" />
      </div>

      {/* Main card */}
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="tilt-card relative z-10 glass neon-border rounded-xl p-10 max-w-md w-full mx-4"
        style={{ transition: 'transform 0.12s ease' }}
      >
        {/* Sound toggle */}
        <button
          onClick={toggleSound}
          className="absolute top-4 right-4 text-slate-500 hover:text-cyan-400 transition-colors text-xs font-mono"
          title="Toggle Sound"
        >
          {soundEnabled ? '♪ SND ON' : '♪ SND OFF'}
        </button>

        {/* System core orb */}
        <div className="flex justify-center mb-6">
          <div className="system-core-orb" />
        </div>

        {/* Title */}
        <div className={`text-center mb-2 transition-all duration-700 ${revealed ? 'opacity-100' : 'opacity-0 translate-y-4'}`}>
          <h1 className="landing-title mb-1">SYSTEM: 3:00</h1>
          <div className="text-xs font-mono text-slate-500 tracking-[0.3em]">
            CYBER RECOVERY SYSTEM v3.0
          </div>
        </div>

        {/* Tagline */}
        <div className={`text-center my-6 transition-all duration-700 delay-200 ${revealed ? 'opacity-100' : 'opacity-0'}`}>
          <p className="font-mono text-sm text-slate-300 leading-6">
            YOUR SYSTEM IS FAILING.<br />
            <span className="text-cyan-400 font-semibold">RESTORE IT BEFORE TIME RUNS OUT.</span>
          </p>
        </div>

        {/* Boot sequence display */}
        {booting && (
          <div className="mb-5 bg-black/60 rounded p-3 font-mono text-xs border border-cyan-900/40">
            {bootLines.map((line, i) => (
              <div key={i} className={`terminal-line ${i === bootLines.length - 1 ? 'text-cyan-400' : 'text-slate-500'}`}>
                {'> '}{line}
              </div>
            ))}
            {loading && bootLines.length < BOOT_LINES.length && (
              <div className="text-cyan-400 animate-pulse">{'> ...'}</div>
            )}
          </div>
        )}

        {/* Buttons */}
        {!booting && (
          <div className={`flex flex-col gap-3 transition-all duration-700 delay-400 ${revealed ? 'opacity-100' : 'opacity-0 translate-y-4'}`}>
            <button
              onClick={handleStart}
              disabled={loading}
              className="btn-primary text-sm tracking-widest animate-pulse-glow"
            >
              {loading ? 'INITIALIZING...' : '▶  START SYSTEM'}
            </button>
            <button
              onClick={() => navigate('/leaderboard')}
              className="btn-secondary text-sm tracking-widest"
            >
              VIEW SCORES
            </button>
          </div>
        )}

        {/* Status bar */}
        <div className="mt-6 pt-4 border-t border-slate-800 flex justify-between items-center">
          <div className="text-[10px] font-mono text-slate-600">
            <span className="text-green-500">●</span> SYSTEMS NOMINAL
          </div>
          <div className="text-[10px] font-mono text-slate-600 tracking-widest">
            3:00 / 5 PUZZLES
          </div>
        </div>
      </div>

      {/* Bottom credits */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-[10px] font-mono text-slate-700 tracking-widest z-10">
        HACKATHON DEMO · SYSTEM:300 · 2026
      </div>
    </div>
  );
}
