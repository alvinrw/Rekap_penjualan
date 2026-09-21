import React, { useState } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { MobileNav } from './components/MobileNav';
import { Dashboard } from './components/Dashboard';
import { KloterList } from './components/KloterList';
import { KloterDetail } from './components/KloterDetail';
import { PenjualanView } from './components/PenjualanView';
import { PengaturanHarga } from './components/PengaturanHarga';
import { LaporanAnalytics } from './components/LaporanAnalytics';
import { UserManagement } from './components/UserManagement';
import { JadwalExportView } from './components/JadwalExportView';
import { Modals } from './components/Modals';
import { LoginPage } from './components/LoginPage';

import {
  initialHargaConfig,
  initialUsers,
  initialKloters,
  initialAuditLogs,
} from './data/initialData';

export default function App() {
  // Authentication & Application State
  const [currentUser, setCurrentUser] = useState(initialUsers[0]); // Logged in user
  const [currentTab, setCurrentTab] = useState('dashboard'); // 'dashboard' | 'kloter' | 'penjualan' | 'harga' | 'laporan' | 'user'
  const [selectedKloterId, setSelectedKloterId] = useState(null);

  const [hargaConfig, setHargaConfig] = useState(initialHargaConfig);
  const [kloters, setKloters] = useState(initialKloters);
  const [users, setUsers] = useState(initialUsers);
  const [auditLogs, setAuditLogs] = useState(initialAuditLogs);

  const [activeModal, setActiveModal] = useState(null);

  // Deriving current role from logged-in user
  const currentRole = currentUser?.role || 'viewer';

  // Helper to log audit entries
  const pushAuditLog = (modul, aksi, deskripsi) => {
    const userName = currentUser ? `${currentUser.nama} (${currentUser.labelRole})` : 'System';

    const newLog = {
      id: `LOG-${Date.now().toString().slice(-4)}`,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      user: userName,
      modul,
      aksi,
      deskripsi,
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  const handleLogin = (user) => {
    setCurrentUser(user);
    pushAuditLog('Autentikasi', 'Login Pengguna', `User ${user.nama} berhasil masuk ke sistem dengan role ${user.labelRole}.`);
  };

  const handleLogout = () => {
    if (currentUser) {
      pushAuditLog('Autentikasi', 'Logout Pengguna', `User ${currentUser.nama} keluar dari sistem.`);
    }
    setCurrentUser(null);
  };

  // Handlers for input transactions
  const handleTambahKloter = (formData) => {
    const newKloterId = `KLT-2026-${(kloters.length + 1).toString().padStart(2, '0')}`;
    const newKloter = {
      id: newKloterId,
      namaKloter: formData.namaKloter,
      kandang: formData.kandang,
      tanggalBeliDoc: formData.tanggalBeliDoc,
      docAwal: formData.docAwal,
      hargaDocPerEkor: formData.hargaDocPerEkor,
      status: 'Aktif',
      catatanAwal: formData.catatanAwal,
      pengeluaranList: [],
      kematianList: [],
      panenList: [],
      penjualanList: [],
    };

    setKloters((prev) => [newKloter, ...prev]);
    pushAuditLog(
      'Manajemen Kloter',
      'Buat Kloter Baru',
      `Membuat ${formData.namaKloter} dengan DOC awal ${formData.docAwal} ekor @ Rp ${formData.hargaDocPerEkor}.`
    );
    setActiveModal(null);
  };

  const handlePengeluaran = (formData) => {
    setKloters((prev) =>
      prev.map((k) => {
        if (k.id === formData.kloterId) {
          const newExp = {
            id: `EXP-${Date.now().toString().slice(-4)}`,
            tanggal: formData.tanggal,
            kategori: formData.kategori,
            keterangan: formData.keterangan,
            jumlahKg: formData.jumlahKg,
            jumlahRp: formData.jumlahRp,
            dicatatOleh: currentUser ? currentUser.nama : 'Admin',
          };
          return {
            ...k,
            pengeluaranList: [newExp, ...(k.pengeluaranList || [])],
          };
        }
        return k;
      })
    );

    pushAuditLog(
      'Pengeluaran',
      'Input Pengeluaran Baru',
      `Catat biaya ${formData.kategori} (${formData.keterangan}) sebesar Rp ${formData.jumlahRp} pada kloter ${formData.kloterId}.`
    );
    setActiveModal(null);
  };

  const handleKematian = (formData) => {
    setKloters((prev) =>
      prev.map((k) => {
        if (k.id === formData.kloterId) {
          const newDeath = {
            id: `DTH-${Date.now().toString().slice(-4)}`,
            tanggal: formData.tanggal,
            jumlahEkor: formData.jumlahEkor,
            penyebab: formData.penyebab,
            dicatatOleh: currentUser ? currentUser.nama : 'Admin',
          };
          return {
            ...k,
            kematianList: [newDeath, ...(k.kematianList || [])],
          };
        }
        return k;
      })
    );

    pushAuditLog(
      'Kematian Ayam',
      'Input Catatan Kematian',
      `Catat kematian ${formData.jumlahEkor} ekor di kloter ${formData.kloterId}. Indikasi: ${formData.penyebab}.`
    );
    setActiveModal(null);
  };

  const handlePanen = (formData) => {
    setKloters((prev) =>
      prev.map((k) => {
        if (k.id === formData.kloterId) {
          const newPanen = {
            id: `HV-${Date.now().toString().slice(-4)}`,
            tanggal: formData.tanggal,
            jumlahEkor: formData.jumlahEkor,
            catatan: formData.catatan,
            dicatatOleh: currentUser ? currentUser.nama : 'Admin',
          };
          return {
            ...k,
            panenList: [newPanen, ...(k.panenList || [])],
          };
        }
        return k;
      })
    );

    pushAuditLog(
      'Panen',
      'Input Panen Bertahap',
      `Mencatat panen ${formData.jumlahEkor} ekor di kloter ${formData.kloterId}.`
    );
    setActiveModal(null);
  };

  const handlePenjualan = (formData) => {
    setKloters((prev) =>
      prev.map((k) => {
        if (k.id === formData.kloterId) {
          const newSales = {
            id: `SL-${Date.now().toString().slice(-4)}`,
            tanggal: formData.tanggal,
            pembeli: formData.pembeli,
            beratGram: formData.beratGram,
            hargaPerOnsSnapshot: formData.hargaPerOnsSnapshot,
            totalHarga: formData.totalHarga,
            metodePembayaran: formData.metodePembayaran,
            catatanNota: formData.catatanNota,
            dicatatOleh: currentUser ? currentUser.nama : 'Admin',
          };
          return {
            ...k,
            penjualanList: [newSales, ...(k.penjualanList || [])],
          };
        }
        return k;
      })
    );

    const ons = formData.beratGram / 100;
    pushAuditLog(
      'Penjualan',
      'Input Penjualan Baru',
      `Mencatat penjualan kloter ${formData.kloterId} ke ${formData.pembeli} sebesar ${formData.beratGram} gram (${ons} ons) snapshot Rp ${formData.hargaPerOnsSnapshot}/ons. Total: Rp ${formData.totalHarga}.`
    );
    setActiveModal(null);
  };

  const handleEditPenjualan = (kloterId, saleId, updatedData) => {
    setKloters((prev) =>
      prev.map((k) => {
        if (k.id === kloterId) {
          return {
            ...k,
            penjualanList: (k.penjualanList || []).map((s) =>
              s.id === saleId ? { ...s, ...updatedData } : s
            ),
          };
        }
        return k;
      })
    );
    pushAuditLog(
      'Penjualan',
      'Edit Transaksi Penjualan',
      `Memperbarui transaksi penjualan ${saleId} di kloter ${kloterId} pembeli ${updatedData.pembeli}.`
    );
  };

  const handleDeletePenjualan = (kloterId, saleId) => {
    setKloters((prev) =>
      prev.map((k) => {
        if (k.id === kloterId) {
          return {
            ...k,
            penjualanList: (k.penjualanList || []).filter((s) => s.id !== saleId),
          };
        }
        return k;
      })
    );
    pushAuditLog(
      'Penjualan',
      'Hapus Transaksi Penjualan',
      `Menghapus transaksi penjualan ${saleId} dari kloter ${kloterId}.`
    );
  };

  const handleUpdateHarga = (hargaBaru, catatan) => {
    const newLog = {
      id: `H-${Date.now().toString().slice(-3)}`,
      hargaPerOns: hargaBaru,
      berlakuMulai: new Date().toISOString().split('T')[0],
      diubahOleh: currentUser ? `${currentUser.nama} (${currentUser.labelRole})` : 'Admin',
      catatan,
    };

    setHargaConfig((prev) => ({
      hargaPerOnsAktif: hargaBaru,
      berlakuMulai: new Date().toISOString().split('T')[0],
      terakhirDiubahOleh: newLog.diubahOleh,
      riwayatHarga: [newLog, ...prev.riwayatHarga],
    }));

    pushAuditLog(
      'Pengaturan Harga',
      'Ubah Harga Per Ons',
      `Memperbarui harga acuan per ons menjadi Rp ${hargaBaru}. Catatan: ${catatan}.`
    );
  };

  const handleUpdateKloterStatus = (kloterId, statusBaru) => {
    setKloters((prev) =>
      prev.map((k) => (k.id === kloterId ? { ...k, status: statusBaru } : k))
    );
    pushAuditLog(
      'Manajemen Kloter',
      'Ubah Status Kloter',
      `Mengubah status kloter ${kloterId} menjadi '${statusBaru}'.`
    );
  };

  // User Management Handlers
  const handleTambahUser = (newUser) => {
    const userObj = {
      id: `USR-${(users.length + 1).toString().padStart(3, '0')}`,
      ...newUser,
      status: 'Aktif',
      lastLogin: 'Belum pernah',
    };
    setUsers((prev) => [...prev, userObj]);
    pushAuditLog(
      'Manajemen User',
      'Tambah User Baru',
      `Menambah user baru ${newUser.nama} (${newUser.labelRole || newUser.role}).`
    );
  };

  const handleEditUser = (userId, updatedData) => {
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

    pushAuditLog(
      'Manajemen User',
      'Edit Data User',
      `Memperbarui data user ${targetUser?.nama || userId} (Username: ${updatedData.username || targetUser?.username}).`
    );
  };

  const handleDeleteUser = (userId) => {
    const targetUser = users.find((u) => u.id === userId);
    if (currentRole === 'admin' && targetUser?.role === 'super_admin') {
      alert('Admin tidak memiliki wewenang untuk menghapus akun Super Admin!');
      return;
    }

    setUsers((prev) => prev.filter((u) => u.id !== userId));
    pushAuditLog(
      'Manajemen User',
      'Hapus User',
      `Menghapus akun user ${targetUser?.nama || userId}.`
    );
  };

  // If not logged in, render Login Page!
  if (!currentUser) {
    return (
      <LoginPage
        users={users}
        activePrice={hargaConfig.hargaPerOnsAktif}
        onLogin={handleLogin}
      />
    );
  }

  // Resolve current active tab view name
  const tabNames = {
    dashboard: 'Dashboard Analitik',
    kloter: selectedKloterId ? 'Detail Kloter' : 'Manajemen Kloter',
    penjualan: 'Data & Transaksi Penjualan',
    harga: 'Pengaturan Harga per Ons',
    laporan: 'Laporan & Perbandingan Kloter',
    jadwal_export: 'Pengaturan Kirim Export PDF',
    user: 'Manajemen User & Hak Akses',
  };

  // Find selected kloter object
  const currentKloterObj = kloters.find((k) => k.id === selectedKloterId);

  return (
    <div className="app-container min-h-screen bg-sky-50/50 flex flex-col font-sans overflow-x-hidden">
      {/* Top Header Bar */}
      <Header
        activePrice={hargaConfig.hargaPerOnsAktif}
        currentViewName={tabNames[currentTab]}
      />

      <div className="main-content-wrapper flex flex-1">
        {/* Desktop Sidebar Navigation */}
        <Sidebar
          currentTab={currentTab}
          setCurrentTab={(tab) => {
            setSelectedKloterId(null);
            setCurrentTab(tab);
          }}
          currentRole={currentRole}
          currentUser={currentUser}
          onLogout={handleLogout}
        />

        {/* Main View Area */}
        <main className="page-container flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full min-w-0 pb-20 md:pb-8">
          {currentTab === 'dashboard' && (
            <Dashboard
              kloters={kloters}
              activeHargaPerOns={hargaConfig.hargaPerOnsAktif}
              currentRole={currentRole}
              onSelectKloter={(id) => {
                if (id) {
                  setSelectedKloterId(id);
                  setCurrentTab('kloter');
                } else {
                  setCurrentTab('kloter');
                }
              }}
            />
          )}

          {currentTab === 'kloter' &&
            (!selectedKloterId || !currentKloterObj ? (
              <KloterList
                kloters={kloters}
                activeHargaPerOns={hargaConfig.hargaPerOnsAktif}
                currentRole={currentRole}
                onSelectKloter={(id) => setSelectedKloterId(id)}
                onOpenModal={(modalName) => setActiveModal(modalName)}
              />
            ) : (
              <KloterDetail
                kloter={currentKloterObj}
                activeHargaPerOns={hargaConfig.hargaPerOnsAktif}
                currentRole={currentRole}
                onBack={() => setSelectedKloterId(null)}
                onOpenModal={(modalName) => setActiveModal(modalName)}
                onUpdateStatus={handleUpdateKloterStatus}
              />
            ))}

          {currentTab === 'penjualan' && (
            <PenjualanView
              kloters={kloters}
              activeHargaPerOns={hargaConfig.hargaPerOnsAktif}
              currentRole={currentRole}
              onOpenModal={(modalName) => setActiveModal(modalName)}
              onEditPenjualan={handleEditPenjualan}
              onDeletePenjualan={handleDeletePenjualan}
            />
          )}

          {currentTab === 'harga' && (
            <PengaturanHarga
              hargaConfig={hargaConfig}
              currentRole={currentRole}
              onUpdateHarga={handleUpdateHarga}
            />
          )}

          {currentTab === 'laporan' && (
            <LaporanAnalytics
              kloters={kloters}
              activeHargaPerOns={hargaConfig.hargaPerOnsAktif}
            />
          )}

          {currentTab === 'jadwal_export' && (currentRole === 'super_admin' || currentRole === 'admin') && (
            <JadwalExportView
              kloters={kloters}
              users={users}
              activeHargaPerOns={hargaConfig.hargaPerOnsAktif}
            />
          )}

          {currentTab === 'user' && (currentRole === 'super_admin' || currentRole === 'admin') && (
            <UserManagement
              users={users}
              currentUser={currentUser}
              currentRole={currentRole}
              onTambahUser={handleTambahUser}
              onEditUser={handleEditUser}
              onDeleteUser={handleDeleteUser}
            />
          )}
        </main>
      </div>

      {/* Touch-Friendly Mobile Bottom Navigation */}
      <MobileNav
        currentTab={currentTab}
        setCurrentTab={(tab) => {
          setSelectedKloterId(null);
          setCurrentTab(tab);
        }}
        currentRole={currentRole}
      />

      {/* Modal Dialog Manager */}
      <Modals
        activeModal={activeModal}
        selectedKloterId={selectedKloterId}
        kloters={kloters}
        activeHargaPerOns={hargaConfig.hargaPerOnsAktif}
        currentRole={currentRole}
        onClose={() => setActiveModal(null)}
        onSubmitTambahKloter={handleTambahKloter}
        onSubmitPengeluaran={handlePengeluaran}
        onSubmitKematian={handleKematian}
        onSubmitPanen={handlePanen}
        onSubmitPenjualan={handlePenjualan}
      />
    </div>
  );
}
