// src/components/TerminalPanel.jsx
import { useState, useRef, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { MODULE_ORDER, MODULE_LABELS } from '../puzzles/puzzleChains';

const HELP_TEXT = [
  'AVAILABLE COMMANDS: scan | status | clues | clear',
];

export default function TerminalPanel() {
  const { chain, clues, score, timeLeft, solvedModules, getModuleState, status, playSound } = useGame();
  const [input, setInput]     = useState('');
  const [lines, setLines]     = useState([
    { type: 'system', text: 'SYSTEM TERMINAL v3.0 — READY' },
  ]);
  const [isOpen, setIsOpen]   = useState(false);
  const bottomRef = useRef(null);
  const inputRef  = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [lines, isOpen]);

  const addLine = (text, type = 'output') => {
    setLines(prev => [...prev.slice(-20), { type, text }]);
  };

  const processCommand = (raw) => {
    const cmd  = raw.trim().toLowerCase();
    const args = cmd.split(' ');
    const base = args[0];

    playSound('click');
    addLine(`> ${raw}`, 'prompt');

    if (!chain || status !== 'playing') {
      addLine('SESSION INACTIVE', 'error');
      return;
    }

    switch (base) {
      case 'help':
        HELP_TEXT.forEach(l => addLine(l, 'system'));
        break;

      case 'scan':
        addLine('SCAN REPORT:', 'system');
        MODULE_ORDER.forEach(mod => {
          const state = getModuleState(mod);
          const label = (MODULE_LABELS[mod] || mod).slice(0, 12).padEnd(12);
          const stateStr = state === 'RESTORED' ? '✓ ONLINE'
                         : state === 'ACTIVE'   ? '● READY'
                         : '○ LOCKED';
          addLine(`  ${label} ${stateStr}`, state === 'RESTORED' ? 'success' : state === 'ACTIVE' ? 'accent' : 'output');
        });
        break;

      case 'status':
        addLine(`SCORE: ${score} | TIME: ${Math.floor(timeLeft/60)}:${String(timeLeft%60).padStart(2,'0')} | CLUES: ${clues.length}`, 'accent');
        break;

      case 'clues':
        if (clues.length === 0) {
          addLine('NO CLUES DISCOVERED', 'output');
        } else {
          clues.forEach(c => {
            addLine(`[${c.label}]: ${c.value}`, 'accent');
          });
        }
        break;

      case 'clear':
        setLines([{ type: 'system', text: 'SYSTEM TERMINAL — CLEARED' }]);
        break;

      default:
        addLine(`UNKNOWN: "${raw}". USE: scan, status, clues, clear`, 'error');
    }
  };

  const handleKey = (e) => {
    if (e.key === 'Enter') {
      const val = input.trim();
      if (!val) return;
      processCommand(val);
      setInput('');
    }
  };

  const colorClass = (type) => {
    switch (type) {
      case 'prompt':  return 'text-cyan-400';
      case 'system':  return 'text-slate-400';
      case 'success': return 'text-green-400';
      case 'error':   return 'text-red-400';
      case 'accent':  return 'text-cyan-300';
      default:        return 'text-slate-400';
    }
  };

  return (
    <div className="terminal-wrap flex flex-col bg-slate-950/90 border-t border-cyan-500/20">
      {/* Header bar with quick action buttons */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-slate-900/60">
        <button
          onClick={() => { setIsOpen(o => !o); setTimeout(() => inputRef.current?.focus(), 50); }}
          className="flex items-center gap-2 text-[10px] font-mono text-cyan-400 hover:text-cyan-300 cursor-pointer"
        >
          <span>▸ TERMINAL</span>
          <span className="text-[9px] text-slate-500">{isOpen ? '▲ HIDE' : '▼ OPEN'}</span>
        </button>

        {/* Quick Arcade Command Chips */}
        <div className="flex items-center gap-1.5">
          {['scan', 'status', 'clues', 'clear'].map((cmd) => (
            <button
              key={cmd}
              onClick={() => {
                if (!isOpen) setIsOpen(true);
                processCommand(cmd);
              }}
              className="text-[9px] font-mono px-2 py-0.5 rounded border border-slate-700 bg-slate-800/80 text-slate-300 hover:border-cyan-400 hover:text-cyan-300 cursor-pointer active:scale-95 transition-all"
            >
              {cmd.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {isOpen && (
        <div className="flex flex-col max-h-36 overflow-hidden">
          {/* Output log */}
          <div className="overflow-y-auto px-3 py-2 space-y-0.5 text-xs font-mono max-h-24">
            {lines.map((line, i) => (
              <div key={i} className={`terminal-line ${colorClass(line.type)}`}>
                {line.text}
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          {/* Quick command input */}
          <div className="flex items-center gap-2 px-3 py-1.5 border-t border-slate-800 bg-black/40">
            <span className="terminal-prompt text-xs font-mono">{'>'}</span>
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              className="flex-1 bg-transparent text-cyan-300 font-mono text-xs outline-none caret-cyan-400"
              placeholder="type command (e.g. scan)..."
              spellCheck={false}
              autoComplete="off"
            />
          </div>
        </div>
      )}
    </div>
  );
}
