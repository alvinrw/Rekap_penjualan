import { useState, useCallback, useEffect } from 'react';
import { api } from '../services/api';
import { initialUsers } from '../data/initialData';

export function useUsers(pushAuditLog, currentRole) {
  const [users, setUsers] = useState(() => {
    const saved = localStorage.getItem('pendataan_users');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {}
    }
    return initialUsers;
  });

  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    if (Array.isArray(users)) {
      localStorage.setItem('pendataan_users', JSON.stringify(users));
    }
  }, [users]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('pendataan_current_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('pendataan_current_user');
    }
  }, [currentUser]);

  const loadUsers = useCallback(async () => {
    try {
      const backendUsers = await api.getUsers();
      if (Array.isArray(backendUsers) && backendUsers.length > 0) {
        setUsers(backendUsers);
      }
    } catch (err) {
      console.warn('Backend sync users error:', err.message);
    }
  }, []);

  const handleTambahUser = async (newUser) => {
    const userObj = {
      id: `USR-${(users.length + 1).toString().padStart(3, '0')}`,
      ...newUser,
      status: 'Aktif',
      lastLogin: 'Belum pernah',
    };
    setUsers((prev) => [...prev, userObj]);
    if (pushAuditLog) {
      pushAuditLog(
        'Manajemen User',
        'Tambah User Baru',
        `Menambah user baru ${newUser.nama} (${newUser.labelRole || newUser.role}).`
      );
    }

    try {
      const created = await api.createUser(newUser);
      if (created?.id) {
        setUsers((prev) => prev.map((u) => (u.id === userObj.id ? created : u)));
      }
    } catch (err) {
      console.warn('Tambah user backend sync warning:', err.message);
    }
  };

  const handleEditUser = async (userId, updatedData) => {
    const targetUser = users.find((u) => u.id === userId);
    if (currentRole === 'admin' && targetUser?.role === 'super_admin') {
      alert('Admin tidak memiliki wewenang untuk mengubah akun Super Admin!');
      return;
    }

    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          let labelRole = u.labelRole;
          if (updatedData.role === 'super_admin') labelRole = 'Super Admin';
          else if (updatedData.role === 'admin') labelRole = 'Admin Operasional';
          else if (updatedData.role === 'viewer') labelRole = 'Viewer / Pengawas';

          return {
            ...u,
            ...updatedData,
            labelRole: updatedData.labelRole || labelRole,
          };
        }
        return u;
      })
    );

    if (pushAuditLog) {
      pushAuditLog(
        'Manajemen User',
        'Edit Data User',
        `Memperbarui data user ${targetUser?.nama || userId} (Username: ${updatedData.username || targetUser?.username}).`
      );
    }

    try {
      await api.updateUser(userId, updatedData);
    } catch (err) {
      console.warn('Edit user backend sync warning:', err.message);
    }
  };

  const handleToggleStatusUser = async (userId) => {
    const targetUser = users.find((u) => u.id === userId);
    if (currentRole === 'admin' && targetUser?.role === 'super_admin') {
      alert('Admin tidak memiliki wewenang untuk menonaktifkan akun Super Admin!');
      return;
    }

    const statusBaru = targetUser?.status === 'Aktif' ? 'Nonaktif' : 'Aktif';
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, status: statusBaru } : u))
    );

    if (pushAuditLog) {
      pushAuditLog(
        'Manajemen User',
        'Ubah Status User',
        `Mengubah status akun ${targetUser?.nama} (${targetUser?.username}) menjadi ${statusBaru}.`
      );
    }

    try {
      await api.updateUserStatus(userId, statusBaru);
    } catch (err) {
      console.warn('Status user backend sync warning:', err.message);
    }
  };

  const handleUbahPasswordSelf = async (oldPass, newPass) => {
    if (!currentUser) return false;
    try {
      await api.changePassword(currentUser.id, oldPass, newPass);
      if (pushAuditLog) {
        pushAuditLog(
          'Autentikasi',
          'Ubah Password',
          `User ${currentUser.nama} berhasil mengubah password akun.`
        );
      }
      return true;
    } catch (err) {
      console.warn('Password change backend error:', err.message);
      return true; // allow optimistic fallback
    }
  };

  return {
    users,
    setUsers,
    currentUser,
    setCurrentUser,
    loadUsers,
    handleTambahUser,
    handleEditUser,
    handleToggleStatusUser,
    handleUbahPasswordSelf,
  };
}
