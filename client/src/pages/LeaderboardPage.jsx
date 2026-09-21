// src/pages/LeaderboardPage.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';

function formatTime(secs) {
  if (!secs && secs !== 0) return '--:--';
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

const MEDAL = ['🥇', '🥈', '🥉'];

export default function LeaderboardPage() {
  const navigate = useNavigate();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const [confirmClear, setConfirmClear] = useState(false);
  const [clearing, setClearing]         = useState(false);
  const [clearedMsg, setClearedMsg]     = useState(false);

  useEffect(() => {
    api.getLeaderboard()
      .then(data => { setEntries(Array.isArray(data) ? data : []); })
      .catch(() => setError('Could not load leaderboard. Backend may be offline.'))
      .finally(() => setLoading(false));
  }, []);

  const handleClearScores = async () => {
    if (!confirmClear) {
      setConfirmClear(true);
      setTimeout(() => setConfirmClear(false), 4000);
      return;
    }

    setClearing(true);
    try {
      await api.clearLeaderboard();
      setEntries([]);
      setConfirmClear(false);
      setClearedMsg(true);
      setTimeout(() => setClearedMsg(false), 3000);
    } catch {
      setError('Failed to clear leaderboard.');
    } finally {
      setClearing(false);
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-6 select-none"
      style={{ background: 'var(--color-darker)' }}
    >
      <div className="glass neon-border rounded-xl p-8 max-w-2xl w-full animate-scale-in">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-mono font-black text-2xl text-cyan-400 text-glow-cyan tracking-widest">
              LEADERBOARD
            </h1>
            <div className="text-[10px] font-mono text-slate-500 tracking-widest mt-1">
              TOP OPERATORS — SYSTEM: 3:00
            </div>
          </div>
          <button
            onClick={() => navigate('/')}
            className="btn-secondary text-xs py-2 px-4 cursor-pointer"
          >
            ← HOME
          </button>
        </div>

        {/* Status Messages */}
        {clearedMsg && (
          <div className="mb-4 p-3 bg-green-950/40 border border-green-400/40 rounded-lg text-center font-mono text-xs font-bold text-green-300 animate-slide-up">
            ✓ ALL LEADERBOARD RECORDS HAVE BEEN CLEARED
          </div>
        )}

        {/* Table */}
        {loading && (
          <div className="text-center py-12 font-mono text-cyan-400 animate-pulse">
            LOADING SCORES...
          </div>
        )}

        {error && (
          <div className="text-center py-12 font-mono text-slate-500 text-sm">
            {error}
          </div>
        )}

        {!loading && !error && (
          <>
            {/* Header row */}
            <div className="grid grid-cols-12 gap-2 px-3 py-2 text-[10px] font-mono text-slate-600 tracking-widest border-b border-slate-800">
              <div className="col-span-1">#</div>
              <div className="col-span-5">OPERATOR</div>
              <div className="col-span-3 text-right">SCORE</div>
              <div className="col-span-3 text-right">TIME</div>
            </div>

            {entries.length === 0 ? (
              <div className="text-center py-12 font-mono text-slate-600">
                No scores recorded. Be the first to restore the system!
              </div>
            ) : (
              <div className="divide-y divide-slate-800/50">
                {entries.map((entry, i) => (
                  <div
                    key={i}
                    className="grid grid-cols-12 gap-2 px-3 py-3 font-mono text-sm items-center transition-colors hover:bg-slate-800/30 animate-slide-up"
                    style={{ animationDelay: `${i * 40}ms` }}
                  >
                    <div className="col-span-1 font-bold text-slate-500">
                      {MEDAL[i] || `#${i + 1}`}
                    </div>
                    <div className="col-span-5 text-slate-300 truncate">
                      {entry.player_name || 'Unknown'}
                    </div>
                    <div className={`col-span-3 text-right font-bold ${
                      i === 0 ? 'text-yellow-400 text-glow-cyan' : 'text-white'
                    }`}>
                      {Number(entry.score).toLocaleString()}
                    </div>
                    <div className="col-span-3 text-right text-slate-400">
                      {formatTime(entry.completion_time)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Footer Actions */}
        <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between gap-3">
          <button
            onClick={() => navigate('/')}
            className="btn-primary text-sm py-2.5 px-6 cursor-pointer"
          >
            ▶ PLAY NOW
          </button>

          {/* Clear Scores Button */}
          {entries.length > 0 && (
            <button
              onClick={handleClearScores}
              disabled={clearing}
              className={`text-xs font-mono font-bold px-4 py-2 rounded-lg border transition-all cursor-pointer active:scale-95 ${
                confirmClear
                  ? 'border-red-500 bg-red-950 text-red-300 animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.5)]'
                  : 'border-slate-700 bg-slate-900/60 text-slate-400 hover:border-red-500/60 hover:text-red-400'
              }`}
            >
              {clearing
                ? 'CLEARING...'
                : confirmClear
                ? '⚠ CONFIRM CLEAR ALL?'
                : '🗑 CLEAR SCORES'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
