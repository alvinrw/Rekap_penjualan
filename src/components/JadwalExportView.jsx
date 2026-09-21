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
} from 'lucide-react';
import {
  exportPenjualanToPDF,
  exportKloterToPDF,
  exportLaporanBulananToPDF,
} from '../utils/exportUtils';
import { Pagination } from './Pagination';

export function JadwalExportView({ kloters, users, activeHargaPerOns }) {
  const [schedules, setSchedules] = useState([
    {
      id: 'SCH-001',
      penerimaNama: 'Alvin Pratama (Super Admin)',
      penerimaEmail: 'alvin.admin@peternakan-unggul.co.id',
      tipeLaporan: 'penjualan', // 'penjualan' | 'kloter' | 'bulanan'
      labelLaporan: 'Data Penjualan (Export PDF)',
      frekuensi: 'Mingguan',
      detailJadwal: 'Setiap Hari Senin, Jam 08:00 WIB',
      status: 'Aktif',
      terakhirDikirim: '2026-09-15 08:00',
    },
    {
      id: 'SCH-002',
      penerimaNama: 'Bambang Haryanto (Admin)',
      penerimaEmail: 'bambang.ops@peternakan-unggul.co.id',
      tipeLaporan: 'kloter',
      labelLaporan: 'Manajemen Kloter (Lengkap)',
      frekuensi: 'Setiap 7 Hari',
      detailJadwal: 'Setiap 7 Hari Sekali, Jam 07:00 WIB',
      status: 'Aktif',
      terakhirDikirim: '2026-09-18 07:00',
    },
    {
      id: 'SCH-003',
      penerimaNama: 'Siti Aminah (Viewer)',
      penerimaEmail: 'siti.viewer@peternakan-unggul.co.id',
      tipeLaporan: 'bulanan',
      labelLaporan: 'Laporan Bulanan Rekap Kinerja',
      frekuensi: 'Bulanan',
      detailJadwal: 'Setiap Tanggal 1 Awal Bulan, Jam 09:00 WIB',
      status: 'Aktif',
      terakhirDikirim: '2026-09-01 09:00',
    },
  ]);

  const [isTambahModalOpen, setIsTambahModalOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState(null);
  const [deletingSchedule, setDeletingSchedule] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 15;

  // Form state
  const [form, setForm] = useState({
    penerimaType: 'user', // 'user' or 'custom'
    userId: users[0]?.id || '',
    customNama: '',
    customEmail: '',
    tipeLaporan: 'penjualan',
    frekuensi: 'Mingguan',
    hariMingguan: 'Senin',
    intervalHari: '7',
    tanggalBulanan: '1',
    jamKirim: '08:00',
  });

  const resetForm = () => {
    setForm({
      penerimaType: 'user',
      userId: users[0]?.id || '',
      customNama: '',
      customEmail: '',
      tipeLaporan: 'penjualan',
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

  const handleSimulasiKirim = (sch) => {
    if (sch.tipeLaporan === 'penjualan') {
      exportPenjualanToPDF(kloters);
    } else if (sch.tipeLaporan === 'kloter') {
      exportKloterToPDF(kloters, 'all', activeHargaPerOns);
    } else {
      exportLaporanBulananToPDF(kloters, activeHargaPerOns);
    }

    alert(
      `[SIMULASI KIRIM SEKARANG SUCCESS]\nLaporan '${sch.labelLaporan}' berhasil di-generate dan dikirimkan ke akun ${sch.penerimaNama} (${sch.penerimaEmail}).`
    );

    // Update terakhir dikirim
    const nowStr = new Date().toISOString().replace('T', ' ').slice(0, 16);
    setSchedules((prev) =>
      prev.map((s) => (s.id === sch.id ? { ...s, terakhirDikirim: nowStr } : s))
    );
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
    if (form.tipeLaporan === 'kloter') labelLaporan = 'Manajemen Kloter (Lengkap PDF)';
    if (form.tipeLaporan === 'bulanan') labelLaporan = 'Laporan Bulanan Rekap Kinerja';

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
              Pengaturan Kirim Export PDF
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              Atur jadwal otomatisasi pengiriman Laporan PDF (Penjualan, Kloter &amp; Bulanan) ke akun user atau email.
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
                <th>Jenis Laporan PDF</th>
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
                        sch.tipeLaporan === 'penjualan'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : sch.tipeLaporan === 'kloter'
                          ? 'bg-sky-100 text-sky-800 border border-sky-200'
                          : 'bg-purple-100 text-purple-800 border border-purple-200'
                      }`}
                    >
                      <FileText size={13} />
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
                        title="Simulasi Kirim & Generate PDF Sekarang"
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
                  Tambah Jadwal Kirim PDF Baru
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

              {/* Jenis Laporan PDF */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Jenis Laporan PDF yang Dikirim:
                </label>
                <select
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-bold bg-white text-slate-800"
                  value={form.tipeLaporan}
                  onChange={(e) => setForm({ ...form, tipeLaporan: e.target.value })}
                >
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
    </div>
  );
}
