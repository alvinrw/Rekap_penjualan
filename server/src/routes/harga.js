import express from 'express';
import prisma from '../prisma.js';

const router = express.Router();

// GET /api/harga
router.get('/', async (req, res) => {
  try {
    let config = await prisma.hargaConfig.findFirst({ where: { id: 1 } });
    if (!config) {
      config = await prisma.hargaConfig.create({
        data: {
          id: 1,
          hargaPerOnsAktif: 7500,
          berlakuMulai: new Date().toISOString().split('T')[0],
          terakhirDiubahOleh: 'System',
        },
      });
    }

    const riwayat = await prisma.riwayatHarga.findMany({
      orderBy: { createdAt: 'desc' },
    });

    res.json({
      hargaPerOnsAktif: config.hargaPerOnsAktif,
      berlakuMulai: config.berlakuMulai,
      terakhirDiubahOleh: config.terakhirDiubahOleh,
      riwayatHarga: riwayat,
    });
  } catch (err) {
    console.error('Fetch harga error:', err);
    res.status(500).json({ error: 'Gagal mengambil konfigurasi harga.' });
  }
});

// POST /api/harga/update
router.post('/update', async (req, res) => {
  try {
    const { hargaBaru, catatan, diubahOleh } = req.body;
    const nowStr = new Date().toISOString().split('T')[0];
    const userModifier = diubahOleh || 'Admin';

    // 1. Update config
    const updatedConfig = await prisma.hargaConfig.upsert({
      where: { id: 1 },
      update: {
        hargaPerOnsAktif: Number(hargaBaru),
        berlakuMulai: nowStr,
        terakhirDiubahOleh: userModifier,
      },
      create: {
        id: 1,
        hargaPerOnsAktif: Number(hargaBaru),
        berlakuMulai: nowStr,
        terakhirDiubahOleh: userModifier,
      },
    });

    // 2. Insert into riwayat
    const newRiwayat = await prisma.riwayatHarga.create({
      data: {
        id: `H-${Date.now().toString().slice(-4)}`,
        hargaPerOns: Number(hargaBaru),
        berlakuMulai: nowStr,
        diubahOleh: userModifier,
        catatan: catatan || 'Pembaruan harga acuan per ons',
      },
    });

    res.json({
      hargaPerOnsAktif: updatedConfig.hargaPerOnsAktif,
      berlakuMulai: updatedConfig.berlakuMulai,
      terakhirDiubahOleh: updatedConfig.terakhirDiubahOleh,
      riwayatItem: newRiwayat,
    });
  } catch (err) {
    console.error('Update harga error:', err);
    res.status(500).json({ error: 'Gagal memperbarui harga.' });
  }
});

export default router;
