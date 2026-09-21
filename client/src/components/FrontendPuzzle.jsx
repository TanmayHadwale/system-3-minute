import { useState } from 'react';

export default function FrontendPuzzle({ game, status }) {
  const [inspectMode, setInspectMode] = useState(false);
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState(null);
  
  const isRestored = status === 'RESTORED';
  
  if (status === 'LOCKED') {
    return <div className="text-red-500 font-mono">MODULE LOCKED. DATABASE KEY REQUIRED.</div>;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isRestored) return;
    
    const res = await game.submitPuzzle('frontend', answer);
    if (res.success) {
      setFeedback(`CORRECT. Frontend restored. CLUE DISCOVERED: ${res.reward || 'FRONTEND_KEY'}`);
    } else {
      setFeedback("INCORRECT DECODE. Integrity penalty applied.");
    }
  };

  return (
    <div className="font-mono h-full flex flex-col items-center">
      <h2 className="text-xl text-white mb-4 self-start">FRONTEND INTERFACE</h2>
      
      <div className="flex w-full gap-4">
        {/* Rendered View */}
        <div className="flex-1 glass-panel p-8 rounded border border-slate-700 relative">
           <h3 className="text-center text-lg mb-6">CORE-IT SECURE ACCESS</h3>
           <div className="space-y-4">
             <input type="text" placeholder="USERNAME" disabled className="w-full bg-slate-800 p-2 rounded opacity-50" />
             <input type="password" placeholder="PASSWORD" disabled className="w-full bg-slate-800 p-2 rounded opacity-50" />
             {/* The broken submit button */}
             <div className="w-full h-10 bg-[var(--color-accent)] opacity-10 rounded cursor-not-allowed flex items-center justify-center">
               SUBMIT
             </div>
           </div>
        </div>

        {/* Inspector Panel */}
        <div className="flex-1 glass-panel border border-slate-700 rounded flex flex-col overflow-hidden">
          <div className="bg-slate-800 p-2 flex justify-between items-center">
            <span className="text-sm">ELEMENT INSPECTOR</span>
            <button 
              onClick={() => setInspectMode(!inspectMode)}
              className="px-3 py-1 bg-slate-700 hover:bg-slate-600 rounded text-xs"
            >
              {inspectMode ? 'CLOSE' : 'INSPECT'}
            </button>
          </div>
          
          <div className="p-4 text-xs text-slate-400 font-mono whitespace-pre-wrap flex-1 bg-black overflow-y-auto">
             {inspectMode ? (
               `<!-- DOM TREE -->
<div>
  <h3>CORE-IT SECURE ACCESS</h3>
  <input type="text" name="username" />
  <input type="password" name="password" />
  
  <!-- INJECTED BY ADMIN_SHADOW -->
  <input type="hidden" id="override_hex" placeholder="4E6F7465" />
  
  <button style="display:none;">SUBMIT</button>
</div>`
             ) : (
               "INSPECTOR OFFLINE. CLICK 'INSPECT' TO VIEW DOM."
             )}
          </div>
        </div>
      </div>
      
      <div className="w-full mt-8 p-6 glass-panel border border-slate-700 rounded">
         <p className="text-sm text-slate-400 mb-4">Decode the hidden hex value to restore the interface.</p>
         <form onSubmit={handleSubmit} className="flex gap-4">
           <input 
             type="text" 
             value={answer}
             onChange={e => setAnswer(e.target.value)}
             placeholder="ENTER DECODED TEXT" 
             className="flex-1 bg-black border border-slate-700 p-2 rounded text-white"
             disabled={isRestored}
           />
           <button 
             type="submit"
             disabled={isRestored || !answer.trim()}
             className="bg-[var(--color-accent)] px-6 py-2 rounded text-white font-bold disabled:opacity-50"
           >
             VERIFY
           </button>
         </form>
         
         {feedback && (
          <div className={`mt-4 p-3 border rounded ${feedback.startsWith('CORRECT') ? 'bg-green-900/50 border-green-500 text-green-400' : 'bg-red-900/50 border-red-500 text-red-400'}`}>
            {feedback}
          </div>
        )}
      </div>
    </div>
  );
}
