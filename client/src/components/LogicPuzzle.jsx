import { useState } from 'react';

export default function LogicPuzzle({ game, status }) {
  const [fixed, setFixed] = useState(false);
  const [adminId, setAdminId] = useState('');
  const [feedback, setFeedback] = useState(null);
  
  const isRestored = status === 'RESTORED';
  
  if (status === 'LOCKED') {
    return <div className="text-red-500 font-mono">MODULE LOCKED. FRONTEND KEY REQUIRED.</div>;
  }

  const handleFixCode = () => {
    setFixed(true);
    game.submitAction('logic', 'code_fix', true);
  };

  const handleTest = async (e) => {
    e.preventDefault();
    if (isRestored) return;
    
    if (!fixed) {
       setFeedback("Fix the logic error before testing.");
       return;
    }
    
    const res = await game.submitPuzzle('logic', adminId);
    if (res.success) {
       setFeedback(`CORRECT. Logic Engine Restored. CLUE DISCOVERED: ${res.reward || 'LOGIC_KEY'}`);
    } else {
       setFeedback("TEST FAILED. Invalid Admin ID. Integrity penalty applied.");
    }
  };

  return (
    <div className="font-mono h-full flex flex-col">
      <h2 className="text-xl text-white mb-4">LOGIC ENGINE</h2>
      
      <div className="bg-black p-4 rounded border border-slate-700 text-slate-300 font-mono text-sm whitespace-pre-wrap mb-4">
{`function validateAccess(user) {
  // Identify the critical flaw
  if (user.role ${fixed ? '===' : '='} "admin") {
    return true;
  }
  return false;
}`}
      </div>
      
      {!fixed && !isRestored && (
        <button 
          onClick={handleFixCode}
          className="bg-yellow-600/50 hover:bg-yellow-600 text-white px-4 py-2 rounded self-start mb-8 transition-colors border border-yellow-500"
        >
          FIX ASSIGNMENT OPERATOR (= to ===)
        </button>
      )}

      {fixed && (
        <div className="glass-panel p-6 border border-[var(--color-accent)] rounded">
           <h3 className="text-lg text-[var(--color-accent)] mb-2">RUN LOGIC TEST</h3>
           <p className="text-sm text-slate-400 mb-4">Provide a valid Admin ID to verify the patch.</p>
           
           <form onSubmit={handleTest} className="flex gap-4">
             <input 
               type="text" 
               value={adminId}
               onChange={e => setAdminId(e.target.value)}
               placeholder="ENTER ADMIN ID" 
               className="flex-1 bg-black border border-slate-700 p-2 rounded text-white"
               disabled={isRestored}
             />
             <button 
               type="submit"
               disabled={isRestored || !adminId.trim()}
               className="bg-[var(--color-accent)] px-6 py-2 rounded text-white font-bold disabled:opacity-50"
             >
               EXECUTE TEST
             </button>
           </form>
           
           {feedback && (
            <div className={`mt-4 p-3 border rounded ${feedback.startsWith('CORRECT') ? 'bg-green-900/50 border-green-500 text-green-400' : 'bg-red-900/50 border-red-500 text-red-400'}`}>
              {feedback}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
