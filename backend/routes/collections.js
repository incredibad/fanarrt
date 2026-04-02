const router = require('express').Router();
const db = require('../db/database');

// GET /api/collections — list all with item counts
router.get('/', (req, res) => {
  const cols = db.prepare(`
    SELECT c.id, c.name, c.created_at,
      COUNT(DISTINCT fav.id) as count
    FROM collections c
    LEFT JOIN favourites fav ON fav.collection_id = c.id
    GROUP BY c.id
    ORDER BY c.created_at ASC
  `).all();
  res.json(cols);
});

// POST /api/collections — create
router.post('/', (req, res) => {
  const { name } = req.body;
  if (!name || !name.trim()) return res.status(400).json({ error: 'Name required' });
  const result = db.prepare('INSERT INTO collections(name) VALUES(?)').run(name.trim());
  const col = db.prepare('SELECT * FROM collections WHERE id=?').get(result.lastInsertRowid);
  res.json({ ...col, count: 0 });
});

// DELETE /api/collections/:id — delete (CASCADE removes its favourites rows only)
router.delete('/:id', (req, res) => {
  const colCount = db.prepare('SELECT COUNT(*) as c FROM collections').get().c;
  if (colCount <= 1) return res.status(400).json({ error: 'Cannot delete the last collection' });
  const result = db.prepare('DELETE FROM collections WHERE id=?').run(req.params.id);
  if (result.changes === 0) return res.status(404).json({ error: 'Not found' });
  res.json({ ok: true });
});

// PATCH /api/collections/:id — rename
router.patch('/:id', (req, res) => {
  const { name } = req.body;
  if (!name || !name.trim()) return res.status(400).json({ error: 'Name required' });
  const result = db.prepare('UPDATE collections SET name=? WHERE id=?').run(name.trim(), req.params.id);
  if (result.changes === 0) return res.status(404).json({ error: 'Not found' });
  res.json({ ok: true });
});

module.exports = router;
