import { useState } from 'react';

const DB_ROWS = [
  { id: '101', name: 'operator_1', role: 'USER', access: 'LIMITED', status: 'ACTIVE' },
  { id: '102', name: 'tech_support', role: 'SUPPORT', access: 'MODERATE', status: 'ACTIVE' },
  { id: '103', name: 'admin_shadow', role: 'ADMIN', access: 'FULL', status: 'ACTIVE' },
  { id: '104', name: 'sys_process', role: 'SYSTEM', access: 'FULL', status: 'INACTIVE' },
  { id: '105', name: 'operator_2', role: 'USER', access: 'LIMITED', status: 'ACTIVE' },
];

export default function DatabasePuzzle({ game, status }) {
  const [feedback, setFeedback] = useState(null);
  
  const isRestored = status === 'RESTORED';
  const isCorrupted = status === 'CORRUPTED'; // Means it's unlocked but not solved
  
  if (status === 'LOCKED') {
    return <div className="text-red-500 font-mono">MODULE LOCKED. PREREQUISITE CLUE REQUIRED.</div>;
  }

  const handleRowClick = async (row) => {
    if (isRestored) return;
    
    if (confirm(`Flag ${row.name} as the suspicious record?`)) {
       const isCorrect = row.name === 'admin_shadow';
       const res = await game.submitPuzzle('database', row.name);
       
       if (res.success) {
         setFeedback(`CORRECT. Record identified. CLUE DISCOVERED: ${res.reward || 'DB_KEY'}`);
       } else {
         setFeedback("INCORRECT. Integrity penalty applied.");
       }
    }
  };

  return (
    <div className="font-mono h-full flex flex-col">
      <h2 className="text-xl text-white mb-4">DATABASE RECORDS</h2>
      
      {!isRestored && <p className="text-slate-400 mb-4">Identify the compromised account based on recent logs.</p>}
      
      <div className="bg-black border border-slate-700 rounded overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-800 text-slate-400">
            <tr>
              <th className="p-2">USER_ID</th>
              <th className="p-2">NAME</th>
              <th className="p-2">ROLE</th>
              <th className="p-2">ACCESS</th>
              <th className="p-2">STATUS</th>
            </tr>
          </thead>
          <tbody>
            {DB_ROWS.map(row => (
              <tr 
                key={row.id} 
                className="border-t border-slate-800 hover:bg-slate-800/50 cursor-pointer text-slate-300"
                onClick={() => handleRowClick(row)}
              >
                <td className="p-2">{row.id}</td>
                <td className="p-2">{row.name}</td>
                <td className="p-2">{row.role}</td>
                <td className="p-2">{row.access}</td>
                <td className="p-2">{row.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {feedback && (
        <div className={`mt-4 p-3 border rounded ${feedback.startsWith('CORRECT') ? 'bg-green-900/50 border-green-500 text-green-400' : 'bg-red-900/50 border-red-500 text-red-400'}`}>
          {feedback}
        </div>
      )}
    </div>
  );
}
