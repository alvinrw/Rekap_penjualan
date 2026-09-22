import express from 'express';
import prisma from '../prisma.js';

const router = express.Router();

// GET /api/kloters (Includes all nested lists: pengeluaran, kematian, panen, penjualan)
router.get('/', async (req, res) => {
  try {
    const kloters = await prisma.kloter.findMany({
      include: {
        pengeluaranList: { orderBy: { createdAt: 'desc' } },
        kematianList: { orderBy: { createdAt: 'desc' } },
        panenList: { orderBy: { createdAt: 'desc' } },
        penjualanList: { orderBy: { createdAt: 'desc' } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(kloters);
  } catch (err) {
    console.error('Fetch kloters error:', err);
    res.status(500).json({ error: 'Gagal mengambil data kloter.' });
  }
});

// GET /api/kloters/:id
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const kloter = await prisma.kloter.findUnique({
      where: { id },
      include: {
        pengeluaranList: { orderBy: { createdAt: 'desc' } },
        kematianList: { orderBy: { createdAt: 'desc' } },
        panenList: { orderBy: { createdAt: 'desc' } },
        penjualanList: { orderBy: { createdAt: 'desc' } },
      },
    });

    if (!kloter) {
      return res.status(404).json({ error: 'Kloter tidak ditemukan.' });
    }

    res.json(kloter);
  } catch (err) {
    console.error('Fetch kloter detail error:', err);
    res.status(500).json({ error: 'Gagal mengambil detail kloter.' });
  }
});

// POST /api/kloters
router.post('/', async (req, res) => {
  try {
    const { namaKloter, kandang, tanggalBeliDoc, docAwal, hargaDocPerEkor, catatanAwal, customId } = req.body;

    const count = await prisma.kloter.count();
    const id = customId || `KLT-2026-${(count + 1).toString().padStart(2, '0')}`;

    const newKloter = await prisma.kloter.create({
      data: {
        id,
        namaKloter,
        kandang,
        tanggalBeliDoc,
        docAwal: Number(docAwal) || 0,
        hargaDocPerEkor: Number(hargaDocPerEkor) || 0,
        status: 'Aktif',
        catatanAwal: catatanAwal || null,
      },
      include: {
        pengeluaranList: true,
        kematianList: true,
        panenList: true,
        penjualanList: true,
      },
    });

    res.status(201).json(newKloter);
  } catch (err) {
    console.error('Create kloter error:', err);
    res.status(500).json({ error: 'Gagal membuat kloter baru.' });
  }
});

// PUT /api/kloters/:id/status
router.put('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const updated = await prisma.kloter.update({
      where: { id },
      data: { status },
      include: {
        pengeluaranList: true,
        kematianList: true,
        panenList: true,
        penjualanList: true,
      },
    });

    res.json(updated);
  } catch (err) {
    console.error('Update status kloter error:', err);
    res.status(500).json({ error: 'Gagal memperbarui status kloter.' });
  }
});

// PUT /api/kloters/:id
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { namaKloter, kandang, tanggalBeliDoc, docAwal, hargaDocPerEkor, catatanAwal } = req.body;
    
    const updated = await prisma.kloter.update({
      where: { id },
      data: {
        namaKloter,
        kandang,
        tanggalBeliDoc,
        docAwal: Number(docAwal) || 0,
        hargaDocPerEkor: Number(hargaDocPerEkor) || 0,
        catatanAwal: catatanAwal || null,
      },
      include: {
        pengeluaranList: true,
        kematianList: true,
        panenList: true,
        penjualanList: true,
      },
    });
    res.json(updated);
  } catch (err) {
    console.error('Update kloter error:', err);
    res.status(500).json({ error: 'Gagal mengedit kloter.' });
  }
});

// DELETE /api/kloters/:id
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.kloter.delete({ where: { id } });
    res.json({ message: 'Kloter berhasil dihapus.' });
  } catch (err) {
    console.error('Delete kloter error:', err);
    res.status(500).json({ error: 'Gagal menghapus kloter.' });
  }
});

export default router;
