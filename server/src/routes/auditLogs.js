import express from 'express';
import prisma from '../prisma.js';

const router = express.Router();

// GET /api/audit-logs
router.get('/', async (req, res) => {
  try {
    const logs = await prisma.auditLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
    res.json(logs);
  } catch (err) {
    console.error('Fetch logs error:', err);
    res.status(500).json({ error: 'Gagal mengambil audit logs.' });
  }
});

// POST /api/audit-logs
router.post('/', async (req, res) => {
  try {
    const { modul, aksi, deskripsi, user } = req.body;
    const id = `LOG-${Date.now().toString().slice(-4)}`;
    const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 19);

    const newLog = await prisma.auditLog.create({
      data: {
        id,
        timestamp,
        user: user || 'System',
        modul,
        aksi,
        deskripsi,
      },
    });

    res.status(201).json(newLog);
  } catch (err) {
    console.error('Create log error:', err);
    res.status(500).json({ error: 'Gagal mencatat audit log.' });
  }
});

export default router;
