// src/components/puzzles/LogicPuzzle.jsx
import { useState } from 'react';
import { useGame } from '../../context/GameContext';
import HintButton from '../HintButton';

export default function LogicPuzzle() {
  const { chain, solveModule, solvedModules, status } = useGame();
  const puzzle = chain?.modules?.logic;
  const [answer, setAnswer]       = useState('');
  const [feedback, setFeedback]   = useState(null);
  const [inputClass, setInputClass] = useState('');
  const [shaking, setShaking]     = useState(false);

  if (!puzzle) return null;
  const isRestored = solvedModules.logic;

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (!answer.trim() || status !== 'playing' || isRestored) return;

    const result = solveModule('logic', answer);
    setFeedback({ success: result.success, text: result.feedback });

    if (result.success) {
      setInputClass('success');
    } else {
      setInputClass('error');
      setShaking(true);
      setTimeout(() => { setShaking(false); setInputClass(''); }, 400);
      setTimeout(() => setFeedback(null), 2500);
    }
  };

  return (
    <div className="animate-fade-in h-full flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="font-mono font-bold text-white text-base tracking-widest">LOGIC ENGINE</h2>
        <span className={`badge ${isRestored ? 'badge-restored' : 'badge-locked'}`}>
          {isRestored ? '✓ RESTORED' : 'LOCKED'}
        </span>
      </div>

      <div className="text-xs font-mono text-slate-400 border-l-2 border-violet-600 pl-3 py-1">
        {puzzle.objective}
      </div>

      {isRestored ? (
        <div className="glass-panel rounded-lg p-6 neon-border-green animate-scale-in flex flex-col gap-3">
          <div className="font-mono text-green-400 font-bold text-lg text-glow-green">✓ LOGIC ENGINE RESTORED</div>
          {puzzle.clueReward && (
            <div className="bg-cyan-900/20 border border-cyan-500/30 rounded p-3">
              <div className="text-[10px] font-mono text-slate-500 mb-1">CORE ACCESS TOKEN UNLOCKED</div>
              <div className="font-mono text-cyan-300 font-bold text-lg">{puzzle.clueReward.value}</div>
            </div>
          )}
          <div className="text-xs font-mono text-slate-400">Proceed to SYSTEM CORE to complete restoration.</div>
        </div>
      ) : (
        <div className="glass-panel rounded-lg p-5 flex flex-col gap-5 flex-1">
          <div>
            <div className="font-mono text-sm text-violet-400 font-bold mb-1">⚙ BOOT SEQUENCE ANALYSIS</div>
            <div className="text-xs font-mono text-slate-400">{puzzle.description}</div>
          </div>

          {/* Sequence display */}
          <div className="flex items-center gap-2 flex-wrap justify-center py-4">
            {puzzle.sequence.map((num, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="seq-number">{num}</div>
                <div className="seq-arrow">→</div>
              </div>
            ))}
            <div className="seq-blank">?</div>
          </div>

          {/* Hint */}
          <div className="text-xs font-mono text-slate-500 bg-slate-900/50 rounded p-2 border border-slate-800 text-center">
            💡 {puzzle.hint}
          </div>

          {/* Input */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <div className="text-xs font-mono text-slate-400">Enter the next value in the sequence:</div>
            <input
              type="number"
              value={answer}
              onChange={e => setAnswer(e.target.value)}
              className={`puzzle-input ${inputClass} ${shaking ? 'animate-shake' : ''}`}
              placeholder="Enter number"
              autoComplete="off"
              disabled={status !== 'playing'}
            />
            <div className="flex items-center gap-3">
              <button type="submit" className="btn-primary flex-1 py-2.5 text-sm"
                disabled={status !== 'playing'}>
                SUBMIT SEQUENCE
              </button>
              <HintButton moduleName="logic" />
            </div>
            {feedback && (
              <div className={`p-3 rounded font-mono text-xs font-bold ${
                feedback.success
                  ? 'bg-green-900/30 text-green-400 border border-green-500/30 animate-scale-in'
                  : 'bg-red-900/20 text-red-400 border border-red-500/20'
              }`}>
                {feedback.success ? '✓' : '✗'} {feedback.text}
              </div>
            )}
          </form>
        </div>
      )}
    </div>
  );
}
