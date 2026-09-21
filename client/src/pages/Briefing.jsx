import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const STORY = [
  "SYSTEM STATUS: CRITICAL",
  "Unauthorized modification detected.",
  "CORE SYSTEM LOCKDOWN INITIATED.",
  "Operator, you have 3 minutes to restore CORE-IT before full collapse."
];

export default function Briefing() {
  const [lines, setLines] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    if (currentIndex < STORY.length) {
      const timer = setTimeout(() => {
        setLines(prev => [...prev, STORY[currentIndex]]);
        setCurrentIndex(c => c + 1);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [currentIndex]);

  const handleBegin = () => {
    navigate('/dashboard');
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 font-mono">
      <div className="max-w-2xl w-full">
        <div className="space-y-4 mb-10 min-h-[200px]">
          {lines.map((line, i) => (
            <p key={i} className={`text-lg ${i === 0 || i === 2 ? 'text-red-500 font-bold' : 'text-slate-300'}`}>
              &gt; {line}
            </p>
          ))}
          {currentIndex < STORY.length && (
            <span className="inline-block w-3 h-5 bg-cyan-400 animate-pulse"></span>
          )}
        </div>
        
        {currentIndex === STORY.length && (
          <div className="text-center animate-fade-in">
            <button 
              onClick={handleBegin}
              className="border-2 border-[var(--color-accent)] text-[var(--color-accent)] hover:bg-[var(--color-accent)] hover:text-white font-bold py-3 px-8 rounded tracking-widest transition-all"
            >
              BEGIN
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
