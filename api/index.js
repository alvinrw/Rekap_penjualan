import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import authRoutes from '../server/src/routes/auth.js';
import userRoutes from '../server/src/routes/users.js';
import kloterRoutes from '../server/src/routes/kloter.js';
import penjualanRoutes from '../server/src/routes/penjualan.js';
import pengeluaranRoutes from '../server/src/routes/pengeluaran.js';
import kematianRoutes from '../server/src/routes/kematian.js';
import panenRoutes from '../server/src/routes/panen.js';
import hargaRoutes from '../server/src/routes/harga.js';
import auditLogsRoutes from '../server/src/routes/auditLogs.js';
import jadwalExportRoutes from '../server/src/routes/jadwalExport.js';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// API Routes (Mounted under /api)
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/kloters', kloterRoutes);
app.use('/api/penjualan', penjualanRoutes);
app.use('/api/pengeluaran', pengeluaranRoutes);
app.use('/api/kematian', kematianRoutes);
app.use('/api/panen', panenRoutes);
app.use('/api/harga', hargaRoutes);
app.use('/api/audit-logs', auditLogsRoutes);
app.use('/api/jadwal-export', jadwalExportRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    environment: 'Vercel Serverless Function',
    timestamp: new Date().toISOString(),
  });
});

export default app;
