// src/components/ObjectivePanel.jsx
import { useGame } from '../context/GameContext';

export default function ObjectivePanel() {
  const { getCurrentObjective, status } = useGame();
  const objective = getCurrentObjective();

  return (
    <div className="glass-panel rounded-lg p-3 border-l-2 border-cyan-500 animate-slide-down">
      <div className="text-[10px] font-mono text-slate-500 tracking-widest mb-1">
        CURRENT OBJECTIVE
      </div>
      <div className="text-sm font-mono text-cyan-300 leading-5">
        {status === 'completed'
          ? '✓ SYSTEM RESTORATION COMPLETE'
          : objective || 'Awaiting instructions...'}
      </div>
    </div>
  );
}
