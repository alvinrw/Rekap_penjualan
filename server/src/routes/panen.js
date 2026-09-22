import express from 'express';
import prisma from '../prisma.js';

const router = express.Router();

// POST /api/panen
router.post('/', async (req, res) => {
  try {
    const { kloterId, tanggal, jumlahEkor, catatan, dicatatOleh } = req.body;
    const id = `HV-${Date.now().toString().slice(-4)}`;

    const newPanen = await prisma.panen.create({
      data: {
        id,
        kloterId,
        tanggal,
        jumlahEkor: Number(jumlahEkor) || 0,
        catatan: catatan || null,
        dicatatOleh: dicatatOleh || 'Admin',
      },
    });

    res.status(201).json(newPanen);
  } catch (err) {
    console.error('Create panen error:', err);
    res.status(500).json({ error: 'Gagal mencatat panen.' });
  }
});

// DELETE /api/panen/:id
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.panen.delete({ where: { id } });
    res.json({ message: 'Data panen berhasil dihapus.' });
  } catch (err) {
    console.error('Delete panen error:', err);
    res.status(500).json({ error: 'Gagal menghapus data panen.' });
  }
});

export default router;
