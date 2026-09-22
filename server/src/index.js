import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';

import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import kloterRoutes from './routes/kloter.js';
import penjualanRoutes from './routes/penjualan.js';
import pengeluaranRoutes from './routes/pengeluaran.js';
import kematianRoutes from './routes/kematian.js';
import panenRoutes from './routes/panen.js';
import hargaRoutes from './routes/harga.js';
import auditLogsRoutes from './routes/auditLogs.js';
import jadwalExportRoutes from './routes/jadwalExport.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// API Routes
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
    message: 'Backend Pendataan Ayam Broiler PostgreSQL API berjalan dengan baik.',
    timestamp: new Date().toISOString(),
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`🚀 Server Backend aktif di: http://localhost:${PORT}`);
  console.log(`📊 Endpoint Health Check: http://localhost:${PORT}/api/health`);
  console.log(`=======================================================`);
});
