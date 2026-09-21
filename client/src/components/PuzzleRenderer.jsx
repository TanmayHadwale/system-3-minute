import { useState, useEffect } from 'react';

// Specific Puzzle Type Components (can be broken out later if large)

function McqPuzzle({ puzzle, onSubmit, isRestored }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {puzzle.data.options.map((opt, i) => (
        <button
          key={i}
          onClick={() => onSubmit(opt)}
          disabled={isRestored}
          className="bg-slate-800 hover:bg-slate-700 disabled:opacity-50 border border-slate-700 p-4 rounded text-left transition-colors font-mono"
        >
          {opt}
        </button>
      ))}
    </div>
  );
}

function InputPuzzle({ puzzle, onSubmit, isRestored, placeholder = "ENTER SOLUTION" }) {
  const [answer, setAnswer] = useState('');
  return (
    <div className="flex gap-4">
       <input 
         type="text" 
         value={answer}
         onChange={e => setAnswer(e.target.value)}
         placeholder={placeholder}
         className="flex-1 bg-black border border-slate-700 p-3 rounded text-white font-mono"
         disabled={isRestored}
       />
       <button 
         onClick={() => onSubmit(answer)}
         disabled={isRestored || !answer.trim()}
         className="bg-[var(--color-accent)] px-8 rounded text-white font-bold disabled:opacity-50"
       >
         SUBMIT
       </button>
    </div>
  );
}

function CodeRepairPuzzle({ puzzle, onSubmit, isRestored }) {
  const parts = puzzle.data.code.split('______');
  const [answer, setAnswer] = useState('');
  
  return (
    <div className="bg-black border border-slate-700 p-4 rounded font-mono text-slate-300">
      <div className="mb-4">
        {parts[0]}
        <input 
          type="text" 
          value={answer}
          onChange={e => setAnswer(e.target.value)}
          className="bg-slate-800 text-[var(--color-accent)] border border-slate-600 px-2 py-1 w-24 mx-2 text-center rounded outline-none focus:border-[var(--color-accent)]"
          disabled={isRestored}
        />
        {parts[1]}
      </div>
      <button 
        onClick={() => onSubmit(answer)}
        disabled={isRestored || !answer.trim()}
        className="bg-[var(--color-accent)] px-6 py-2 rounded text-white font-bold disabled:opacity-50 w-full"
      >
        APPLY FIX
      </button>
    </div>
  );
}

function FirewallSortPuzzle({ puzzle, onSubmit, isRestored }) {
  // A simplified drag and drop using clicks for simplicity and reliability
  const [assignments, setAssignments] = useState({}); // packetId -> 'ALLOW' or 'BLOCK'
  
  const handleAssign = (id, zone) => {
    if (isRestored) return;
    setAssignments(prev => ({...prev, [id]: zone}));
  };
  
  const handleVerify = () => {
    // Generate comma separated string like 'BLOCK,ALLOW,BLOCK,ALLOW'
    const res = puzzle.data.packets.map(p => assignments[p.id] || 'UNASSIGNED').join(',');
    onSubmit(res);
  };
  
  return (
    <div className="flex flex-col gap-4 font-mono">
       <div className="grid grid-cols-2 gap-4">
         <div className="border border-green-500 bg-green-900/20 p-4 rounded min-h-[150px]">
            <h3 className="text-green-400 mb-2 border-b border-green-500/50 pb-1">ALLOW / SAFE</h3>
            {puzzle.data.packets.filter(p => assignments[p.id] === 'ALLOW').map(p => (
              <div key={p.id} onClick={() => handleAssign(p.id, null)} className="bg-slate-800 p-2 text-xs mb-1 cursor-pointer hover:bg-red-900/50">{p.label} (Click to remove)</div>
            ))}
         </div>
         <div className="border border-red-500 bg-red-900/20 p-4 rounded min-h-[150px]">
            <h3 className="text-red-400 mb-2 border-b border-red-500/50 pb-1">BLOCK / INJECTION</h3>
            {puzzle.data.packets.filter(p => assignments[p.id] === 'BLOCK').map(p => (
              <div key={p.id} onClick={() => handleAssign(p.id, null)} className="bg-slate-800 p-2 text-xs mb-1 cursor-pointer hover:bg-red-900/50">{p.label} (Click to remove)</div>
            ))}
         </div>
       </div>
       
       <div className="bg-black p-4 rounded border border-slate-700">
         <h3 className="text-slate-400 mb-2 text-sm">INCOMING QUEUE:</h3>
         <div className="flex flex-wrap gap-2">
           {puzzle.data.packets.filter(p => !assignments[p.id]).map(p => (
             <div key={p.id} className="flex gap-1 border border-slate-600 rounded bg-slate-800 overflow-hidden items-center text-xs">
               <span className="p-2 text-slate-300">{p.label}</span>
               <button onClick={() => handleAssign(p.id, 'ALLOW')} className="px-2 py-2 bg-green-700 hover:bg-green-600">A</button>
               <button onClick={() => handleAssign(p.id, 'BLOCK')} className="px-2 py-2 bg-red-700 hover:bg-red-600">B</button>
             </div>
           ))}
         </div>
       </div>
       
       <button 
         onClick={handleVerify}
         disabled={isRestored || Object.keys(assignments).length !== puzzle.data.packets.length}
         className="bg-[var(--color-accent)] p-3 rounded text-white font-bold disabled:opacity-50 mt-2"
       >
         ENFORCE RULES
       </button>
    </div>
  );
}

