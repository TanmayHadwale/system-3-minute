import { useState, useEffect } from 'react';

const LOG_LINES = [
  "09:41:02 USER LOGIN — operator_1",
  "09:41:08 DATABASE QUERY — SELECT * FROM users",
  "09:41:13 ACCESS DENIED — operator_1",
  "09:41:17 ADMIN LOGIN — admin_shadow",
  "09:41:21 FILE MODIFIED — core_config.sys",
  "09:41:24 FRAGMENT DETECTED: 7-4-?-9",
  "09:41:27 SYSTEM LOCK ENGAGED"
];

export default function LogsPuzzle({ game }) {
  const [inspected, setInspected] = useState(null);
  
  const hasClue = game.gameState.progress.logs?.clues.includes('LOG_KEY');

  const handleLineClick = async (line, index) => {
    if (hasClue) return; // already solved
    
    if (line.includes('admin_shadow') || line.includes('FRAGMENT')) {
      const res = await game.submitPuzzle('logs', 'admin_shadow');
      // Wait, earlier I used submitClue. Now puzzles are validated. 
      // The puzzle pool has `correctAnswer: 'admin_shadow'`.
      // The old submitClue bypasses the score logic of puzzles. 
      // I will just use submitPuzzle.
      if (res.success) {
         setInspected(`CLUE DISCOVERED: LOG_KEY. Investigate database for 'admin_shadow'`);
      }
    } else {
      game.submitAction('logs', 'inspect', true); // no penalty for looking
      setInspected("Nothing unusual here.");
    }
  };

  const [linesToShow, setLinesToShow] = useState(1);
  
  useEffect(() => {
    if (linesToShow < LOG_LINES.length) {
       const t = setTimeout(() => setLinesToShow(l => l + 1), 500);
       return () => clearTimeout(t);
    }
  }, [linesToShow]);

  return (
    <div className="font-mono h-full flex flex-col">
      <h2 className="text-xl text-white mb-4">SYSTEM LOGS</h2>
      <div className="flex-1 bg-black border border-slate-700 p-4 rounded overflow-y-auto">
        {LOG_LINES.slice(0, linesToShow).map((line, i) => (
          <div 
            key={i}
            onClick={() => handleLineClick(line, i)}
            className={`py-1 cursor-pointer hover:bg-slate-800 px-2 transition-colors animate-fade-in
              ${line.includes('admin_shadow') || line.includes('FRAGMENT') ? 'text-red-400 hover:text-red-300 glitch' : 'text-slate-400'}
            `}
          >
            {line}
          </div>
        ))}
      </div>
      
      {inspected && (
        <div className="mt-4 p-3 bg-slate-800 border border-[var(--color-accent)] text-[var(--color-accent)] rounded">
          {inspected}
        </div>
      )}
      
      {hasClue && (
         <div className="mt-4 p-3 bg-green-900/50 border border-green-500 text-green-400 rounded">
          MODULE RESTORED: Fragment identified.
        </div>
      )}
    </div>
  );
}
