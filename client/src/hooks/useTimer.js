import { useState, useEffect, useRef } from 'react';

export function useTimer(initialSeconds, onComplete) {
  const [secondsRemaining, setSecondsRemaining] = useState(initialSeconds);
  const [isRunning, setIsRunning] = useState(false);
  const endTimeRef = useRef(null);
  
  useEffect(() => {
    let intervalId;
    
    if (isRunning) {
      if (!endTimeRef.current) {
         endTimeRef.current = Date.now() + secondsRemaining * 1000;
      }
      
      intervalId = setInterval(() => {
        const remaining = Math.max(0, Math.round((endTimeRef.current - Date.now()) / 1000));
        setSecondsRemaining(remaining);
        
        if (remaining <= 0) {
          setIsRunning(false);
          clearInterval(intervalId);
          if (onComplete) onComplete();
        }
      }, 500);
    }
    
    return () => clearInterval(intervalId);
  }, [isRunning, onComplete]);

  const startTimer = () => setIsRunning(true);
  const stopTimer = () => setIsRunning(false);
  const resetTimer = (newSeconds = initialSeconds) => {
    setIsRunning(false);
    setSecondsRemaining(newSeconds);
    endTimeRef.current = null;
  };

  return {
    secondsRemaining,
    isRunning,
    startTimer,
    stopTimer,
    resetTimer
  };
}
