import React, { useState } from 'react';
import {
  Layers,
  PlusCircle,
  Search,
  Filter,
  ArrowRight,
  Download,
  FileSpreadsheet,
  FileText,
  X,
  Check,
} from 'lucide-react';
import {
  calculateKloterMetrics,
  formatRupiah,
  formatNumber,
  formatDateIndonesian,
} from '../utils/calculations';
import { exportKloterToExcel, exportKloterToPDF } from '../utils/exportUtils';
import { KloterSelect } from './KloterSelect';

export function KloterList({
  kloters,
  activeHargaPerOns,
  currentRole,
  onSelectKloter,
  onOpenModal,
}) {
  const [filterStatus, setFilterStatus] = useState('semua');
  const [searchQuery, setSearchQuery] = useState('');
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [exportTarget, setExportTarget] = useState('all'); // 'all' or kloterId
  const [exportFormat, setExportFormat] = useState('excel'); // 'excel' or 'pdf'

  const isViewer = currentRole === 'viewer';

  const filteredKloters = kloters.filter((k) => {
    const matchStatus = filterStatus === 'semua' || k.status.toLowerCase() === filterStatus;
    const matchQuery =
      k.namaKloter.toLowerCase().includes(searchQuery.toLowerCase()) ||
      k.kandang.toLowerCase().includes(searchQuery.toLowerCase());
    return matchStatus && matchQuery;
  });

  const handleRunExport = () => {
    if (exportFormat === 'excel') {
      exportKloterToExcel(kloters, exportTarget, activeHargaPerOns);
    } else {
      exportKloterToPDF(kloters, exportTarget, activeHargaPerOns);
    }
    setIsExportModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Manajemen Kloter</h1>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          {/* Export Button */}
          <button
            className="flex items-center justify-center gap-2 px-3.5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition cursor-pointer"
            onClick={() => setIsExportModalOpen(true)}
            title="Export Data Kloter ke Excel atau PDF"
          >
            <Download size={16} />
            <span>Export (Excel / PDF)</span>
          </button>

          {!isViewer && (
            <button
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl shadow-md transition cursor-pointer"
              onClick={() => onOpenModal('tambah_kloter')}
            >
              <PlusCircle size={16} />
              <span>Buat Kloter Baru</span>
            </button>
          )}
        </div>
      </div>

      {/* Controls Bar: Search & Status Filters */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between items-stretch sm:items-center bg-white p-3.5 rounded-2xl border border-sky-100 shadow-sm">
        {/* Search */}
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
            placeholder="Cari berdasarkan nama kloter atau nama kandang..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <Filter size={14} className="text-slate-400 ml-1 mr-1 flex-shrink-0" />
          {['semua', 'aktif', 'panen', 'penjualan', 'selesai'].map((status) => (
            <button
              key={status}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl capitalize transition flex-shrink-0 ${
                filterStatus === status
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
              onClick={() => setFilterStatus(status)}
            >
              {status === 'semua' ? 'Semua' : status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Kloter Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredKloters.map((kloter) => {
          const metrics = calculateKloterMetrics(kloter, activeHargaPerOns);

          return (
            <div
              key={kloter.id}
              className="bg-white rounded-2xl border border-sky-100 shadow-sm hover:shadow-md hover:border-sky-300 transition-all p-5 flex flex-col justify-between cursor-pointer"
              onClick={() => onSelectKloter(kloter.id)}
            >
              <div>
                {/* Header Info */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      {kloter.id}
                    </span>
                    <h3 className="font-extrabold text-sm text-slate-900 leading-snug">
                      {kloter.namaKloter}
                    </h3>
                  </div>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide flex-shrink-0 ${
                      kloter.status === 'Aktif'
                        ? 'bg-sky-100 text-sky-800 border border-sky-200'
                        : kloter.status === 'Panen'
                        ? 'bg-amber-100 text-amber-800 border border-amber-200'
                        : kloter.status === 'Penjualan'
                        ? 'bg-violet-100 text-violet-800 border border-violet-200'
                        : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                    }`}
                  >
                    {kloter.status}
                  </span>
                </div>

                <p className="text-xs text-slate-500 mb-4">
                  {kloter.kandang} &bull; Tgl DOC: {formatDateIndonesian(kloter.tanggalBeliDoc)}
                </p>

                {/* Metrics Summary Grid with clean spacing */}
                <div className="grid grid-cols-2 gap-2.5 bg-sky-50/70 p-3.5 rounded-xl border border-sky-100 text-xs mb-4">
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-bold">DOC Awal</span>
                    <strong className="text-slate-800 text-xs mt-0.5 block">{formatNumber(metrics.docAwal)} ekor</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-bold">Sisa Ayam</span>
                    <strong className="text-sky-700 text-xs mt-0.5 block">{formatNumber(metrics.sisaAyamHidup)} ekor</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-bold">Mortality Rate</span>
                    <strong className={`text-xs mt-0.5 block ${metrics.mortalityRate > 2.5 ? 'text-red-600 font-bold' : 'text-slate-800'}`}>
                      {formatNumber(metrics.mortalityRate, 2)}%
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-bold">FCR Pakan</span>
                    <strong className="text-slate-800 text-xs mt-0.5 block">
                      {metrics.fcr > 0 ? formatNumber(metrics.fcr, 2) : '-'}
                    </strong>
                  </div>
                </div>

                {/* Financial Overview */}
                <div className="space-y-1.5 text-xs pt-1 border-t border-slate-100">
                  <div className="flex justify-between text-slate-600">
                    <span>Total Modal (DOC + Biaya):</span>
                    <span className="font-semibold text-slate-800">{formatRupiah(metrics.totalModal)}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Total Hasil Penjualan:</span>
                    <span className="font-semibold text-slate-800">{formatRupiah(metrics.totalPemasukan)}</span>
                  </div>
                  <div className="flex justify-between text-slate-900 font-extrabold text-xs pt-1 border-t border-dashed border-slate-200">
                    <span>Net Profit / (Rugi):</span>
                    <span className={metrics.netProfit >= 0 ? 'text-emerald-700' : 'text-red-600'}>
                      {formatRupiah(metrics.netProfit)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Card Footer Button */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-sky-600 group">
                <span>Buka Detail & Transaksi</span>
                <ArrowRight size={16} className="group-hover:translate-x-1 transition" />
              </div>
            </div>
          );
        })}

        {filteredKloters.length === 0 && (
          <div className="col-span-full py-12 text-center text-slate-500 bg-white rounded-2xl border border-dashed border-slate-300">
            <p className="font-bold text-sm">Tidak ditemukan kloter yang sesuai dengan pencarian atau filter.</p>
            <p className="text-xs mt-1 text-slate-400">Coba ubah kata kunci pencarian atau pilih filter status lain.</p>
          </div>
        )}
      </div>

      {/* MODAL EXPORT MANAJEMEN KLOTER */}
      {isExportModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-sky-100 space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
                  <Download size={18} />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">Export Laporan Kloter</h3>
                  <p className="text-[11px] text-slate-500">Unduh data kloter lengkap dalam format Excel atau PDF.</p>
                </div>
              </div>
              <button
                onClick={() => setIsExportModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* Target Kloter Selection using Searchable KloterSelect */}
              <div>
                <label className="block font-bold text-slate-700 mb-1.5">
                  Pilih Cakupan Kloter yang Ingin Di-export:
                </label>
                <KloterSelect
                  kloters={kloters}
                  selectedKloterId={exportTarget === 'all' ? 'semua' : exportTarget}
                  onSelectKloter={(id) => setExportTarget(id === 'semua' ? 'all' : id)}
                  includeSemua={true}
                  className="w-full"
                />
              </div>

              {/* Export Format Selection */}
              <div>
                <label className="block font-bold text-slate-700 mb-1.5">
                  Pilih Format File Laporan:
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setExportFormat('excel')}
                    className={`p-3 rounded-xl border-2 font-bold text-xs flex flex-col items-center gap-1.5 transition cursor-pointer ${
                      exportFormat === 'excel'
                        ? 'border-emerald-600 bg-emerald-50/70 text-emerald-900'
                        : 'border-slate-200 hover:border-slate-300 text-slate-600'
                    }`}
                  >
                    <FileSpreadsheet size={22} className={exportFormat === 'excel' ? 'text-emerald-600' : 'text-slate-400'} />
                    <span>Microsoft Excel (.xlsx)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setExportFormat('pdf')}
                    className={`p-3 rounded-xl border-2 font-bold text-xs flex flex-col items-center gap-1.5 transition cursor-pointer ${
                      exportFormat === 'pdf'
                        ? 'border-red-600 bg-red-50/70 text-red-900'
                        : 'border-slate-200 hover:border-slate-300 text-slate-600'
                    }`}
                  >
                    <FileText size={22} className={exportFormat === 'pdf' ? 'text-red-600' : 'text-slate-400'} />
                    <span>Dokumen PDF (.pdf)</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsExportModalOpen(false)}
                className="btn btn-secondary text-xs py-2 px-4 rounded-xl font-bold cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleRunExport}
                className="py-2.5 px-5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center gap-2 cursor-pointer"
              >
                <Download size={15} />
                <span>Unduh File Laporan</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
