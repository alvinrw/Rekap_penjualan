import express from 'express';
import prisma from '../prisma.js';

const router = express.Router();

// POST /api/kematian
router.post('/', async (req, res) => {
  try {
    const { kloterId, tanggal, jumlahEkor, penyebab, dicatatOleh } = req.body;
    const id = `DTH-${Date.now().toString().slice(-4)}`;

    const newDeath = await prisma.kematian.create({
      data: {
        id,
        kloterId,
        tanggal,
        jumlahEkor: Number(jumlahEkor) || 0,
        penyebab: penyebab || 'Tidak diketahui',
        dicatatOleh: dicatatOleh || 'Admin',
      },
    });

    res.status(201).json(newDeath);
  } catch (err) {
    console.error('Create kematian error:', err);
    res.status(500).json({ error: 'Gagal mencatat data kematian ayam.' });
  }
});

// DELETE /api/kematian/:id
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.kematian.delete({ where: { id } });
    res.json({ message: 'Data kematian berhasil dihapus.' });
  } catch (err) {
    console.error('Delete kematian error:', err);
    res.status(500).json({ error: 'Gagal menghapus data kematian.' });
  }
});

export default router;