function LogInvestigationPuzzle({ puzzle, onSubmit, isRestored }) {
  return (
    <div className="font-mono h-full flex flex-col">
      <div className="flex-1 bg-black border border-slate-700 p-4 rounded overflow-y-auto mb-4">
        {puzzle.data.lines.map((line, i) => (
          <div 
            key={i}
            onClick={() => {
               // naive extraction of a notable part, or just exact match
               // For l1, solution is 'admin_shadow'
               // If clicked, we just submit the line and backend checks if it contains solution? 
               // Wait, the backend strictly checks `answer === solution`.
               // Let's just submit the line text or specific match.
               // We will use an input puzzle instead, OR we prompt them to type.
               // Let's just submit the line itself and if solution is IN the line, we might need a custom check on backend.
               // Actually, `solution: 'admin_shadow'`. Let's just submit the line and in backend we check `line.includes(solution)`.
               // But backend does: String(answer) === String(solution).
               // So if they click a line, we just submit the exact word they need, but how do we know which word?
               // Let's just render it as an input puzzle for simplicity, but display the lines!
            }}
            className="py-1 text-slate-400"
          >
            {line}
          </div>
        ))}
      </div>
      <InputPuzzle puzzle={puzzle} onSubmit={onSubmit} isRestored={isRestored} placeholder="EXTRACT TARGET ID" />
    </div>
  );
}

function MemoryFragmentPuzzle({ puzzle, onSubmit, isRestored }) {
  const [phase, setPhase] = useState('idle'); // idle -> showing -> input
  
  const start = () => {
    setPhase('showing');
    setTimeout(() => {
      setPhase('input');
    }, puzzle.data.timeMs || 1500);
  };
  
  if (phase === 'idle') {
    return <button onClick={start} disabled={isRestored} className="p-4 bg-slate-800 rounded border border-slate-600 w-full hover:bg-slate-700">INITIATE MEMORY RECALL</button>;
  }
  
  if (phase === 'showing') {
    return <div className="text-4xl text-center p-12 bg-black border border-[var(--color-accent)] text-[var(--color-accent)] animate-pulse rounded glitch">{puzzle.data.flashText}</div>;
  }
  
  return <InputPuzzle puzzle={puzzle} onSubmit={onSubmit} isRestored={isRestored} placeholder="ENTER MEMORIZED PATTERN" />;
}

function CodeOutputPuzzle({ puzzle, onSubmit, isRestored }) {
  return (
    <div className="flex flex-col gap-4">
      <pre className="bg-black border border-slate-700 p-4 rounded text-slate-300 overflow-x-auto text-sm font-mono">
        {puzzle.data.code}
      </pre>
      <InputPuzzle puzzle={puzzle} onSubmit={onSubmit} isRestored={isRestored} placeholder="EXPECTED OUTPUT" />
    </div>
  );
}

function NetworkNodesPuzzle({ puzzle, onSubmit, isRestored }) {
  // Simplified path entry
  return (
    <div className="flex flex-col gap-4">
      <div className="bg-black p-4 border border-slate-700 rounded font-mono text-sm text-slate-400">
         <p className="mb-2">AVAILABLE NODES: {puzzle.data.nodes.join(', ')}</p>
         <p>CONNECTIONS:</p>
         <ul className="list-disc pl-6">
           {puzzle.data.edges.map((e, i) => <li key={i}>{e[0]} &lt;--&gt; {e[1]}</li>)}
         </ul>
      </div>
      <InputPuzzle puzzle={puzzle} onSubmit={onSubmit} isRestored={isRestored} placeholder="ENTER PATH (e.g. 1-2-3)" />
    </div>
  );
}

