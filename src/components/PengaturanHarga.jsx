import React, { useState } from 'react';
import { Tag, Calendar, History, Calculator, PlusCircle, CheckCircle2 } from 'lucide-react';
import { formatRupiah, formatNumber, gramToOns, calculateSalesPrice } from '../utils/calculations';

export function PengaturanHarga({
  hargaConfig,
  currentRole,
  onUpdateHarga,
}) {
  const [simulasiGram, setSimulasiGram] = useState(2500); // Default 2.500 gram (25 ons)
  const [hargaBaruInput, setHargaBaruInput] = useState(7500);
  const [catatanInput, setCatatanInput] = useState('');
  const [showForm, setShowForm] = useState(false);

  const isViewer = currentRole === 'viewer';

  const onsHasil = gramToOns(simulasiGram);
  const totalHargaHasil = calculateSalesPrice(simulasiGram, hargaConfig.hargaPerOnsAktif);

  const handleSubmitNewPrice = (e) => {
    e.preventDefault();
    if (!hargaBaruInput || hargaBaruInput <= 0) return;
    onUpdateHarga(Number(hargaBaruInput), catatanInput);
    setShowForm(false);
    setCatatanInput('');
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Pengaturan Harga per Ons</h1>
        </div>

        {!isViewer && (
          <button
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl shadow-md transition self-start sm:self-auto cursor-pointer"
            onClick={() => setShowForm(!showForm)}
          >
            <PlusCircle size={16} />
            <span>Perbarui Harga Aktif</span>
          </button>
        )}
      </div>

      {/* Active Price Banner & Live Conversion Simulator Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Active Price Display Box (Fixed Gradient Contrast) */}
        <div className="bg-gradient-to-br from-sky-900 via-sky-800 to-blue-900 text-white p-6 rounded-2xl shadow-lg border-none md:col-span-1 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-extrabold text-sky-300 uppercase tracking-widest mb-3">
              <Tag size={16} />
              <span>Harga Acuan Aktif</span>
            </div>
            <div className="text-3xl font-extrabold text-white mb-1 tracking-tight">
              {formatRupiah(hargaConfig.hargaPerOnsAktif)}
              <span className="text-xs font-semibold text-sky-200 ml-1">/ Ons</span>
            </div>
            <span className="text-[11px] text-sky-200 block">1 Ons = 100 Gram (Rp {formatNumber(hargaConfig.hargaPerOnsAktif / 100)} / gram)</span>
          </div>

          <div className="text-xs text-sky-100 border-t border-sky-700/60 pt-4 mt-4 space-y-1">
            <p className="flex justify-between">
              <span className="text-sky-300">Mulai Berlaku:</span>
              <strong className="text-white">{hargaConfig.berlakuMulai}</strong>
            </p>
            <p className="flex justify-between">
              <span className="text-sky-300">Diubah Oleh:</span>
              <strong className="text-white truncate max-w-[140px]">{hargaConfig.terakhirDiubahOleh}</strong>
            </p>
          </div>
        </div>

        {/* Live Calculation Simulator Box */}
        <div className="bg-sky-50/80 border border-sky-200 p-5 rounded-2xl md:col-span-2 space-y-4 shadow-xs">
          <div className="flex items-center gap-2 font-extrabold text-sky-950 text-sm">
            <Calculator size={18} className="text-sky-600" />
            <span>Simulator Kalkulasi Penjualan Timbangan Gram &rarr; Ons</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div>
              <label className="form-label">Input Berat Timbangan (Gram):</label>
              <input
                type="number"
                className="w-full p-2.5 text-xs rounded-xl border border-sky-300 bg-white font-bold text-slate-900 focus:outline-none focus:border-sky-500"
                value={simulasiGram}
                onChange={(e) => setSimulasiGram(Number(e.target.value))}
                min="0"
                step="50"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">Contoh: 2.500g = 2,5 Kg</span>
            </div>

            <div>
              <label className="form-label">Hasil Konversi (Ons):</label>
              <div className="w-full p-2.5 text-xs rounded-xl border border-sky-200 bg-white font-extrabold text-sky-800 flex items-center">
                {formatNumber(onsHasil, 1)} Ons
              </div>
              <span className="text-[10px] text-slate-500 mt-1 block">Rumus: Gram / 100</span>
            </div>

            <div>
              <label className="form-label">Total Uang Penjualan (Rp):</label>
              <div className="w-full p-2.5 text-xs rounded-xl border border-emerald-300 bg-emerald-50 text-emerald-900 font-extrabold flex items-center">
                {formatRupiah(totalHargaHasil)}
              </div>
              <span className="text-[10px] text-slate-500 mt-1 block">Ons &times; Rp {formatNumber(hargaConfig.hargaPerOnsAktif)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Form Update Harga Baru */}
      {showForm && !isViewer && (
        <form onSubmit={handleSubmitNewPrice} className="bg-white p-6 rounded-2xl border border-sky-200 shadow-md space-y-4">
          <h3 className="font-extrabold text-sm text-sky-900">Form Penetapan Harga Baru per Ons</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="form-group">
              <label className="form-label">Harga Per Ons Baru (Rp):</label>
              <div className="relative flex items-center">
                <span className="absolute left-3 text-xs font-bold text-slate-400 select-none pointer-events-none">Rp</span>
                <input
                  type="text"
                  inputMode="numeric"
                  className="form-input form-input-prefix font-bold tracking-wide"
                  placeholder="7.500"
                  value={Number(hargaBaruInput) > 0 ? Number(hargaBaruInput).toLocaleString('id-ID') : ''}
                  onChange={(e) => {
                    const raw = e.target.value.replace(/\./g, '').replace(/[^0-9]/g, '');
                    setHargaBaruInput(Number(raw) || 0);
                  }}
                  required
                />
              </div>
              <span className="form-help">Titik ribuan muncul otomatis.</span>
            </div>

            <div className="form-group">
              <label className="form-label">Alasan & Catatan Penyesuaian Harga:</label>
              <input
                type="text"
                className="form-input"
                placeholder="Misal: Penyesuaian permintaan pasar Jabodetabek..."
                value={catatanInput}
                onChange={(e) => setCatatanInput(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              className="px-3.5 py-2 text-xs font-bold rounded-xl border border-slate-300 hover:bg-slate-100"
              onClick={() => setShowForm(false)}
            >
              Batal
            </button>
            <button type="submit" className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-xs cursor-pointer">
              <CheckCircle2 size={16} />
              <span>Simpan & Aktifkan Harga Baru</span>
            </button>
          </div>
        </form>
      )}

      {/* Price History Table */}
      <div className="bg-white p-5 rounded-2xl border border-sky-100 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
            <History size={18} className="text-sky-600" />
            <span>Riwayat Perubahan Harga per Ons</span>
          </h3>
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Log Snapshot Terlampir</span>
        </div>

        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>ID Log</th>
                <th>Harga Per Ons</th>
                <th>Mulai Berlaku</th>
                <th>Diubah Oleh</th>
                <th>Catatan & Alasan Penyesuaian</th>
              </tr>
            </thead>
            <tbody>
              {hargaConfig.riwayatHarga.map((item) => (
                <tr key={item.id}>
                  <td className="font-bold text-xs text-slate-500">{item.id}</td>
                  <td className="font-extrabold text-sky-800">{formatRupiah(item.hargaPerOns)} / ons</td>
                  <td className="whitespace-nowrap font-medium text-xs">{item.berlakuMulai}</td>
                  <td className="text-xs text-slate-700">{item.diubahOleh}</td>
                  <td className="text-xs text-slate-600">{item.catatan || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
