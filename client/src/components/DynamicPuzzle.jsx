import { useState, useEffect } from 'react';

export default function DynamicPuzzle({ module, puzzle, game, status, onPuzzleComplete }) {
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [animating, setAnimating] = useState(true);

  const isRestored = status === 'RESTORED';

  useEffect(() => {
    // Puzzle generation feel
    setAnimating(true);
    const timer = setTimeout(() => {
      setAnimating(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, [puzzle.id]);

  if (status === 'LOCKED') {
    let req = '';
    if (module === 'database') req = 'LOG_KEY';
    if (module === 'frontend') req = 'DB_KEY';
    if (module === 'logic') req = 'FRONTEND_KEY';
    return (
      <div className="flex flex-col items-center justify-center h-full text-red-500 font-mono animate-fade-in">
         <span className="text-xl mb-2 text-center">✕ ACCESS RESTRICTED</span>
         <span className="text-sm">REQUIRED: {req}</span>
      </div>
    );
  }

  const handleSubmit = async (val) => {
    if (isRestored) return;
    
    const submittedAnswer = val !== undefined ? val : answer;
    const res = await game.submitPuzzle(module, submittedAnswer);
    
    if (res.success) {
      setFeedback({ type: 'success', msg: '✓ ACCESS GRANTED - SECURITY CHECK PASSED' });
      setTimeout(() => {
        setFeedback({ type: 'success', msg: `CLUE DISCOVERED: ${res.reward}` });
      }, 1500);
    } else {
      setFeedback({ type: 'error', msg: `✕ ACCESS DENIED - STABILITY PENALTY APPLIED` });
    }
  };

  if (animating && !isRestored) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-[var(--color-accent)] font-mono">
        <div className="animate-pulse mb-2">ANALYZING SYSTEM...</div>
        <div className="animate-pulse opacity-75">GENERATING SECURITY CHALLENGE...</div>
      </div>
    );
  }

  return (
    <div className="font-mono h-full flex flex-col animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl text-white uppercase">{module} MODULE</h2>
        <span className={`px-2 py-1 text-xs border rounded ${
           puzzle.difficulty === 'hard' ? 'text-red-400 border-red-500' :
           puzzle.difficulty === 'medium' ? 'text-yellow-400 border-yellow-500' :
           'text-green-400 border-green-500'
        }`}>
          {puzzle.difficulty.toUpperCase()}
        </span>
      </div>

      <div className="glass-panel p-6 border border-slate-700 rounded mb-6 flex-1 overflow-y-auto">
        <p className="text-lg text-slate-300 mb-6">{puzzle.prompt}</p>

        {puzzle.data && typeof puzzle.data === 'string' && (
           <div className="bg-black p-4 rounded border border-slate-800 text-slate-400 text-sm whitespace-pre-wrap mb-6">
             {puzzle.data}
           </div>
        )}
        
        {puzzle.data && puzzle.data.rows && (
          <table className="w-full text-left text-sm mb-6 border border-slate-800">
             <thead className="bg-slate-800 text-slate-400">
               <tr>
                 {Object.keys(puzzle.data.rows[0] || {}).map(k => <th key={k} className="p-2 uppercase">{k}</th>)}
               </tr>
             </thead>
             <tbody>
                {puzzle.data.rows.map((row, i) => (
                  <tr key={i} className="border-t border-slate-800">
                    {Object.values(row).map((v, j) => <td key={j} className="p-2 text-slate-300">{v}</td>)}
                  </tr>
                ))}
             </tbody>
          </table>
        )}

        {puzzle.options && puzzle.options.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {puzzle.options.map((opt, i) => (
              <button
                key={i}
                onClick={() => handleSubmit(opt)}
                disabled={isRestored}
                className="bg-slate-800 hover:bg-slate-700 disabled:opacity-50 border border-slate-700 p-4 rounded text-left transition-colors"
              >
                {opt}
              </button>
            ))}
          </div>
        ) : (
          <div className="flex gap-4">
             <input 
               type="text" 
               value={answer}
               onChange={e => setAnswer(e.target.value)}
               placeholder="ENTER SOLUTION" 
               className="flex-1 bg-black border border-slate-700 p-3 rounded text-white"
               disabled={isRestored}
             />
             <button 
               onClick={() => handleSubmit(answer)}
               disabled={isRestored || !answer.trim()}
               className="bg-[var(--color-accent)] px-8 rounded text-white font-bold disabled:opacity-50"
             >
               SUBMIT
             </button>
          </div>
        )}
      </div>

      {feedback && (
        <div className={`p-4 border rounded animate-slide-in ${feedback.type === 'success' ? 'bg-green-900/30 border-green-500 text-green-400' : 'bg-red-900/30 border-red-500 text-red-400'}`}>
          {feedback.msg}
        </div>
      )}
      
      {isRestored && !feedback && (
        <div className="p-4 bg-green-900/30 border border-green-500 text-green-400 rounded animate-fade-in">
           ✓ MODULE RESTORED
        </div>
      )}
    </div>
  );
}