// Main Router Component
export default function PuzzleRenderer({ module, puzzle, game, status }) {
  const [feedback, setFeedback] = useState(null);
  const [animating, setAnimating] = useState(true);

  const isRestored = status === 'RESTORED';

  useEffect(() => {
    setAnimating(true);
    setFeedback(null);
    const timer = setTimeout(() => {
      setAnimating(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, [puzzle.id]);

  if (status === 'LOCKED') {
    let req = '';
    if (module === 'database') req = 'LOGS_FRAGMENT';
    if (module === 'frontend') req = 'DATABASE_FRAGMENT';
    if (module === 'logic') req = 'FRONTEND_FRAGMENT';
    return (
      <div className="flex flex-col items-center justify-center h-full text-red-500 font-mono animate-fade-in">
         <span className="text-xl mb-2 text-center">✕ ACCESS RESTRICTED</span>
         <span className="text-sm">REQUIRED: {req}</span>
      </div>
    );
  }

  const handleSubmit = async (answer) => {
    if (isRestored) return;
    
    const res = await game.submitPuzzle(module, answer);
    
    if (res.success) {
      setFeedback({ type: 'success', msg: '✓ SECURITY CHECK PASSED' });
      setTimeout(() => {
        setFeedback({ type: 'success', msg: `CLUE DISCOVERED: ${res.reward?.key} = ${res.reward?.value}` });
      }, 1500);
    } else {
      setFeedback({ type: 'error', msg: `✕ ACCESS DENIED - STABILITY PENALTY APPLIED` });
      // Shake animation effect could be added here
    }
  };

  if (animating && !isRestored) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-[var(--color-accent)] font-mono">
        <div className="animate-pulse mb-2">ANALYZING SYSTEM...</div>
        <div className="animate-pulse opacity-75">GENERATING CHALLENGE: {puzzle.type.toUpperCase()}</div>
      </div>
    );
  }

  const renderContent = () => {
    const props = { puzzle, onSubmit: handleSubmit, isRestored };
    
    switch (puzzle.type) {
      case 'mcq': return <McqPuzzle {...props} />;
      case 'code_repair': return <CodeRepairPuzzle {...props} />;
      case 'firewall_sort': return <FirewallSortPuzzle {...props} />;
      case 'log_investigation': return <LogInvestigationPuzzle {...props} />;
      case 'memory_fragment': return <MemoryFragmentPuzzle {...props} />;
      case 'code_output': return <CodeOutputPuzzle {...props} />;
      case 'network_nodes': return <NetworkNodesPuzzle {...props} />;
      // Fallbacks that can just use generic input if no custom ui
      case 'data_investigation':
      case 'sequence_pattern':
      case 'terminal_investigation':
      case 'ui_investigation':
      default:
         return (
           <div className="flex flex-col gap-4">
             {puzzle.data && typeof puzzle.data === 'object' && puzzle.data.rows && (
               <table className="w-full text-left text-sm mb-4 border border-slate-800 font-mono">
                 <thead className="bg-slate-800 text-slate-400">
                   <tr>{Object.keys(puzzle.data.rows[0] || {}).map(k => <th key={k} className="p-2 uppercase">{k}</th>)}</tr>
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
             <InputPuzzle {...props} />
           </div>
         );
    }
  };

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
        <p className="text-lg text-slate-300 mb-8 border-l-4 border-[var(--color-accent)] pl-4">{puzzle.instructions}</p>
        
        {renderContent()}
      </div>

      {feedback && (
        <div className={`p-4 border rounded animate-slide-in mb-4 ${feedback.type === 'success' ? 'bg-green-900/30 border-green-500 text-green-400' : 'bg-red-900/30 border-red-500 text-red-400'}`}>
          {feedback.msg}
        </div>
      )}
      
      {isRestored && !feedback && (
        <div className="p-4 bg-green-900/30 border border-green-500 text-green-400 rounded animate-fade-in mb-4">
           ✓ MODULE RESTORED
        </div>
      )}
    </div>
  );
}
