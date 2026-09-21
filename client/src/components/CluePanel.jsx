// src/components/CluePanel.jsx
import { useGame } from '../context/GameContext';

export default function CluePanel() {
  const { clues } = useGame();

  return (
    <div className="glass-panel rounded-lg p-3">
      <div className="text-[10px] font-mono text-slate-500 tracking-widest mb-2">
        CLUES DISCOVERED {clues.length > 0 && `(${clues.length})`}
      </div>
      {clues.length === 0 ? (
        <div className="text-xs font-mono text-slate-600 italic">
          None yet — investigate modules.
        </div>
      ) : (
        <div className="flex flex-col gap-1.5">
          {clues.map((clue, i) => (
            <div
              key={clue.key}
              className="clue-card animate-slide-up"
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <div className="text-[10px] font-mono text-slate-500">{clue.label}</div>
              <div className="text-sm font-mono font-bold text-cyan-300 tracking-wider">
                {clue.value}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
