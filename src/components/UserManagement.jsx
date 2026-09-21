import React, { useState } from 'react';
import {
  Users,
  PlusCircle,
  Eye,
  EyeOff,
  Edit3,
  Trash2,
  Shield,
  ShieldCheck,
  UserCheck,
  Lock,
  Mail,
  User as UserIcon,
  X,
  Check,
  AlertTriangle,
  Info,
  Key,
} from 'lucide-react';

import { Pagination } from './Pagination';

export function UserManagement({
  users,
  currentUser,
  currentRole,
  onTambahUser,
  onEditUser,
  onDeleteUser,
}) {
  const [selectedUserDetail, setSelectedUserDetail] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [deletingUser, setDeletingUser] = useState(null);
  const [isTambahModalOpen, setIsTambahModalOpen] = useState(false);

  // Pagination state (max 15 rows)
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 15;

  const paginatedUsers = users.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // Show/Hide password toggle in detail modal
  const [showPasswordInDetail, setShowPasswordInDetail] = useState(false);
  const [showPasswordInEdit, setShowPasswordInEdit] = useState(false);
  const [showPasswordInTambah, setShowPasswordInTambah] = useState(false);

  // Form states for Tambah User
  const [tambahForm, setTambahForm] = useState({
    nama: '',
    username: '',
    email: '',
    password: '',
    role: 'admin',
  });

  // Form states for Edit User
  const [editForm, setEditForm] = useState({
    nama: '',
    username: '',
    email: '',
    password: '',
    role: 'admin',
    status: 'Aktif',
  });

  const isSuperAdmin = currentRole === 'super_admin';
  const isAdmin = currentRole === 'admin';

  // Check if current user can manage (edit/delete) a target user
  const canManageUser = (targetUser) => {
    if (isSuperAdmin) return true; // Super Admin can manage anyone
    if (isAdmin) {
      // Admin cannot manage Super Admin
      return targetUser.role !== 'super_admin';
    }
    return false;
  };

  const handleOpenEditModal = (user) => {
    if (!canManageUser(user)) {
      alert('Admin tidak memiliki wewenang untuk mengubah atau menghapus akun Super Admin!');
      return;
    }
    setEditingUser(user);
    setEditForm({
      nama: user.nama || '',
      username: user.username || '',
      email: user.email || '',
      password: user.password || '',
      role: user.role || 'admin',
      status: user.status || 'Aktif',
    });
    setShowPasswordInEdit(false);
  };

  const handleOpenDeleteModal = (user) => {
    if (!canManageUser(user)) {
      alert('Admin tidak memiliki wewenang untuk mengubah atau menghapus akun Super Admin!');
      return;
    }
    setDeletingUser(user);
  };

  const submitTambah = (e) => {
    e.preventDefault();
    if (!tambahForm.nama || !tambahForm.username || !tambahForm.password) {
      alert('Mohon lengkapi nama, username, dan password!');
      return;
    }

    let labelRole = 'Admin Operasional';
    if (tambahForm.role === 'super_admin') labelRole = 'Super Admin';
    else if (tambahForm.role === 'viewer') labelRole = 'Viewer / Pengawas';

    onTambahUser({
      ...tambahForm,
      labelRole,
    });

    setIsTambahModalOpen(false);
    setTambahForm({
      nama: '',
      username: '',
      email: '',
      password: '',
      role: 'admin',
    });
  };

  const submitEdit = (e) => {
    e.preventDefault();
    if (!editingUser) return;

    let labelRole = 'Admin Operasional';
    if (editForm.role === 'super_admin') labelRole = 'Super Admin';
    else if (editForm.role === 'viewer') labelRole = 'Viewer / Pengawas';

    onEditUser(editingUser.id, {
      ...editForm,
      labelRole,
    });

    setEditingUser(null);
  };

  const submitDelete = () => {
    if (!deletingUser) return;
    onDeleteUser(deletingUser.id);
    setDeletingUser(null);
  };

  const getRoleBadgeStyle = (role) => {
    switch (role) {
      case 'super_admin':
        return 'bg-purple-100 text-purple-800 border border-purple-200';
      case 'admin':
        return 'bg-sky-100 text-sky-800 border border-sky-200';
      default:
        return 'bg-slate-100 text-slate-700 border border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-2xl border border-sky-100 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-sky-500 to-sky-700 text-white flex items-center justify-center shadow-md">
            <Users size={24} />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Manajemen User</h1>
            <p className="text-xs text-slate-500 font-medium">
              Kelola daftar pengguna, username, password, dan wewenang hak akses sistem.
            </p>
          </div>
        </div>

        <button
          className="btn btn-primary text-xs font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 shadow-sm cursor-pointer"
          onClick={() => {
            setShowPasswordInTambah(false);
            setIsTambahModalOpen(true);
          }}
        >
          <PlusCircle size={16} />
          <span>Tambah User Baru</span>
        </button>
      </div>

      {/* Admin Notice Banner if Admin */}
      {isAdmin && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 flex items-start gap-3 text-xs text-amber-900">
          <AlertTriangle size={18} className="text-amber-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold block text-amber-950">Akses Admin Operasional:</span>
            <span>
              Anda dapat menambah, melihat detail, mengedit, atau menghapus pengguna level Admin &amp; Viewer.
              Akun <strong>Super Admin</strong> bersifat terlindungi dan tidak dapat diubah oleh Admin.
            </span>
          </div>
        </div>
      )}

      {/* Main Table / User Cards */}
      <div className="card space-y-4">
        <div className="flex items-center justify-between px-2">
          <h2 className="text-sm font-extrabold text-slate-800">Daftar Pengguna Sistem ({users.length})</h2>
        </div>

        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>ID &amp; Nama User</th>
                <th>Username</th>
                <th>Email</th>
                <th>Role Hak Akses</th>
                <th>Status</th>
                <th>Login Terakhir</th>
                <th className="text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {paginatedUsers.map((user) => {
                const isTargetSuperAdmin = user.role === 'super_admin';
                const canEditThisUser = canManageUser(user);

                return (
                  <tr key={user.id} className="hover:bg-sky-50/40 transition">
                    <td>
                      <div className="font-bold text-slate-900 text-xs flex items-center gap-2">
                        {user.nama}
                        {user.id === currentUser?.id && (
                          <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                            Anda
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono font-bold">{user.id}</div>
                    </td>
                    <td>
                      <span className="font-mono text-xs text-slate-800 font-bold bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                        {user.username || '-'}
                      </span>
                    </td>
                    <td className="text-xs text-slate-600 font-medium">{user.email || '-'}</td>
                    <td>
                      <span className={`px-2.5 py-1 font-extrabold rounded-full text-[11px] ${getRoleBadgeStyle(user.role)}`}>
                        {user.labelRole || user.role}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${user.status === 'Aktif' ? 'badge-selesai' : 'bg-slate-100 text-slate-600'}`}>
                        {user.status || 'Aktif'}
                      </span>
                    </td>
                    <td className="text-xs text-slate-500 whitespace-nowrap font-medium">{user.lastLogin || '-'}</td>
                    <td>
                      <div className="flex items-center justify-center gap-1.5">
                        {/* Detail Button */}
                        <button
                          onClick={() => {
                            setShowPasswordInDetail(false);
                            setSelectedUserDetail(user);
                          }}
                          className="px-2.5 py-1.5 bg-sky-50 hover:bg-sky-100 text-sky-700 rounded-lg text-xs font-bold border border-sky-200 transition flex items-center gap-1 cursor-pointer"
                          title="Lihat Detail User"
                        >
                          <Info size={14} />
                          <span className="hidden sm:inline">Detail</span>
                        </button>

                        {/* Edit Button */}
                        {canEditThisUser ? (
                          <button
                            onClick={() => handleOpenEditModal(user)}
                            className="px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-lg text-xs font-bold border border-amber-200 transition flex items-center gap-1 cursor-pointer"
                            title="Edit User (Username, Password, Role)"
                          >
                            <Edit3 size={14} />
                            <span className="hidden sm:inline">Edit</span>
                          </button>
                        ) : (
                          <button
                            disabled
                            className="px-2.5 py-1.5 bg-slate-100 text-slate-400 rounded-lg text-xs font-bold border border-slate-200 opacity-60 cursor-not-allowed flex items-center gap-1"
                            title="Super Admin tidak dapat diubah oleh Admin"
                          >
                            <Lock size={13} />
                            <span className="hidden sm:inline">Edit</span>
                          </button>
                        )}

                        {/* Delete Button */}
                        {canEditThisUser ? (
                          <button
                            onClick={() => handleOpenDeleteModal(user)}
                            className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-xs font-bold border border-red-200 transition cursor-pointer"
                            title="Hapus User"
                          >
                            <Trash2 size={14} />
                          </button>
                        ) : (
                          <button
                            disabled
                            className="p-1.5 bg-slate-100 text-slate-400 rounded-lg text-xs border border-slate-200 opacity-60 cursor-not-allowed"
                            title="Super Admin tidak dapat dihapus oleh Admin"
                          >
                            <Lock size={13} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <Pagination
          currentPage={currentPage}
          totalItems={users.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
        />
      </div>

      {/* MODAL 1: Detail User */}
      {selectedUserDetail && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-sky-100 space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center font-bold">
                  <UserIcon size={18} />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">Detail Pengguna</h3>
                  <p className="text-[11px] text-slate-500 font-mono">{selectedUserDetail.id}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedUserDetail(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div className="bg-sky-50/50 p-3.5 rounded-xl border border-sky-100 space-y-2.5">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Nama Lengkap:</span>
                  <span className="font-extrabold text-slate-900">{selectedUserDetail.nama}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Username:</span>
                  <span className="font-mono font-bold bg-white px-2 py-0.5 rounded border border-sky-200 text-sky-900">
                    {selectedUserDetail.username || '-'}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Email:</span>
                  <span className="font-medium text-slate-800">{selectedUserDetail.email || '-'}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Kata Sandi (Password):</span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono bg-white px-2 py-0.5 rounded border border-sky-200 text-slate-800 font-bold">
                      {showPasswordInDetail
                        ? selectedUserDetail.password || '(Tidak di-set)'
                        : '••••••••••••'}
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowPasswordInDetail(!showPasswordInDetail)}
                      className="text-slate-400 hover:text-sky-600 p-1 cursor-pointer"
                    >
                      {showPasswordInDetail ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-1 border-t border-sky-100">
                  <span className="text-slate-500 font-medium">Role Hak Akses:</span>
                  <span className={`px-2.5 py-0.5 font-extrabold rounded-full text-[11px] ${getRoleBadgeStyle(selectedUserDetail.role)}`}>
                    {selectedUserDetail.labelRole || selectedUserDetail.role}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Status Akun:</span>
                  <span className={`badge ${selectedUserDetail.status === 'Aktif' ? 'badge-selesai' : 'bg-slate-100 text-slate-600'}`}>
                    {selectedUserDetail.status || 'Aktif'}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Login Terakhir:</span>
                  <span className="text-slate-700 font-medium">{selectedUserDetail.lastLogin || '-'}</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedUserDetail(null)}
                className="btn btn-secondary text-xs py-2 px-5 rounded-xl font-bold cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Tambah User */}
      {isTambahModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={submitTambah}
            className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-sky-100 space-y-4 animate-in fade-in zoom-in-95 duration-200"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-sky-600 text-white flex items-center justify-center font-bold">
                  <PlusCircle size={18} />
                </div>
                <h3 className="text-base font-extrabold text-slate-900">Tambah User Baru</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsTambahModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nama Lengkap User:</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Ahmad Hidayat"
                  className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 font-medium"
                  value={tambahForm.nama}
                  onChange={(e) => setTambahForm({ ...tambahForm, nama: e.target.value })}
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Username Login:</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: ahmad_ops"
                  className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 font-mono text-xs"
                  value={tambahForm.username}
                  onChange={(e) => setTambahForm({ ...tambahForm, username: e.target.value })}
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Email (Opsional):</label>
                <input
                  type="email"
                  placeholder="ahmad@peternakan-unggul.co.id"
                  className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 font-medium"
                  value={tambahForm.email}
                  onChange={(e) => setTambahForm({ ...tambahForm, email: e.target.value })}
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Kata Sandi (Password):</label>
                <div className="relative">
                  <input
                    type={showPasswordInTambah ? 'text' : 'password'}
                    required
                    placeholder="Masukkan kata sandi baru"
                    className="w-full p-2.5 pr-10 rounded-xl border border-slate-300 focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 font-mono text-xs"
                    value={tambahForm.password}
                    onChange={(e) => setTambahForm({ ...tambahForm, password: e.target.value })}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswordInTambah(!showPasswordInTambah)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-sky-600 cursor-pointer"
                  >
                    {showPasswordInTambah ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Role Wewenang Hak Akses:</label>
                <select
                  className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 font-bold bg-white text-slate-800"
                  value={tambahForm.role}
                  onChange={(e) => setTambahForm({ ...tambahForm, role: e.target.value })}
                >
                  {isSuperAdmin && <option value="super_admin">Super Admin (Akses Penuh)</option>}
                  <option value="admin">Admin Operasional</option>
                  <option value="viewer">Viewer / Pengawas (Read-Only)</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsTambahModalOpen(false)}
                className="btn btn-secondary text-xs py-2 px-4 rounded-xl font-bold cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                className="btn btn-primary text-xs py-2 px-4 rounded-xl font-bold flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <Check size={16} />
                <span>Simpan User</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL 3: Edit User (Role, Pass, Username) */}
      {editingUser && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={submitEdit}
            className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-sky-100 space-y-4 animate-in fade-in zoom-in-95 duration-200"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold">
                  <Edit3 size={18} />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">Edit Akun User</h3>
                  <p className="text-[11px] text-slate-400 font-mono">{editingUser.id}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingUser(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nama Lengkap User:</label>
                <input
                  type="text"
                  required
                  className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 font-medium"
                  value={editForm.nama}
                  onChange={(e) => setEditForm({ ...editForm, nama: e.target.value })}
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Username Login (uss):</label>
                <input
                  type="text"
                  required
                  className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 font-mono text-xs"
                  value={editForm.username}
                  onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Email:</label>
                <input
                  type="email"
                  className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 font-medium"
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Kata Sandi Baru (pass):</label>
                <div className="relative">
                  <input
                    type={showPasswordInEdit ? 'text' : 'password'}
                    required
                    className="w-full p-2.5 pr-10 rounded-xl border border-slate-300 focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 font-mono text-xs"
                    value={editForm.password}
                    onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswordInEdit(!showPasswordInEdit)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-sky-600 cursor-pointer"
                  >
                    {showPasswordInEdit ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Role Hak Akses:</label>
                <select
                  className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 font-bold bg-white text-slate-800"
                  value={editForm.role}
                  onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                >
                  {isSuperAdmin && <option value="super_admin">Super Admin (Akses Penuh)</option>}
                  <option value="admin">Admin Operasional</option>
                  <option value="viewer">Viewer / Pengawas (Read-Only)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Status Akun:</label>
                <select
                  className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 font-bold bg-white text-slate-800"
                  value={editForm.status}
                  onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                >
                  <option value="Aktif">Aktif</option>
                  <option value="Non-Aktif">Non-Aktif</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setEditingUser(null)}
                className="btn btn-secondary text-xs py-2 px-4 rounded-xl font-bold cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                className="btn btn-primary text-xs py-2 px-4 rounded-xl font-bold flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <Check size={16} />
                <span>Simpan Perubahan</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL 4: Hapus User Konfirmasi */}
      {deletingUser && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-red-100 space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center font-bold shrink-0">
                <AlertTriangle size={22} />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900">Konfirmasi Hapus</h3>
                <p className="text-xs text-slate-500">Tindakan ini tidak dapat dibatalkan.</p>
              </div>
            </div>

            <p className="text-xs text-slate-700 bg-red-50/60 p-3 rounded-xl border border-red-100">
              Apakah Anda yakin ingin menghapus akun user <strong>{deletingUser.nama}</strong> ({deletingUser.username || deletingUser.id})?
            </p>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setDeletingUser(null)}
                className="btn btn-secondary text-xs py-2 px-4 rounded-xl font-bold cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={submitDelete}
                className="py-2 px-4 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition cursor-pointer shadow-sm flex items-center gap-1"
              >
                <Trash2 size={14} />
                <span>Hapus Akun</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
