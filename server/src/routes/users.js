import express from 'express';
import prisma from '../prisma.js';

const router = express.Router();

// GET /api/users
router.get('/', async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'asc' },
    });
    res.json(users);
  } catch (err) {
    console.error('Fetch users error:', err);
    res.status(500).json({ error: 'Gagal mengambil data user.' });
  }
});

// POST /api/users
router.post('/', async (req, res) => {
  try {
    const { nama, username, email, password, role, labelRole, status } = req.body;
    
    // Check if username already exists
    const existing = await prisma.user.findUnique({ where: { username } });
    if (existing) {
      return res.status(400).json({ error: 'Username sudah digunakan.' });
    }

    let defaultLabel = 'Viewer / Pengawas';
    if (role === 'super_admin') defaultLabel = 'Super Admin';
    else if (role === 'admin') defaultLabel = 'Admin Operasional';

    const count = await prisma.user.count();
    const customId = `USR-${(count + 1).toString().padStart(3, '0')}`;

    const newUser = await prisma.user.create({
      data: {
        id: customId,
        nama,
        username,
        email: email || null,
        password: password || 'password123',
        role: role || 'viewer',
        labelRole: labelRole || defaultLabel,
        status: status || 'Aktif',
        isOnline: false,
        lastLogin: 'Belum pernah',
      },
    });

    res.status(201).json(newUser);
  } catch (err) {
    console.error('Create user error:', err);
    res.status(500).json({ error: 'Gagal menambahkan user baru.' });
  }
});

// PUT /api/users/:id
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { nama, username, email, password, role, labelRole, status, isOnline } = req.body;

    const dataToUpdate = {};
    if (nama !== undefined) dataToUpdate.nama = nama;
    if (username !== undefined) dataToUpdate.username = username;
    if (email !== undefined) dataToUpdate.email = email;
    if (password !== undefined && password.trim() !== '') dataToUpdate.password = password;
    if (role !== undefined) {
      dataToUpdate.role = role;
      if (!labelRole) {
        if (role === 'super_admin') dataToUpdate.labelRole = 'Super Admin';
        else if (role === 'admin') dataToUpdate.labelRole = 'Admin Operasional';
        else dataToUpdate.labelRole = 'Viewer / Pengawas';
      }
    }
    if (labelRole !== undefined) dataToUpdate.labelRole = labelRole;
    if (status !== undefined) dataToUpdate.status = status;
    if (isOnline !== undefined) dataToUpdate.isOnline = isOnline;

    const updated = await prisma.user.update({
      where: { id },
      data: dataToUpdate,
    });

    res.json(updated);
  } catch (err) {
    console.error('Update user error:', err);
    res.status(500).json({ error: 'Gagal memperbarui user.' });
  }
});

// DELETE /api/users/:id
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const target = await prisma.user.findUnique({ where: { id } });

    if (!target) {
      return res.status(404).json({ error: 'User tidak ditemukan.' });
    }

    if (target.role === 'super_admin') {
      return res.status(403).json({ error: 'Akun Super Admin tidak dapat dihapus.' });
    }

    await prisma.user.delete({ where: { id } });
    res.json({ message: 'User berhasil dihapus.' });
  } catch (err) {
    console.error('Delete user error:', err);
    res.status(500).json({ error: 'Gagal menghapus user.' });
  }
});

export default router;
