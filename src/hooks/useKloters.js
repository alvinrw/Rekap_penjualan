import { useState, useCallback, useEffect } from 'react';
import { api } from '../services/api';
import { initialKloters } from '../data/initialData';
import { calculateKloterMetrics } from '../utils/calculations';

export function useKloters(pushAuditLog, currentUser) {
  const [kloters, setKloters] = useState(() => {
    const saved = localStorage.getItem('pendataan_kloters');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {}
    }
    return initialKloters;
  });
  const [isLoading, setIsLoading] = useState(false);

  // Sync state to localStorage whenever kloters change
  useEffect(() => {
    if (Array.isArray(kloters)) {
      localStorage.setItem('pendataan_kloters', JSON.stringify(kloters));
    }
  }, [kloters]);

  // Fetch Kloters from Backend
  const loadKloters = useCallback(async () => {
    try {
      setIsLoading(true);
      const backendKloters = await api.getKloters();
      if (Array.isArray(backendKloters) && backendKloters.length > 0) {
        setKloters(backendKloters);
      }
    } catch (err) {
      console.warn('Backend sync kloters error:', err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 1. Create Kloter
  const handleTambahKloter = async (formData) => {
    const newKloterId = `KLT-2026-${(kloters.length + 1).toString().padStart(2, '0')}`;
    const tempKloter = {
      id: newKloterId,
      namaKloter: formData.namaKloter,
      kandang: formData.kandang,
      tanggalBeliDoc: formData.tanggalBeliDoc,
      docAwal: Number(formData.docAwal),
      hargaDocPerEkor: Number(formData.hargaDocPerEkor),
      status: 'Aktif',
      catatanAwal: formData.catatanAwal,
      pengeluaranList: [],
      kematianList: [],
      panenList: [],
      penjualanList: [],
    };

    setKloters((prev) => [tempKloter, ...prev]);
    if (pushAuditLog) {
      pushAuditLog(
        'Manajemen Kloter',
        'Buat Kloter Baru',
        `Membuat ${formData.namaKloter} dengan DOC awal ${formData.docAwal} ekor @ Rp ${formData.hargaDocPerEkor}.`
      );
    }

    try {
      const created = await api.createKloter({ ...formData, customId: newKloterId });
      if (created?.id) {
        setKloters((prev) => prev.map((k) => (k.id === newKloterId ? created : k)));
      }
    } catch (err) {
      console.warn('Kloter create backend sync warning:', err.message);
    }
  };

  // 2. Update Kloter
  const handleEditKloter = async (formData) => {
    setKloters((prev) =>
      prev.map((k) => (k.id === formData.id ? { ...k, ...formData } : k))
    );
    if (pushAuditLog) {
      pushAuditLog(
        'Manajemen Kloter',
        'Edit Kloter',
        `Memperbarui data kloter ${formData.namaKloter} (${formData.id}).`
      );
    }

    try {
      await api.updateKloter(formData.id, formData);
    } catch (err) {
      console.warn('Kloter update backend sync warning:', err.message);
    }
  };

  // 3. Delete Kloter
  const handleDeleteKloter = async (kloterId, selectedKloterId, setSelectedKloterId) => {
    setKloters((prev) => prev.filter((k) => k.id !== kloterId));
    if (selectedKloterId === kloterId && setSelectedKloterId) {
      setSelectedKloterId(null);
    }
    if (pushAuditLog) {
      pushAuditLog('Manajemen Kloter', 'Hapus Kloter', `Menghapus kloter ${kloterId} beserta seluruh transaksinya.`);
    }

    try {
      await api.deleteKloter(kloterId);
    } catch (err) {
      console.warn('Kloter delete backend sync warning:', err.message);
    }
  };

  // 4. Create Pengeluaran
  const handlePengeluaran = async (formData) => {
    const userName = currentUser ? currentUser.nama : 'Admin';
    const newExp = {
      id: `EXP-${Date.now().toString().slice(-4)}`,
      tanggal: formData.tanggal,
      kategori: formData.kategori,
      keterangan: formData.keterangan,
      jumlahKg: Number(formData.jumlahKg) || 0,
      jumlahRp: Number(formData.jumlahRp) || 0,
      dicatatOleh: userName,
    };

    setKloters((prev) =>
      prev.map((k) => {
        if (k.id === formData.kloterId) {
          return {
            ...k,
            pengeluaranList: [newExp, ...(k.pengeluaranList || [])],
          };
        }
        return k;
      })
    );

    if (pushAuditLog) {
      pushAuditLog(
        'Pengeluaran',
        'Input Pengeluaran Baru',
        `Catat biaya ${formData.kategori} (${formData.keterangan}) sebesar Rp ${formData.jumlahRp} pada kloter ${formData.kloterId}.`
      );
    }

    try {
      await api.createPengeluaran({
        ...formData,
        dicatatOleh: userName,
      });
    } catch (err) {
      console.warn('Pengeluaran backend sync warning:', err.message);
    }
  };

  // 5. Delete Pengeluaran
  const handleDeletePengeluaran = async (kloterId, itemId) => {
    setKloters((prev) =>
      prev.map((k) => (k.id === kloterId ? { ...k, pengeluaranList: (k.pengeluaranList || []).filter((x) => x.id !== itemId) } : k))
    );
    if (pushAuditLog) {
      pushAuditLog('Pengeluaran', 'Hapus Pengeluaran', `Hapus pengeluaran dari kloter ${kloterId}`);
    }
    try { await api.deletePengeluaran(itemId); } catch (e) {}
  };

  // 6. Create Kematian
  const handleKematian = async (formData) => {
    const userName = currentUser ? currentUser.nama : 'Admin';
    const newDeath = {
      id: `DTH-${Date.now().toString().slice(-4)}`,
      tanggal: formData.tanggal,
      jumlahEkor: Number(formData.jumlahEkor) || 0,
      penyebab: formData.penyebab,
      dicatatOleh: userName,
    };

    setKloters((prev) =>
      prev.map((k) => {
        if (k.id === formData.kloterId) {
          return {
            ...k,
            kematianList: [newDeath, ...(k.kematianList || [])],
          };
        }
        return k;
      })
    );

    if (pushAuditLog) {
      pushAuditLog(
        'Kematian Ayam',
        'Input Catatan Kematian',
        `Catat kematian ${formData.jumlahEkor} ekor di kloter ${formData.kloterId}. Indikasi: ${formData.penyebab}.`
      );
    }

    try {
      await api.createKematian({
        ...formData,
        dicatatOleh: userName,
      });
    } catch (err) {
      console.warn('Kematian backend sync warning:', err.message);
    }
  };

  // 7. Delete Kematian
  const handleDeleteKematian = async (kloterId, itemId) => {
    setKloters((prev) =>
      prev.map((k) => (k.id === kloterId ? { ...k, kematianList: (k.kematianList || []).filter((x) => x.id !== itemId) } : k))
    );
    if (pushAuditLog) {
      pushAuditLog('Kematian Ayam', 'Hapus Kematian', `Hapus catatan kematian dari kloter ${kloterId}`);
    }
    try { await api.deleteKematian(itemId); } catch (e) {}
  };

  // 8. Create Panen
  const handlePanen = async (formData) => {
    const userName = currentUser ? currentUser.nama : 'Admin';
    const newPanen = {
      id: `HV-${Date.now().toString().slice(-4)}`,
      tanggal: formData.tanggal,
      jumlahEkor: Number(formData.jumlahEkor) || 0,
      catatan: formData.catatan,
      dicatatOleh: userName,
    };

    setKloters((prev) =>
      prev.map((k) => {
        if (k.id === formData.kloterId) {
          return {
            ...k,
            panenList: [newPanen, ...(k.panenList || [])],
          };
        }
        return k;
      })
    );

    if (pushAuditLog) {
      pushAuditLog(
        'Panen',
        'Input Panen Bertahap',
        `Mencatat panen ${formData.jumlahEkor} ekor di kloter ${formData.kloterId}.`
      );
    }

    try {
      await api.createPanen({
        ...formData,
        dicatatOleh: userName,
      });
    } catch (err) {
      console.warn('Panen backend sync warning:', err.message);
    }
  };

  // 9. Delete Panen
  const handleDeletePanen = async (kloterId, itemId) => {
    setKloters((prev) =>
      prev.map((k) => (k.id === kloterId ? { ...k, panenList: (k.panenList || []).filter((x) => x.id !== itemId) } : k))
    );
    if (pushAuditLog) {
      pushAuditLog('Panen', 'Hapus Panen', `Hapus catatan panen dari kloter ${kloterId}`);
    }
    try { await api.deletePanen(itemId); } catch (e) {}
  };

  // 10. Create Penjualan
  const handlePenjualan = async (formData) => {
    const targetKloter = kloters.find((k) => k.id === formData.kloterId);
    const jumlahEkor = Number(formData.jumlahEkor) || 0;
    const metrics = targetKloter ? calculateKloterMetrics(targetKloter) : null;

    if (!targetKloter || !metrics || metrics.stokSiapJual <= 0) {
      alert('Penjualan tidak dapat disimpan karena stok ayam sudah habis.');
      return false;
    }

    if (jumlahEkor > metrics.stokSiapJual) {
      alert(`Jumlah ayam yang dijual melebihi stok. Stok tersedia hanya ${metrics.stokSiapJual} ekor.`);
      return false;
    }

    const userName = currentUser ? currentUser.nama : 'Admin';
    const newSales = {
      id: `SL-${Date.now().toString().slice(-4)}`,
      noStruk: (Date.now() % 1000000).toString().padStart(6, '0'),
      tanggal: formData.tanggal,
      pembeli: formData.pembeli,
      kategoriPembeli: formData.kategoriPembeli || 'Pembeli Toko',
      jumlahEkor,
      beratGram: Number(formData.beratGram),
      hargaPerOnsSnapshot: Number(formData.hargaPerOnsSnapshot),
      totalHarga: Number(formData.totalHarga),
      metodePembayaran: formData.metodePembayaran,
      catatanNota: formData.catatanNota,
      dicatatOleh: userName,
    };

    setKloters((prev) =>
      prev.map((k) => {
        if (k.id === formData.kloterId) {
          return {
            ...k,
            penjualanList: [newSales, ...(k.penjualanList || [])],
          };
        }
        return k;
      })
    );

    const ons = formData.beratGram / 100;
    if (pushAuditLog) {
      pushAuditLog(
        'Penjualan',
        'Input Penjualan Baru',
        `Mencatat penjualan kloter ${formData.kloterId} ke ${formData.pembeli} sebesar ${formData.beratGram} gram (${ons} ons) snapshot Rp ${formData.hargaPerOnsSnapshot}/ons. Total: Rp ${formData.totalHarga}.`
      );
    }

    try {
      const createdSale = await api.createSale({
        ...formData,
        dicatatOleh: userName,
      });
      if (createdSale?.id) {
        setKloters((prev) =>
          prev.map((k) => {
            if (k.id === formData.kloterId) {
              return {
                ...k,
                penjualanList: (k.penjualanList || []).map((s) => (s.id === newSales.id ? createdSale : s)),
              };
            }
            return k;
          })
        );
      }
    } catch (err) {
      console.warn('Penjualan backend sync warning:', err.message);
    }

    return true;
  };

  // 11. Edit Penjualan
  const handleEditPenjualan = async (kloterId, saleId, updatedData) => {
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
    if (pushAuditLog) {
      pushAuditLog(
        'Penjualan',
        'Edit Transaksi Penjualan',
        `Memperbarui transaksi penjualan ${saleId} di kloter ${kloterId} pembeli ${updatedData.pembeli}.`
      );
    }

    try {
      await api.updateSale(saleId, updatedData);
    } catch (err) {
      console.warn('Edit sale backend sync warning:', err.message);
    }
  };

  // 12. Delete Penjualan
  const handleDeletePenjualan = async (kloterId, saleId) => {
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
    if (pushAuditLog) {
      pushAuditLog(
        'Penjualan',
        'Hapus Transaksi Penjualan',
        `Menghapus transaksi penjualan ${saleId} di kloter ${kloterId}.`
      );
    }

    try {
      await api.deleteSale(saleId);
    } catch (err) {
      console.warn('Delete sale backend sync warning:', err.message);
    }
  };

  return {
    kloters,
    setKloters,
    isLoading,
    loadKloters,
    handleTambahKloter,
    handleEditKloter,
    handleDeleteKloter,
    handlePengeluaran,
    handleDeletePengeluaran,
    handleKematian,
    handleDeleteKematian,
    handlePanen,
    handleDeletePanen,
    handlePenjualan,
    handleEditPenjualan,
    handleDeletePenjualan,
  };
}
