const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const app = express();
const port = 3000;

// === KONFIGURASI DATABASE ===
const db = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'UTS'
}).promise();

app.use(cors());
app.use(express.json());

// ==========================================================
// === GET /api/media — Mengambil SEMUA data media =========
// ==========================================================
app.get('/api/media', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM media');
        res.status(200).json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Kesalahan Server' });
    }
});

// ==========================================================
// === GET /api/media/:id — Mengambil data berdasarkan ID ===
// ==========================================================
app.get('/api/media/:id', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM media WHERE id_media = ?', [req.params.id]);
        if (rows.length > 0) return res.status(200).json(rows[0]);
        res.status(404).json({ message: 'Media tidak ditemukan' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Kesalahan Server' });
    }
});

// ==========================================================
// === POST /api/media — Menambah data baru ================
// ==========================================================
app.post('/api/media', async (req, res) => {
    const { judul, tahun_rilis, gendre } = req.body;
    if (!judul || !tahun_rilis || !gendre)
        return res.status(400).json({ message: 'Semua field harus diisi' });

    try {
        const sql = 'INSERT INTO media (judul, tahun_rilis, gendre) VALUES (?, ?, ?)';
        const [result] = await db.query(sql, [judul, tahun_rilis, gendre]);
        res.status(201).json({ id_media: result.insertId, judul, tahun_rilis, gendre });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Kesalahan Server' });
    }
});

// ==========================================================
// === PUT /api/media/:id — Memperbarui data media =========
// ==========================================================
app.put('/api/media/:id', async (req, res) => {
    const id = req.params.id;
    const { judul, tahun_rilis, gendre } = req.body;

    if (!judul || !tahun_rilis || !gendre)
        return res.status(400).json({ message: 'Data tidak lengkap' });

    try {
        const [result] = await db.query(
            'UPDATE media SET judul = ?, tahun_rilis = ?, gendre = ? WHERE id_media = ?',
            [judul, tahun_rilis, gendre, id]
        );

        if (result.affectedRows === 0)
            return res.status(404).json({ message: 'Media tidak ditemukan untuk diperbarui' });

        res.status(200).json({ id_media: Number(id), judul, tahun_rilis, gendre });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Kesalahan Server' });
    }
});

// ==========================================================
// === DELETE /api/media/:id — Menghapus data media ========
// ==========================================================
app.delete('/api/media/:id', async (req, res) => {
    try {
        const [result] = await db.query('DELETE FROM media WHERE id_media = ?', [req.params.id]);
        if (result.affectedRows === 0)
            return res.status(404).json({ message: 'Media tidak ditemukan untuk dihapus' });
        res.status(204).send();
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Kesalahan Server' });
    }
});

// ==========================================================
// === Menjalankan server ==================================
// ==========================================================
app.listen(port, () => {
    console.log(`🎬 API Media Manager berjalan di http://localhost:${port}`);
});
