const db = require('./src/database/db');

db.serialize(() => {
  db.run("ALTER TABLE game_sessions ADD COLUMN seed TEXT", (err) => {
    if (err) console.log(err.message);
    else console.log("Added seed column");
  });
  db.run("ALTER TABLE game_sessions ADD COLUMN puzzles TEXT", (err) => {
    if (err) console.log(err.message);
    else console.log("Added puzzles column");
  });
});
