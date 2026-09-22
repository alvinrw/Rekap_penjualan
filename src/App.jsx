import React, { useState, useEffect } from 'react';
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
import { ModalKonfirmasiHapus } from './components/modals/ModalKonfirmasiHapus';
import { LoginPage } from './components/LoginPage';
import { api } from './services/api';

import { useKloters } from './hooks/useKloters';
import { useUsers } from './hooks/useUsers';

import {
  initialHargaConfig,
  initialAuditLogs,
} from './data/initialData';

export default function App() {
  // Navigation & UI State
  const [currentTab, setCurrentTab] = useState('dashboard'); // 'dashboard' | 'kloter' | 'penjualan' | 'harga' | 'laporan' | 'user'
  const [selectedKloterId, setSelectedKloterId] = useState(null);
  const [editingKloterId, setEditingKloterId] = useState(null);
  const [activeModal, setActiveModal] = useState(null);
  const [deleteConfirmModal, setDeleteConfirmModal] = useState(null);

  // Config & Logs
  const [hargaConfig, setHargaConfig] = useState(() => {
    const saved = localStorage.getItem('pendataan_harga_config');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return initialHargaConfig;
  });

  const [auditLogs, setAuditLogs] = useState(() => {
    const saved = localStorage.getItem('pendataan_audit_logs');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {}
    }
    return initialAuditLogs;
  });

  const [isLoadingData, setIsLoadingData] = useState(false);

  useEffect(() => {
    if (hargaConfig) {
      localStorage.setItem('pendataan_harga_config', JSON.stringify(hargaConfig));
    }
  }, [hargaConfig]);

  useEffect(() => {
    if (Array.isArray(auditLogs)) {
      localStorage.setItem('pendataan_audit_logs', JSON.stringify(auditLogs));
    }
  }, [auditLogs]);

  // Helper to log audit entries
  const pushAuditLog = async (modul, aksi, deskripsi) => {
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

    try {
      await api.createAuditLog({ modul, aksi, deskripsi, user: userName });
    } catch (err) {
      // Backend log sync fallback
    }
  };

  // Custom Hooks for State Management
  const {
    users,
    currentUser,
    setCurrentUser,
    loadUsers,
    handleTambahUser,
    handleEditUser,
    handleToggleStatusUser,
    handleUbahPasswordSelf,
  } = useUsers(pushAuditLog);

  const {
    kloters,
    setKloters,
    loadKloters,
    handleTambahKloter: submitTambahKloter,
    handleEditKloter: submitEditKloter,
    handleDeleteKloter: submitDeleteKloter,
    handlePengeluaran: submitPengeluaran,
    handleDeletePengeluaran,
    handleKematian: submitKematian,
    handleDeleteKematian,
    handlePanen: submitPanen,
    handleDeletePanen,
    handlePenjualan: submitPenjualan,
    handleEditPenjualan,
    handleDeletePenjualan,
  } = useKloters(pushAuditLog, currentUser);

  const currentRole = currentUser?.role || 'viewer';

  // Load Initial Data from Backend API
  const refreshAllData = async () => {
    try {
      setIsLoadingData(true);
      await Promise.allSettled([
        loadUsers(),
        loadKloters(),
        (async () => {
          try {
            const backendHarga = await api.getHargaConfig();
            if (backendHarga?.hargaPerOnsAktif) setHargaConfig(backendHarga);
          } catch (e) {}
        })(),
        (async () => {
          try {
            const backendLogs = await api.getAuditLogs();
            if (Array.isArray(backendLogs)) setAuditLogs(backendLogs);
          } catch (e) {}
        })(),
      ]);
    } catch (err) {
      console.warn('Backend sync warning:', err.message);
    } finally {
      setIsLoadingData(false);
    }
  };

  useEffect(() => {
    refreshAllData();
  }, [loadUsers, loadKloters]);

  const handleLogin = async (user) => {
    setCurrentUser(user);
    try {
      await api.login(user.username, user.password);
    } catch (err) {}
    pushAuditLog('Autentikasi', 'Login Pengguna', `User ${user.nama} berhasil masuk ke sistem dengan role ${user.labelRole}.`);
  };

  const handleLogout = async () => {
    if (currentUser) {
      try {
        await api.logout(currentUser.id);
      } catch (err) {}
      pushAuditLog('Autentikasi', 'Logout Pengguna', `User ${currentUser.nama} keluar dari sistem.`);
    }
    setCurrentUser(null);
  };

  // Wrapped modal submit handlers to close modal on submit
  const handleTambahKloter = async (formData) => {
    await submitTambahKloter(formData);
    setActiveModal(null);
  };

  const handleEditKloter = async (formData) => {
    await submitEditKloter(formData);
    setActiveModal(null);
  };

  const handleRequestDeleteKloter = (kloterId) => {
    const target = kloters.find((k) => k.id === kloterId);
    const kloterName = target ? `${target.namaKloter} (${target.kandang || 'Kandang'})` : kloterId;
    setDeleteConfirmModal({
      title: 'Hapus Kloter',
      message: `PERINGATAN: Menghapus kloter '${kloterName}' akan menghapus SEMUA data transaksi di dalamnya. Lanjutkan?`,
      submessage: 'Tindakan ini tidak dapat dibatalkan dan akan memperbarui kalkulasi otomatis.',
      confirmText: 'Ya, Hapus Kloter',
      onConfirm: async () => {
        await submitDeleteKloter(kloterId, selectedKloterId, setSelectedKloterId);
      },
    });
  };

  const handleRequestDeletePengeluaran = (kloterId, itemId) => {
    setDeleteConfirmModal({
      title: 'Hapus Catatan Pengeluaran',
      message: 'Apakah Anda yakin ingin menghapus catatan pengeluaran ini?',
      submessage: 'Tindakan ini tidak dapat dibatalkan dan akan memperbarui total modal kloter.',
      confirmText: 'Ya, Hapus Pengeluaran',
      onConfirm: async () => {
        await handleDeletePengeluaran(kloterId, itemId);
      },
    });
  };

  const handleRequestDeleteKematian = (kloterId, itemId) => {
    setDeleteConfirmModal({
      title: 'Hapus Catatan Kematian',
      message: 'Apakah Anda yakin ingin menghapus catatan kematian ini?',
      submessage: 'Tindakan ini tidak dapat dibatalkan dan akan menyesuaikan jumlah sisa ayam.',
      confirmText: 'Ya, Hapus Catatan',
      onConfirm: async () => {
        await handleDeleteKematian(kloterId, itemId);
      },
    });
  };

  const handleRequestDeletePanen = (kloterId, itemId) => {
    setDeleteConfirmModal({
      title: 'Hapus Catatan Panen',
      message: 'Apakah Anda yakin ingin menghapus catatan panen ini?',
      submessage: 'Tindakan ini tidak dapat dibatalkan dan akan memperbarui akumulasi panen.',
      confirmText: 'Ya, Hapus Catatan',
      onConfirm: async () => {
        await handleDeletePanen(kloterId, itemId);
      },
    });
  };

  const handleRequestDeletePenjualan = (kloterId, saleId, saleObj) => {
    const buyerInfo = saleObj ? ` dari '${saleObj.pembeli}'` : '';
    setDeleteConfirmModal({
      title: 'Hapus Transaksi Penjualan',
      message: `Apakah Anda yakin ingin menghapus data transaksi penjualan${buyerInfo}?`,
      submessage: 'Tindakan ini tidak dapat dibatalkan dan akan memperbarui sisa ayam serta kalkulasi.',
      confirmText: 'Ya, Hapus Penjualan',
      onConfirm: async () => {
        await handleDeletePenjualan(kloterId, saleId);
      },
    });
  };

  const handlePengeluaran = async (formData) => {
    await submitPengeluaran(formData);
    setActiveModal(null);
  };

  const handleKematian = async (formData) => {
    await submitKematian(formData);
    setActiveModal(null);
  };

  const handlePanen = async (formData) => {
    await submitPanen(formData);
    setActiveModal(null);
  };

  const handlePenjualan = async (formData) => {
    const saved = await submitPenjualan(formData);
    if (saved !== false) setActiveModal(null);
  };

  const handleUpdateHarga = async (hargaBaru, catatan) => {
    const diubahOleh = currentUser ? `${currentUser.nama} (${currentUser.labelRole})` : 'Admin';
    const newLog = {
      id: `H-${Date.now().toString().slice(-3)}`,
      hargaPerOns: Number(hargaBaru),
      berlakuMulai: new Date().toISOString().split('T')[0],
      diubahOleh,
      catatan,
    };

    setHargaConfig((prev) => ({
      hargaPerOnsAktif: Number(hargaBaru),
      berlakuMulai: new Date().toISOString().split('T')[0],
      terakhirDiubahOleh: diubahOleh,
      riwayatHarga: [newLog, ...(prev.riwayatHarga || [])],
    }));

    pushAuditLog(
      'Pengaturan Harga',
      'Ubah Harga Per Ons',
      `Memperbarui harga acuan per ons menjadi Rp ${hargaBaru}. Catatan: ${catatan}.`
    );

    try {
      await api.updateHarga(hargaBaru, catatan, diubahOleh);
    } catch (err) {
      console.warn('Harga backend sync warning:', err.message);
    }
  };

  const handleUpdateKloterStatus = async (kloterId, statusBaru) => {
    setKloters((prev) =>
      prev.map((k) => (k.id === kloterId ? { ...k, status: statusBaru } : k))
    );
    pushAuditLog(
      'Manajemen Kloter',
      'Ubah Status Kloter',
      `Mengubah status kloter ${kloterId} menjadi '${statusBaru}'.`
    );

    try {
      await api.updateKloterStatus(kloterId, statusBaru);
    } catch (err) {
      console.warn('Update kloter status backend sync warning:', err.message);
    }
  };

  const selectedKloter = kloters.find((k) => k.id === (editingKloterId || selectedKloterId));

  // If user is not logged in, render Login screen
  if (!currentUser) {
    return <LoginPage onLogin={handleLogin} users={users} activePrice={hargaConfig.hargaPerOnsAktif} />;
  }

  return (
    <div className="app-shell flex h-screen bg-slate-100 overflow-hidden font-sans">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex flex-shrink-0">
        <Sidebar
          currentTab={currentTab}
          setCurrentTab={setCurrentTab}
          setSelectedKloterId={setSelectedKloterId}
          currentRole={currentRole}
          currentUser={currentUser}
          onLogout={handleLogout}
          onOpenModal={(modal) => setActiveModal(modal)}
        />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile Navigation Bar */}
        <div className="md:hidden flex-shrink-0">
          <MobileNav
            currentTab={currentTab}
            setCurrentTab={setCurrentTab}
            setSelectedKloterId={setSelectedKloterId}
            currentRole={currentRole}
            currentUser={currentUser}
            onLogout={handleLogout}
            onOpenModal={(modal) => setActiveModal(modal)}
          />
        </div>

        {/* Dynamic Page Routing View */}
        <main className="app-main flex-1 overflow-y-auto p-4 sm:p-6 md:p-8">
          {currentTab === 'dashboard' && (
            <Dashboard
              kloters={kloters}
              activeHargaPerOns={hargaConfig.hargaPerOnsAktif}
              currentRole={currentRole}
              onNavigate={(tab, kloterId) => {
                setCurrentTab(tab);
                if (kloterId) setSelectedKloterId(kloterId);
              }}
              onOpenModal={(modal, kloterId) => {
                if (kloterId) setSelectedKloterId(kloterId);
                setActiveModal(modal);
              }}
            />
          )}

          {currentTab === 'kloter' && (
            selectedKloterId ? (
              <KloterDetail
                kloter={kloters.find((k) => k.id === selectedKloterId) || kloters[0]}
                activeHargaPerOns={hargaConfig.hargaPerOnsAktif}
                currentRole={currentRole}
                onBack={() => setSelectedKloterId(null)}
                onOpenModal={(modal, id) => {
                  setSelectedKloterId(id);
                  setActiveModal(modal);
                }}
                onUpdateStatus={handleUpdateKloterStatus}
                onDeletePengeluaran={handleRequestDeletePengeluaran}
                onDeleteKematian={handleRequestDeleteKematian}
                onDeletePanen={handleRequestDeletePanen}
                onDeletePenjualan={handleRequestDeletePenjualan}
                onEditKloter={(k) => {
                  setEditingKloterId(k.id);
                  setActiveModal('edit_kloter');
                }}
                onDeleteKloter={handleRequestDeleteKloter}
              />
            ) : (
              <KloterList
                kloters={kloters}
                activeHargaPerOns={hargaConfig.hargaPerOnsAktif}
                currentRole={currentRole}
                onSelectKloter={(id) => setSelectedKloterId(id)}
                onOpenModal={(modal, id) => {
                  if (modal === 'edit_kloter' && id) {
                    setEditingKloterId(id);
                  } else if (id) {
                    setSelectedKloterId(id);
                  }
                  setActiveModal(modal);
                }}
                onEditKloter={(kloter) => {
                  setEditingKloterId(kloter.id);
                  setActiveModal('edit_kloter');
                }}
                onDeleteKloter={handleRequestDeleteKloter}
              />
            )
          )}

          {currentTab === 'penjualan' && (
            <PenjualanView
              kloters={kloters}
              activeHargaPerOns={hargaConfig.hargaPerOnsAktif}
              currentRole={currentRole}
              onOpenModal={(modal, id) => {
                if (id) setSelectedKloterId(id);
                setActiveModal(modal);
              }}
              onEditPenjualan={handleEditPenjualan}
              onDeletePenjualan={handleRequestDeletePenjualan}
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
              users={users}
              auditLogs={auditLogs}
            />
          )}

          {currentTab === 'jadwal_export' && (
            <JadwalExportView
              kloters={kloters}
              users={users}
              auditLogs={[]}
              activeHargaPerOns={hargaConfig.hargaPerOnsAktif}
            />
          )}

          {currentTab === 'user' && (
            <UserManagement
              users={users}
              currentUser={currentUser}
              onTambahUser={handleTambahUser}
              onEditUser={handleEditUser}
              onToggleStatus={handleToggleStatusUser}
              onUbahPassword={handleUbahPasswordSelf}
            />
          )}
        </main>
      </div>

      {/* Centralized Modal Manager Component */}
      <Modals
        activeModal={activeModal}
        selectedKloterId={editingKloterId || selectedKloterId}
        kloters={kloters}
        activeHargaPerOns={hargaConfig.hargaPerOnsAktif}
        currentRole={currentRole}
        onClose={() => {
          setActiveModal(null);
          setEditingKloterId(null);
        }}
        onSubmitTambahKloter={handleTambahKloter}
        onSubmitPengeluaran={handlePengeluaran}
        onSubmitKematian={handleKematian}
        onSubmitPanen={handlePanen}
        onSubmitPenjualan={handlePenjualan}
        onSubmitEditKloter={handleEditKloter}
      />

      {/* Delete Confirmation Modal UI */}
      {deleteConfirmModal && (
        <ModalKonfirmasiHapus
          title={deleteConfirmModal.title}
          message={deleteConfirmModal.message}
          submessage={deleteConfirmModal.submessage}
          confirmText={deleteConfirmModal.confirmText}
          onClose={() => setDeleteConfirmModal(null)}
          onConfirm={deleteConfirmModal.onConfirm}
        />
      )}
    </div>
  );
}
