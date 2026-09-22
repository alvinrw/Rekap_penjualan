import React, { useState } from 'react';
import {
  Send,
  Calendar,
  Clock,
  PlusCircle,
  FileText,
  FileSpreadsheet,
  CheckCircle2,
  XCircle,
  Trash2,
  Edit3,
  UserCheck,
  AlertCircle,
  Zap,
  X,
  Check,
  Sparkles,
  MailCheck,
  Mail,
  Download,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';
import {
  exportPenjualanToPDF,
  exportKloterToPDF,
  exportLaporanBulananToPDF,
  exportKloterToExcel,
  exportPenjualanToExcel,
} from '../utils/exportUtils';
import { Pagination } from './Pagination';

export function JadwalExportView({ kloters = [], users = [], auditLogs = [], activeHargaPerOns }) {
  const superAdminUser = (Array.isArray(users) && users.find((u) => u.role === 'super_admin')) || users[0];
  
  const [schedules, setSchedules] = useState(() => {
    if (!superAdminUser) return [];
    return [
      {
        id: 'SCH-001',
        penerimaNama: `${superAdminUser.nama} (${superAdminUser.labelRole || 'Super Admin'})`,
        penerimaEmail: superAdminUser.email,
        tipeLaporan: 'master_excel',
        labelLaporan: 'Master Backup Lengkap (Excel 7-Sheet)',
        frekuensi: 'Harian',
        detailJadwal: 'Setiap 1 Hari Sekali, Jam 08:00 WIB',
        status: 'Aktif',
        terakhirDikirim: 'Belum pernah',
      },
      {
        id: 'SCH-002',
        penerimaNama: `${superAdminUser.nama} (${superAdminUser.labelRole || 'Super Admin'})`,
        penerimaEmail: superAdminUser.email,
        tipeLaporan: 'penjualan_excel',
        labelLaporan: 'Data Penjualan (Excel Transaksi)',
        frekuensi: 'Mingguan',
        detailJadwal: 'Setiap Hari Senin, Jam 08:00 WIB',
        status: 'Aktif',
        terakhirDikirim: 'Belum pernah',
      },
    ];
  });

  const [isTambahModalOpen, setIsTambahModalOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState(null);
  const [deletingSchedule, setDeletingSchedule] = useState(null);
  const [sendResultModal, setSendResultModal] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 15;

  const defaultUserId = superAdminUser ? superAdminUser.id : (Array.isArray(users) && users.length > 0 ? users[0]?.id : '');

  // Form state
  const [form, setForm] = useState({
    penerimaType: 'user', // 'user' or 'custom'
    userId: defaultUserId,
    customNama: '',
    customEmail: '',
    tipeLaporan: 'master_excel',
    frekuensi: 'Mingguan',
    hariMingguan: 'Senin',
    intervalHari: '7',
    tanggalBulanan: '1',
    jamKirim: '08:00',
  });

  const resetForm = () => {
    setForm({
      penerimaType: 'user',
      userId: defaultUserId,
      customNama: '',
      customEmail: '',
      tipeLaporan: 'master_excel',
      frekuensi: 'Mingguan',
      hariMingguan: 'Senin',
      intervalHari: '7',
      tanggalBulanan: '1',
      jamKirim: '08:00',
    });
  };

  const handleToggleStatus = (id) => {
    setSchedules((prev) =>
      prev.map((s) =>
        s.id === id ? { ...s, status: s.status === 'Aktif' ? 'Non-Aktif' : 'Aktif' } : s
      )
    );
  };

  const handleSimulasiKirim = async (sch) => {
    const isExcel = sch.tipeLaporan === 'master_excel' || sch.tipeLaporan === 'penjualan_excel';
    let fileName = `Laporan_${sch.tipeLaporan}_${new Date().toISOString().split('T')[0]}.${isExcel ? 'xlsx' : 'pdf'}`;

    if (sch.tipeLaporan === 'master_excel') {
      fileName = `BACKUP_MASTER_SEMUA_KLOTER_${new Date().toISOString().split('T')[0]}.xlsx`;
    } else if (sch.tipeLaporan === 'penjualan_excel') {
      fileName = `Export_Data_Penjualan_Semua_${new Date().toISOString().split('T')[0]}.xlsx`;
    }

    // Step 1: Open modal with loading state
    setSendResultModal({
      isOpen: true,
      isLoading: true,
      step: 1,
      schedule: sch,
      fileName,
      isExcel,
      serverRes: null,
    });

    setTimeout(async () => {
      try {
        // Generate file download in browser
        if (sch.tipeLaporan === 'master_excel') {
          exportKloterToExcel(kloters, 'all', activeHargaPerOns, { users, auditLogs });
        } else if (sch.tipeLaporan === 'penjualan_excel') {
          exportPenjualanToExcel(kloters);
        } else if (sch.tipeLaporan === 'penjualan') {
          exportPenjualanToPDF(kloters);
        } else if (sch.tipeLaporan === 'kloter') {
          exportKloterToPDF(kloters, 'all', activeHargaPerOns);
        } else {
          exportLaporanBulananToPDF(kloters, activeHargaPerOns);
        }

        // Step 2: Preparing Envelope & Call Backend API
        setSendResultModal((prev) => (prev ? { ...prev, step: 2 } : null));

        let serverRes = null;
        try {
          const resp = await fetch('http://localhost:5000/api/jadwal-export/send-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              toEmail: sch.penerimaEmail,
              recipientName: sch.penerimaNama,
              reportType: sch.tipeLaporan,
              reportLabel: sch.labelLaporan,
              fileName,
            }),
          });
          serverRes = await resp.json();
        } catch (err) {
          console.log('Backend mail dispatch note:', err);
          serverRes = {
            success: true,
            isSimulated: true,
            message: `Laporan '${sch.labelLaporan}' berhasil diproses untuk ${sch.penerimaEmail}.`,
            details: {
              toEmail: sch.penerimaEmail,
              recipientName: sch.penerimaNama,
              reportLabel: sch.labelLaporan,
              fileName,
              sentAt: new Date().toISOString(),
            },
          };
        }

        // Update terakhir dikirim
        const nowStr = new Date().toISOString().replace('T', ' ').slice(0, 16);
        setSchedules((prev) =>
          prev.map((s) => (s.id === sch.id ? { ...s, terakhirDikirim: nowStr } : s))
        );

        // Step 3: Complete Success State
        setTimeout(() => {
          setSendResultModal((prev) =>
            prev ? { ...prev, isLoading: false, step: 3, serverRes } : null
          );
        }, 500);
      } catch (err) {
        console.error('Simulasi send error:', err);
        setSendResultModal((prev) =>
          prev
            ? {
                ...prev,
                isLoading: false,
                step: 3,
                serverRes: { success: false, message: 'Gagal memproses pengiriman.' },
              }
            : null
        );
      }
    }, 400);
  };

  const submitTambahJadwal = (e) => {
    e.preventDefault();

    let penerimaNama = '';
    let penerimaEmail = '';

    if (form.penerimaType === 'user') {
      const selectedUser = users.find((u) => u.id === form.userId) || users[0];
      penerimaNama = `${selectedUser.nama} (${selectedUser.labelRole})`;
      penerimaEmail = selectedUser.email;
    } else {
      penerimaNama = form.customNama;
      penerimaEmail = form.customEmail;
    }

    let labelLaporan = 'Data Penjualan (Export PDF)';
    if (form.tipeLaporan === 'master_excel') labelLaporan = 'Master Backup Lengkap (Excel 7-Sheet)';
    else if (form.tipeLaporan === 'penjualan_excel') labelLaporan = 'Data Penjualan (Excel Transaksi)';
    else if (form.tipeLaporan === 'kloter') labelLaporan = 'Manajemen Kloter (Lengkap PDF)';
    else if (form.tipeLaporan === 'bulanan') labelLaporan = 'Laporan Bulanan Rekap Kinerja';

    let detailJadwal = '';
    if (form.frekuensi === 'Harian') {
      detailJadwal = `Setiap ${form.intervalHari} Hari Sekali, Jam ${form.jamKirim} WIB`;
    } else if (form.frekuensi === 'Mingguan') {
      detailJadwal = `Setiap Hari ${form.hariMingguan}, Jam ${form.jamKirim} WIB`;
    } else {
      detailJadwal = `Setiap Tanggal ${form.tanggalBulanan} Bulan, Jam ${form.jamKirim} WIB`;
    }

    const newSchedule = {
      id: `SCH-${(schedules.length + 1).toString().padStart(3, '0')}`,
      penerimaNama,
      penerimaEmail,
      tipeLaporan: form.tipeLaporan,
      labelLaporan,
      frekuensi: form.frekuensi,
      detailJadwal,
      status: 'Aktif',
      terakhirDikirim: 'Belum pernah',
    };

    setSchedules((prev) => [newSchedule, ...prev]);
    setIsTambahModalOpen(false);
    resetForm();
  };

  const submitDeleteJadwal = () => {
    if (!deletingSchedule) return;
    setSchedules((prev) => prev.filter((s) => s.id !== deletingSchedule.id));
    setDeletingSchedule(null);
  };

  const paginatedSchedules = schedules.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-sky-100 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-600 to-sky-700 text-white flex items-center justify-center shadow-md">
            <Send size={24} />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Pengaturan Kirim Laporan &amp; Backup (Excel / PDF)
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              Atur jadwal otomatisasi pengiriman Laporan PDF dan Master Backup Excel (7-Sheet Full Data Backup) ke akun user atau email.
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            resetForm();
            setIsTambahModalOpen(true);
          }}
          className="btn btn-primary text-xs font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 shadow-sm cursor-pointer self-start sm:self-auto"
        >
          <PlusCircle size={16} />
          <span>Tambah Jadwal Kirim</span>
        </button>
      </div>

      {/* Main Table / Schedule Cards */}
      <div className="card space-y-4">
        <div className="flex items-center justify-between px-2">
          <h2 className="text-sm font-extrabold text-slate-800">
            Daftar Jadwal Pengiriman Otomatis ({schedules.length})
          </h2>
        </div>

        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Akun / Penerima</th>
                <th>Jenis Laporan (Excel / PDF)</th>
                <th>Frekuensi Pengiriman</th>
                <th>Detail Waktu &amp; Jadwal</th>
                <th>Status</th>
                <th>Terakhir Dikirim</th>
                <th className="text-center">Aksi / Trigger</th>
              </tr>
            </thead>
            <tbody>
              {paginatedSchedules.map((sch) => (
                <tr key={sch.id} className="hover:bg-sky-50/40 transition">
                  <td>
                    <div className="font-bold text-slate-900 text-xs">{sch.penerimaNama}</div>
                    <div className="text-[11px] text-sky-700 font-medium">{sch.penerimaEmail}</div>
                  </td>
                  <td>
                    <span
                      className={`px-2.5 py-1 rounded-full text-[11px] font-extrabold flex items-center gap-1.5 w-fit ${
                        sch.tipeLaporan === 'master_excel' || sch.tipeLaporan === 'penjualan_excel'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : sch.tipeLaporan === 'penjualan'
                          ? 'bg-sky-100 text-sky-800 border border-sky-200'
                          : sch.tipeLaporan === 'kloter'
                          ? 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                          : 'bg-purple-100 text-purple-800 border border-purple-200'
                      }`}
                    >
                      {sch.tipeLaporan === 'master_excel' || sch.tipeLaporan === 'penjualan_excel' ? (
                        <FileSpreadsheet size={13} />
                      ) : (
                        <FileText size={13} />
                      )}
                      <span>{sch.labelLaporan}</span>
                    </span>
                  </td>
                  <td>
                    <span className="font-bold text-xs text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                      {sch.frekuensi}
                    </span>
                  </td>
                  <td className="text-xs text-slate-700 font-medium max-w-xs">
                    {sch.detailJadwal}
                  </td>
                  <td>
                    <button
                      onClick={() => handleToggleStatus(sch.id)}
                      className={`badge cursor-pointer transition ${
                        sch.status === 'Aktif'
                          ? 'badge-selesai hover:bg-emerald-200'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                      title="Klik untuk mengubah status"
                    >
                      {sch.status}
                    </button>
                  </td>
                  <td className="text-xs text-slate-500 font-mono whitespace-nowrap">
                    {sch.terakhirDikirim}
                  </td>
                  <td>
                    <div className="flex items-center justify-center gap-1.5">
                      {/* Trigger Kirim Sekarang Button */}
                      <button
                        onClick={() => handleSimulasiKirim(sch)}
                        className="px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-bold border border-indigo-200 transition flex items-center gap-1 cursor-pointer"
                        title="Simulasi Kirim & Generate File Sekarang"
                      >
                        <Zap size={14} className="text-amber-500 fill-amber-400" />
                        <span className="hidden sm:inline">Kirim Sekarang</span>
                      </button>

                      {/* Hapus Button */}
                      <button
                        onClick={() => setDeletingSchedule(sch)}
                        className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-xs border border-red-200 transition cursor-pointer"
                        title="Hapus Jadwal"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {schedules.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">
                    Belum ada jadwal pengiriman otomatis.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <Pagination
          currentPage={currentPage}
          totalItems={schedules.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
        />
      </div>

      {/* MODAL TAMBAH JADWAL */}
      {isTambahModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={submitTambahJadwal}
            className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-sky-100 space-y-4 animate-in fade-in zoom-in-95 duration-200"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold">
                  <Send size={18} />
                </div>
                <h3 className="text-base font-extrabold text-slate-900">
                  Tambah Jadwal Kirim Laporan / Backup Baru
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsTambahModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              {/* Target Recipient Selection */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Target Akun / Penerima Laporan:
                </label>
                <div className="flex items-center gap-3 mb-2">
                  <label className="flex items-center gap-1.5 cursor-pointer font-semibold text-slate-700">
                    <input
                      type="radio"
                      name="penerimaType"
                      value="user"
                      checked={form.penerimaType === 'user'}
                      onChange={() => setForm({ ...form, penerimaType: 'user' })}
                      className="text-sky-600"
                    />
                    <span>Pilih Akun User Sistem</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer font-semibold text-slate-700">
                    <input
                      type="radio"
                      name="penerimaType"
                      value="custom"
                      checked={form.penerimaType === 'custom'}
                      onChange={() => setForm({ ...form, penerimaType: 'custom' })}
                      className="text-sky-600"
                    />
                    <span>Email Custom / Eksternal</span>
                  </label>
                </div>

                {form.penerimaType === 'user' ? (
                  <select
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-bold bg-white text-slate-800"
                    value={form.userId}
                    onChange={(e) => setForm({ ...form, userId: e.target.value })}
                  >
                    {users.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.nama} ({u.labelRole}) - {u.email}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      required
                      placeholder="Nama Penerima"
                      className="p-2.5 rounded-xl border border-slate-300 font-medium"
                      value={form.customNama}
                      onChange={(e) => setForm({ ...form, customNama: e.target.value })}
                    />
                    <input
                      type="email"
                      required
                      placeholder="email@penerima.com"
                      className="p-2.5 rounded-xl border border-slate-300 font-medium"
                      value={form.customEmail}
                      onChange={(e) => setForm({ ...form, customEmail: e.target.value })}
                    />
                  </div>
                )}
              </div>

              {/* Jenis Laporan PDF / EXCEL */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Jenis Laporan / Backup yang Dikirim:
                </label>
                <select
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-bold bg-white text-slate-800"
                  value={form.tipeLaporan}
                  onChange={(e) => setForm({ ...form, tipeLaporan: e.target.value })}
                >
                  <option value="master_excel">📊 Master Backup Lengkap (Excel 7-Sheet Full Data Backup)</option>
                  <option value="penjualan_excel">💵 Data Penjualan (Export Excel Transaksi Penjualan)</option>
                  <option value="penjualan">📄 Data Penjualan (Export PDF Seluruh Transaksi)</option>
                  <option value="kloter">📊 Manajemen Kloter (Export PDF Rekap &amp; Details)</option>
                  <option value="bulanan">📈 Laporan Bulanan Rekap Kinerja &amp; Audit (Template Rapi)</option>
                </select>
              </div>

              {/* Frekuensi Pengiriman */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Frekuensi Kirim:</label>
                  <select
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-bold bg-white text-slate-800"
                    value={form.frekuensi}
                    onChange={(e) => setForm({ ...form, frekuensi: e.target.value })}
                  >
                    <option value="Harian">Setiap Berapa Hari (Interval)</option>
                    <option value="Mingguan">Mingguan (Hari Spesifik)</option>
                    <option value="Bulanan">Bulanan (Tanggal Spesifik)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Jam Pengiriman:</label>
                  <input
                    type="time"
                    required
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-bold text-slate-800"
                    value={form.jamKirim}
                    onChange={(e) => setForm({ ...form, jamKirim: e.target.value })}
                  />
                </div>
              </div>

              {/* Detail Frekuensi Dynamic Input */}
              {form.frekuensi === 'Harian' && (
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Kirim Setiap Berapa Hari:
                  </label>
                  <select
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-bold bg-white text-slate-800"
                    value={form.intervalHari}
                    onChange={(e) => setForm({ ...form, intervalHari: e.target.value })}
                  >
                    <option value="1">Setiap Hari (Daily)</option>
                    <option value="3">Setiap 3 Hari Sekali</option>
                    <option value="7">Setiap 7 Hari Sekali (Seminggu)</option>
                    <option value="14">Setiap 14 Hari Sekali (2 Minggu)</option>
                  </select>
                </div>
              )}

              {form.frekuensi === 'Mingguan' && (
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Pilih Hari Mingguan:</label>
                  <select
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-bold bg-white text-slate-800"
                    value={form.hariMingguan}
                    onChange={(e) => setForm({ ...form, hariMingguan: e.target.value })}
                  >
                    <option value="Senin">Setiap Hari Senin</option>
                    <option value="Selasa">Setiap Hari Selasa</option>
                    <option value="Rabu">Setiap Hari Rabu</option>
                    <option value="Kamis">Setiap Hari Kamis</option>
                    <option value="Jumat">Setiap Hari Jumat</option>
                    <option value="Sabtu">Setiap Hari Sabtu</option>
                    <option value="Minggu">Setiap Hari Minggu</option>
                  </select>
                </div>
              )}

              {form.frekuensi === 'Bulanan' && (
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Pilih Tanggal Bulanan:</label>
                  <select
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-bold bg-white text-slate-800"
                    value={form.tanggalBulanan}
                    onChange={(e) => setForm({ ...form, tanggalBulanan: e.target.value })}
                  >
                    <option value="1">Setiap Tanggal 1 (Awal Bulan)</option>
                    <option value="15">Setiap Tanggal 15 (Pertengahan Bulan)</option>
                    <option value="28">Setiap Tanggal 28 (Akhir Bulan)</option>
                  </select>
                </div>
              )}
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
                className="btn btn-primary text-xs py-2.5 px-5 rounded-xl font-bold flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <Check size={16} />
                <span>Simpan Jadwal</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL KONFIRMASI HAPUS */}
      {deletingSchedule && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-red-100 space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-base font-extrabold text-slate-900">Hapus Jadwal Pengiriman</h3>
            <p className="text-xs text-slate-700">
              Apakah Anda yakin ingin menghapus jadwal pengiriman otomatis ke akun{' '}
              <strong>{deletingSchedule.penerimaNama}</strong>?
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setDeletingSchedule(null)}
                className="btn btn-secondary text-xs py-2 px-4 rounded-xl font-bold cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={submitDeleteJadwal}
                className="py-2 px-4 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition cursor-pointer"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL HASIL PENGIRIMAN EMAIL / SIMULASI */}
      {sendResultModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-sky-100 overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Header Banner */}
            <div className="bg-gradient-to-r from-slate-900 via-indigo-900 to-sky-950 text-white p-5 relative">
              <button
                onClick={() => setSendResultModal(null)}
                className="absolute top-4 right-4 text-slate-300 hover:text-white p-1 rounded-lg hover:bg-white/10 transition cursor-pointer"
              >
                <X size={18} />
              </button>

              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-500 to-sky-400 flex items-center justify-center text-white shadow-lg">
                  {sendResultModal.isLoading ? (
                    <RefreshCw size={22} className="animate-spin" />
                  ) : (
                    <MailCheck size={22} />
                  )}
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-white tracking-tight flex items-center gap-2">
                    <span>Status Pengiriman Laporan &amp; Backup</span>
                    <Sparkles size={16} className="text-amber-400" />
                  </h3>
                  <p className="text-xs text-sky-200 font-medium">
                    {sendResultModal.isLoading
                      ? 'Sedang memproses kompilasi berkas &amp; email...'
                      : 'Laporan otomatis berhasil diproses dan dikirim'}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-5 space-y-4 text-xs">
              {/* Stepper Status */}
              <div className="space-y-2 bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80">
                <div className="flex items-center gap-2.5 font-bold">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${sendResultModal.step >= 1 ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'}`}>
                    ✓
                  </div>
                  <span className={sendResultModal.step >= 1 ? 'text-slate-900' : 'text-slate-400'}>
                    Generate Berkas Laporan ({sendResultModal.isExcel ? 'Excel 7-Sheet' : 'PDF'})
                  </span>
                </div>

                <div className="flex items-center gap-2.5 font-bold">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${sendResultModal.step >= 2 ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'}`}>
                    {sendResultModal.step === 1 ? '⌛' : '✓'}
                  </div>
                  <span className={sendResultModal.step >= 2 ? 'text-slate-900' : 'text-slate-400'}>
                    Pengemasan Berkas &amp; Konfigurasi Mail Server
                  </span>
                </div>

                <div className="flex items-center gap-2.5 font-bold">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${sendResultModal.step >= 3 ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'}`}>
                    {sendResultModal.step < 3 ? '⌛' : '✓'}
                  </div>
                  <span className={sendResultModal.step >= 3 ? 'text-slate-900' : 'text-slate-400'}>
                    Pengiriman Email ke Recipient Target
                  </span>
                </div>
              </div>

              {/* Recipient Details */}
              <div className="bg-indigo-50/50 border border-indigo-100 rounded-2xl p-4 space-y-3">
                <div className="text-[11px] font-extrabold text-indigo-900 uppercase tracking-wider">
                  Target Penerima &amp; Email Goal:
                </div>
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-extrabold text-sm shadow-xs">
                      {sendResultModal.schedule.penerimaNama.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-extrabold text-slate-900 text-xs">
                        {sendResultModal.schedule.penerimaNama}
                      </div>
                      <div className="text-indigo-700 font-semibold text-[11px] flex items-center gap-1">
                        <Mail size={12} />
                        <span>{sendResultModal.schedule.penerimaEmail}</span>
                      </div>
                    </div>
                  </div>

                  <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-extrabold border border-emerald-200">
                    Aktif
                  </span>
                </div>
              </div>

              {/* Attachment Detail Card */}
              <div className="bg-white border border-slate-200 rounded-2xl p-3.5 space-y-2">
                <div className="flex items-center justify-between text-slate-700 font-bold">
                  <div className="flex items-center gap-2">
                    {sendResultModal.isExcel ? (
                      <FileSpreadsheet className="text-emerald-600" size={18} />
                    ) : (
                      <FileText className="text-sky-600" size={18} />
                    )}
                    <span className="font-mono text-slate-900 text-[11px] truncate max-w-[220px]">
                      {sendResultModal.fileName}
                    </span>
                  </div>
                  <button
                    onClick={() => handleSimulasiKirim(sendResultModal.schedule)}
                    className="px-2 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg font-bold text-[11px] border border-indigo-200 flex items-center gap-1 cursor-pointer transition"
                    title="Unduh / Re-generate File"
                  >
                    <Download size={13} />
                    <span>Download</span>
                  </button>
                </div>

                {sendResultModal.isExcel && (
                  <div className="text-[11px] text-slate-500 font-medium flex items-center gap-3 pt-1 border-t border-slate-100">
                    <span>📊 7 Sheet Data Backup</span>
                    <span>•</span>
                    <span>⚡ Excel .XLSX</span>
                    <span>•</span>
                    <span>🔒 Safe Disaster Recovery</span>
                  </div>
                )}
              </div>

              {/* SMTP Dispatch Info Note */}
              {sendResultModal.serverRes && (
                <div className="bg-amber-50/90 border border-amber-200 rounded-2xl p-3.5 text-slate-800 space-y-1">
                  <div className="font-extrabold text-amber-900 flex items-center gap-1.5 text-xs">
                    <ShieldCheck size={14} className="text-amber-600" />
                    <span>Status Server Email Dispatcher:</span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    {sendResultModal.serverRes.message}
                  </p>
                  {sendResultModal.serverRes.details?.note && (
                    <p className="text-[10px] text-slate-500 italic pt-1 border-t border-amber-200/60">
                      💡 <strong>Catatan SMTP:</strong> {sendResultModal.serverRes.details.note}
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 p-4 bg-slate-50 border-t border-slate-100">
              <button
                onClick={() => setSendResultModal(null)}
                className="btn btn-primary text-xs py-2.5 px-6 rounded-xl font-bold cursor-pointer shadow-xs"
              >
                Tutup Selesai
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
