const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const app = express();
const port = 3000;
const db = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'book_manager'
}).promise(); // Mengaktifkan promise untuk penggunaan async/await

app.use(cors());
app.use(express.json());

// GET /api/books: Mengambil SEMUA buku

app.get('/api/books', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM books');
    res.status(200).json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Kesalahan Server' });
  }
});

// GET /api/books/:id: Mengambil buku berdasarkan ID
app.get('/api/books/:id', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM books WHERE id = ?', [req.params.id]);
    if (rows.length > 0) return res.status(200).json(rows[0]);
    res.status(404).json({ message: 'Buku tidak ditemukan' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Kesalahan Server' });
  }
});


// POST /api/books: Membuat buku baru
app.post('/api/books', async (req, res) => {
  const { title, author } = req.body;
  if (!title || !author) return res.status(400).json({ message: 'Title dan Author harus diisi' });
  try {
    const sql = 'INSERT INTO books (title, author) VALUES (?, ?)';
    const [result] = await db.query(sql, [title, author]);
    res.status(201).json({ id: result.insertId, title, author });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Kesalahan Server' });
  }
});

// PUT /api/books/:id: Memperbarui seluruh buku
app.put('/api/books/:id', async (req, res) => {
  const id = req.params.id;
  const { title, author } = req.body;
  if (!title || !author) return res.status(400).json({ message: 'Data tidak lengkap' });
  try {
    const [result] = await db.query('UPDATE books SET title=?, author=? WHERE id=?', [title, author, id]);
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Buku tidak ditemukan untuk diperbarui' });
    res.status(200).json({ id: Number(id), title, author });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Kesalahan Server' });
  }
});

// DELETE /api/books/:id: Menghapus buku
app.delete('/api/books/:id', async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM books WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Buku tidak ditemukan untuk dihapus' });
    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Kesalahan Server' });
  }
});

app.listen(port, () => {
  console.log(`API Book Manager listening on http://localhost:${port}`);
});


