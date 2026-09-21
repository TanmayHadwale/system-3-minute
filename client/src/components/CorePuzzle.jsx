import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function CorePuzzle({ game, timeRemaining, status }) {
  const [restoring, setRestoring] = useState(false);
  const [progress, setProgress] = useState(0);
  const [step, setStep] = useState(0);
  const [finalCode, setFinalCode] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  
  if (status === 'LOCKED') {
    return (
      <div className="flex items-center justify-center h-full flex-col">
        <div className="text-red-500 font-mono text-xl mb-4 text-center">
           SYSTEM CORE LOCKED<br/>ALL KEYS REQUIRED FOR RESTORATION
        </div>
      </div>
    );
  }

  const handleRestore = (e) => {
    e.preventDefault();
    
    // Validate final code. We concatenate all fragment values.
    // e.g. "402-912-321-122" or similar. Actually we can just check if all clue values are present in the string.
    const allClues = Object.values(game.gameState.progress).reduce((acc, p) => [...acc, ...p.clues], []);
    const isValid = allClues.every(c => finalCode.includes(c.value));
    
    if (!isValid) {
      setError("INVALID ACCESS CODE. VERIFY ALL FRAGMENTS.");
      game.submitAction('core', 'failed_restore_attempt');
      return;
    }
    
    setError(null);
    setRestoring(true);
    
    // Fake progress bar and cinematic sequence
    const sequence = [
      'AUTHENTICATING...',
      'VERIFYING MODULES...',
      'RESTORING DATABASE...',
      'REBUILDING LOGIC ENGINE...',
      'REPAIRING FRONTEND...',
      'SYSTEM CORE ONLINE'
    ];
    
    let p = 0;
    const interval = setInterval(() => {
      p += 2;
      setProgress(p);
      
      const currentStep = Math.floor((p / 100) * sequence.length);
      setStep(currentStep);
      
      if (p >= 100) {
         clearInterval(interval);
         setTimeout(() => {
           game.finishGame(timeRemaining).then(() => {
              navigate('/result');
           });
         }, 1000);
      }
    }, 50);
  };

  const sequenceMessages = [
    'AUTHENTICATING...',
    'VERIFYING MODULES...',
    'RESTORING DATABASE...',
    'REBUILDING LOGIC ENGINE...',
    'REPAIRING FRONTEND...',
    'SYSTEM CORE ONLINE'
  ];

  return (
    <div className="font-mono h-full flex flex-col items-center justify-center">
      {!restoring ? (
        <div className="text-center glass-panel p-10 border border-green-500 rounded-lg max-w-lg">
          <div className="text-green-400 text-6xl mb-6">✓</div>
          <h2 className="text-2xl text-white mb-4">ALL MODULES RESTORED</h2>
          <p className="text-slate-400 mb-8">
            The final restoration sequence is ready. Enter the 4-part access code derived from the module fragments.
          </p>
          
          <form onSubmit={handleRestore} className="w-full">
            <input 
               type="text" 
               value={finalCode} 
               onChange={e => setFinalCode(e.target.value)}
               placeholder="XXXX-XXXX-XXXX-XXXX"
               className="w-full bg-black border border-green-500 p-4 rounded text-center text-xl text-green-400 mb-4 focus:outline-none focus:shadow-[0_0_15px_rgba(34,197,94,0.5)]"
            />
            {error && <div className="text-red-500 mb-4 animate-shake">{error}</div>}
            <button 
              type="submit"
              disabled={!finalCode.trim()}
              className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-4 px-8 rounded text-xl tracking-widest transition-all shadow-[0_0_20px_rgba(34,197,94,0.3)] disabled:opacity-50"
            >
              INITIATE RESTORATION
            </button>
          </form>
        </div>
      ) : (
        <div className="w-full max-w-xl text-center">
          <h2 className="text-2xl text-[var(--color-accent)] mb-8 animate-pulse">
            {sequenceMessages[Math.min(step, sequenceMessages.length - 1)]}
          </h2>
          <div className="w-full h-8 bg-slate-800 rounded overflow-hidden border border-slate-700 relative">
             <div 
               className="h-full bg-[var(--color-accent)] transition-all duration-75 ease-linear" 
               style={{ width: `${progress}%` }}
             />
             <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white mix-blend-difference">
               {progress}%
             </div>
          </div>
        </div>
      )}
    </div>
  );
}
