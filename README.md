# SYSTEM: 3:00

A full-stack browser game built for a 3-hour hackathon. The interface is the game: solve interconnected puzzles embedded directly into the system's UI to restore CORE-IT before the timer runs out.

## Project Structure
- `/server`: Node.js + Express backend with SQLite database
- `/client`: React + Vite + Tailwind CSS frontend

## Prerequisites
- Node.js (v18+ recommended)
- npm

## Setup & Run Instructions

### 1. Backend Setup
1. Navigate to the `server` directory:
   \`\`\`bash
   cd system-300/server
   \`\`\`
2. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`
3. (Optional) Configure environment variables. A default `.env` is already created from `.env.example`.
4. Start the server:
   \`\`\`bash
   npm start
   # or for dev mode: npm run dev (nodemon)
   \`\`\`
   The server will run on https://system-3-minute.onrender.com/
### 2. Frontend Setup
1. Navigate to the `client` directory:
   \`\`\`bash
   cd system-300/client
   \`\`\`
2. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`
3. Start the Vite dev server:
   \`\`\`bash
   npm run dev
   \`\`\`
   The client will run on https://system-3-minute.vercel.app/

### 3. Play
Open https://system-3-minute.vercel.app/ in your browser and attempt to save CORE-IT!

## Gameplay Flow
1. Start the system by entering an operator ID.
2. Read the briefing, then enter the dashboard.
3. Investigate the **SYSTEM LOGS** to find an anomalous login and a log fragment.
4. Use that information to identify the compromised account in the **DATABASE**.
5. Discover the hidden hex code in the **FRONTEND** module using the inspector.
6. Fix the **LOGIC ENGINE** and test it with the decoded ID from the frontend.
7. Restore the **SYSTEM CORE** to win the game.
