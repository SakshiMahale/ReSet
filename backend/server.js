const express = require('express'), cors = require('cors'), crypto = require('crypto');
const Database = require('better-sqlite3');
const db = new Database('reset.db');

db.exec(`
CREATE TABLE IF NOT EXISTS users(id INTEGER PRIMARY KEY, name TEXT, email TEXT UNIQUE, password TEXT);
CREATE TABLE IF NOT EXISTS trips(id INTEGER PRIMARY KEY, title TEXT, destination TEXT, date TEXT, price INTEGER,
  seats INTEGER, description TEXT, women_only INTEGER DEFAULT 0, creator INTEGER);
CREATE TABLE IF NOT EXISTS members(trip_id INTEGER, user_id INTEGER, advance_paid INTEGER, UNIQUE(trip_id,user_id));`);

// Seed sample trips on first run
if (!db.prepare('SELECT COUNT(*) c FROM trips').get().c) {
  const s = db.prepare('INSERT INTO trips(title,destination,date,price,seats,description,women_only,creator) VALUES(?,?,?,?,?,?,?,0)');
  s.run('Kasol Backpackers Weekend', 'Kasol, HP', '2026-12-05', 6500, 8, 'Cafes, treks, bonfire. Solo travellers welcome!', 0);
  s.run('Goa New Year Squad', 'Goa', '2026-12-30', 9000, 10, 'Beach, music, new friends.', 0);
  s.run('Girls Only: Rishikesh Reset', 'Rishikesh, UK', '2026-11-20', 5000, 6, 'Rafting, yoga, safe stay.', 1);
}

const hash = p => crypto.createHash('sha256').update(p).digest('hex');
const app = express(); app.use(cors()); app.use(express.json());
const wrap = f => (req, res) => { try { res.json(f(req)); } catch (e) { res.status(400).json({ error: e.message }); } };

// ---- Auth ----
app.post('/register', wrap(({ body: b }) => {
  if (!b.name || !b.email || !b.password) throw new Error('All fields required');
  try {
    const r = db.prepare('INSERT INTO users(name,email,password) VALUES(?,?,?)').run(b.name, b.email, hash(b.password));
    return { id: r.lastInsertRowid, name: b.name };
  } catch { throw new Error('Email already registered'); }
}));

app.post('/login', wrap(({ body: b }) => {
  const u = db.prepare('SELECT id,name FROM users WHERE email=? AND password=?').get(b.email, hash(b.password || ''));
  if (!u) throw new Error('Invalid credentials');
  return u;
}));

// ---- Trips ----
app.get('/trips', wrap(() => db.prepare(`SELECT t.*, t.seats-(SELECT COUNT(*) FROM members m WHERE m.trip_id=t.id) AS seats_left
  FROM trips t ORDER BY date`).all()));

app.post('/trips', wrap(({ body: b }) => {
  if (!b.title || !b.destination || !b.price || !b.seats) throw new Error('Fill title, destination, price, seats');
  const r = db.prepare('INSERT INTO trips(title,destination,date,price,seats,description,women_only,creator) VALUES(?,?,?,?,?,?,?,?)')
    .run(b.title, b.destination, b.date, +b.price, +b.seats, b.description || '', b.women_only ? 1 : 0, b.creator);
  db.prepare('INSERT INTO members VALUES(?,?,0)').run(r.lastInsertRowid, b.creator);
  return { id: r.lastInsertRowid };
}));

app.post('/trips/:id/join', wrap(({ params, body: b }) => {
  const t = db.prepare('SELECT *, seats-(SELECT COUNT(*) FROM members WHERE trip_id=trips.id) AS left FROM trips WHERE id=?').get(params.id);
  if (!t) throw new Error('Trip not found');
  if (t.left <= 0) throw new Error('Trip is full');
  try { db.prepare('INSERT INTO members VALUES(?,?,?)').run(t.id, b.userId, Math.round(t.price * 0.2)); }
  catch { throw new Error('Already joined'); }
  return { ok: true, advance: Math.round(t.price * 0.2) };
}));

app.get('/mytrips/:uid', wrap(({ params }) => db.prepare(
  `SELECT t.*, m.advance_paid FROM trips t JOIN members m ON m.trip_id=t.id WHERE m.user_id=?`).all(params.uid)));

app.listen(5000, '0.0.0.0', () => console.log('ReSet API on :5000'));