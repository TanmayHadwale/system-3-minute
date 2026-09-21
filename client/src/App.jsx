// src/App.jsx
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { GameProvider, useGame } from './context/GameContext';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import ResultScreen from './pages/ResultScreen';
import LeaderboardPage from './pages/LeaderboardPage';

// Redirect to /result only while actively playing (timer expired mid-game).
// Does NOT trap the user there once they navigate away intentionally.
function GameWatcher() {
  const { status } = useGame();
  const navigate   = useNavigate();
  const location   = useLocation();

  useEffect(() => {
    // Only auto-redirect when on the /game route and the game just ended
    const onGamePage = location.pathname === '/game';
    if (onGamePage && (status === 'completed' || status === 'game_over')) {
      navigate('/result', { replace: true });
    }
  }, [status, location.pathname, navigate]);

  return null; // render nothing
}

export default function App() {
  return (
    <GameProvider>
      <Router>
        {/* CRT / scanline overlays */}
        <div className="crt-overlay" />
        <div className="scanline" />

        {/* Watcher — only redirects from /game when game ends */}
        <GameWatcher />

        <div className="relative z-10 min-h-screen flex flex-col">
          <Routes>
            <Route path="/"            element={<Landing />} />
            <Route path="/game"        element={<Dashboard />} />
            <Route path="/result"      element={<ResultScreen />} />
            <Route path="/leaderboard" element={<LeaderboardPage />} />
            <Route path="*"            element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Router>
    </GameProvider>
  );
}
