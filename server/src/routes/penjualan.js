import express from 'express';
import prisma from '../prisma.js';
import { generateStrukPenjualanPDF } from '../utils/pdfReceipt.js';

const router = express.Router();

// GET /api/penjualan
router.get('/', async (req, res) => {
  try {
    const sales = await prisma.penjualan.findMany({
      include: {
        kloter: {
          select: { id: true, namaKloter: true, kandang: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(sales);
  } catch (err) {
    console.error('Fetch sales error:', err);
    res.status(500).json({ error: 'Gagal mengambil data penjualan.' });
  }
});

// POST /api/penjualan
router.post('/', async (req, res) => {
  try {
    const {
      kloterId,
      tanggal,
      pembeli,
      kategoriPembeli,
      jumlahEkor,
      beratGram,
      hargaPerOnsSnapshot,
      totalHarga,
      metodePembayaran,
      catatanNota,
      dicatatOleh,
    } = req.body;

    const count = await prisma.penjualan.count();
    const kloter = await prisma.kloter.findUnique({
      where: { id: kloterId },
      include: { kematianList: true, panenList: true, penjualanList: true },
    });

    if (!kloter) {
      return res.status(404).json({ error: 'Kloter tidak ditemukan.' });
    }

    const totalKematian = kloter.kematianList.reduce((sum, item) => sum + (Number(item.jumlahEkor) || 0), 0);
    const totalPanen = kloter.panenList.reduce((sum, item) => sum + (Number(item.jumlahEkor) || 0), 0);
    const totalTerjual = kloter.penjualanList.reduce((sum, item) => sum + (Number(item.jumlahEkor) || 0), 0);
    const stokTersedia = totalPanen > 0
      ? Math.max(0, totalPanen - totalTerjual)
      : Math.max(0, (Number(kloter.docAwal) || 0) - totalKematian - totalTerjual);
    const jumlah = Number(jumlahEkor) || 0;

    if (stokTersedia <= 0 || jumlah <= 0 || jumlah > stokTersedia) {
      return res.status(400).json({
        error: `Stok ayam tidak mencukupi. Stok tersedia: ${stokTersedia} ekor.`,
      });
    }

    const id = `SL-${Date.now().toString().slice(-4)}`;
    const noStruk = (count + 1).toString().padStart(6, '0');

    const newSale = await prisma.penjualan.create({
      data: {
        id,
        noStruk,
        kloterId,
        tanggal,
        pembeli,
        kategoriPembeli: kategoriPembeli || 'Pembeli Toko',
        jumlahEkor: jumlah,
        beratGram: Number(beratGram) || 0,
        hargaPerOnsSnapshot: Number(hargaPerOnsSnapshot) || 7500,
        totalHarga: Number(totalHarga) || 0,
        metodePembayaran: metodePembayaran || 'Transfer Bank (Lunas)',
        catatanNota: catatanNota || null,
        dicatatOleh: dicatatOleh || 'Admin',
      },
      include: {
        kloter: true,
      },
    });

    res.status(201).json(newSale);
  } catch (err) {
    console.error('Create sale error:', err);
    res.status(500).json({ error: 'Gagal mencatat transaksi penjualan.' });
  }
});

// GET /api/penjualan/:id/struk-pdf (Generate PDF Receipt matching example)
router.get('/:id/struk-pdf', async (req, res) => {
  try {
    const { id } = req.params;
    const sale = await prisma.penjualan.findUnique({
      where: { id },
      include: { kloter: true },
    });

    if (!sale) {
      return res.status(404).json({ error: 'Transaksi penjualan tidak ditemukan.' });
    }

    generateStrukPenjualanPDF(sale, res);
  } catch (err) {
    console.error('Generate PDF receipt error:', err);
    res.status(500).json({ error: 'Gagal membuat file struk PDF.' });
  }
});

// PUT /api/penjualan/:id
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      pembeli,
      kategoriPembeli,
      jumlahEkor,
      beratGram,
      totalHarga,
      metodePembayaran,
      catatanNota,
    } = req.body;

    const updated = await prisma.penjualan.update({
      where: { id },
      data: {
        pembeli,
        kategoriPembeli,
        jumlahEkor: jumlahEkor !== undefined ? Number(jumlahEkor) : undefined,
        beratGram: beratGram !== undefined ? Number(beratGram) : undefined,
        totalHarga: totalHarga !== undefined ? Number(totalHarga) : undefined,
        metodePembayaran,
        catatanNota,
      },
    });

    res.json(updated);
  } catch (err) {
    console.error('Update sale error:', err);
    res.status(500).json({ error: 'Gagal memperbarui transaksi penjualan.' });
  }
});

// DELETE /api/penjualan/:id
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.penjualan.delete({ where: { id } });
    res.json({ message: 'Transaksi penjualan berhasil dihapus.' });
  } catch (err) {
    console.error('Delete sale error:', err);
    res.status(500).json({ error: 'Gagal menghapus transaksi penjualan.' });
  }
});

export default router;
