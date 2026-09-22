import express from 'express';
import prisma from '../prisma.js';

const router = express.Router();

// POST /api/pengeluaran
router.post('/', async (req, res) => {
  try {
    const { kloterId, tanggal, kategori, keterangan, jumlahKg, jumlahRp, dicatatOleh } = req.body;
    const id = `EXP-${Date.now().toString().slice(-4)}`;

    const newExp = await prisma.pengeluaran.create({
      data: {
        id,
        kloterId,
        tanggal,
        kategori,
        keterangan,
        jumlahKg: Number(jumlahKg) || 0,
        jumlahRp: Number(jumlahRp) || 0,
        dicatatOleh: dicatatOleh || 'Admin',
      },
    });

    res.status(201).json(newExp);
  } catch (err) {
    console.error('Create pengeluaran error:', err);
    res.status(500).json({ error: 'Gagal mencatat pengeluaran.' });
  }
});

// DELETE /api/pengeluaran/:id
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.pengeluaran.delete({ where: { id } });
    res.json({ message: 'Pengeluaran berhasil dihapus.' });
  } catch (err) {
    console.error('Delete pengeluaran error:', err);
    res.status(500).json({ error: 'Gagal menghapus pengeluaran.' });
  }
});

export default router;
