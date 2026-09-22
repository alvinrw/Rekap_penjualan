import express from 'express';
import prisma from '../prisma.js';

const router = express.Router();

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { username },
          { email: username },
        ],
      },
    });

    if (!user || user.password !== password) {
      return res.status(401).json({ error: 'Username atau kata sandi tidak valid.' });
    }

    if (user.status !== 'Aktif') {
      return res.status(403).json({ error: 'Akun Anda sedang dinonaktifkan. Hubungi Super Admin.' });
    }

    // Update lastLogin and online status
    const updated = await prisma.user.update({
      where: { id: user.id },
      data: {
        isOnline: true,
        lastLogin: new Date().toISOString().replace('T', ' ').slice(0, 19),
      },
    });

    res.json({
      message: 'Login berhasil',
      user: {
        id: updated.id,
        nama: updated.nama,
        username: updated.username,
        email: updated.email,
        role: updated.role,
        labelRole: updated.labelRole,
        status: updated.status,
        isOnline: updated.isOnline,
        lastLogin: updated.lastLogin,
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Terjadi kesalahan pada server saat login.' });
  }
});

// POST /api/auth/logout
router.post('/logout', async (req, res) => {
  try {
    const { userId } = req.body;
    if (userId) {
      await prisma.user.update({
        where: { id: userId },
        data: { isOnline: false },
      }).catch(() => {});
    }
    res.json({ message: 'Logout berhasil' });
  } catch (err) {
    res.status(500).json({ error: 'Gagal memproses logout.' });
  }
});

export default router;
