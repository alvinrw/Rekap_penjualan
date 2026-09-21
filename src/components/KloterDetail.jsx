import React, { useState } from 'react';
import {
  ArrowLeft,
  PlusCircle,
  Calendar,
  Boxes,
  Activity,
  FileSpreadsheet,
  FileText,
  Coins,
  Scale,
  CheckCircle2,
  ChevronDown,
  Download,
} from 'lucide-react';
import {
  calculateKloterMetrics,
  formatRupiah,
  formatNumber,
  formatDateIndonesian,
  gramToOns,
} from '../utils/calculations';
import { exportKloterToExcel, exportKloterToPDF } from '../utils/exportUtils';

import { Pagination } from './Pagination';

export function KloterDetail({
  kloter,
  activeHargaPerOns,
  currentRole,
  onBack,
  onOpenModal,
  onUpdateStatus,
}) {
  const [activeTab, setActiveTab] = useState('ringkasan');
  const [showActionMenu, setShowActionMenu] = useState(false);

  // Tab pagination states (max 15 rows)
  const [pagePengeluaran, setPagePengeluaran] = useState(1);
  const [pageKematian, setPageKematian] = useState(1);
  const [pagePanen, setPagePanen] = useState(1);
  const [pagePenjualan, setPagePenjualan] = useState(1);
  const pageSize = 15;

  const isViewer = currentRole === 'viewer';
  const isSuperAdmin = currentRole === 'super_admin';
  const isAdmin = currentRole === 'admin' || isSuperAdmin;

  const metrics = calculateKloterMetrics(kloter, activeHargaPerOns);

  return (
    <div className="space-y-6 font-sans">
      {/* Top Navigation Back Button & Status */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <button
          className="flex items-center gap-2 px-3 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-sky-800 text-xs font-bold rounded-xl shadow-xs transition cursor-pointer"
          onClick={onBack}
        >
          <ArrowLeft size={15} />
          <span>Kembali</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-semibold hidden sm:inline">Status Kloter:</span>
          <span
            className={`px-2.5 py-1 rounded-full text-xs font-extrabold uppercase tracking-wide ${
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
      </div>

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-sky-900 via-sky-800 to-blue-900 text-white p-5 sm:p-6 rounded-2xl shadow-lg border-none">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="min-w-0">
            <div className="text-xs font-extrabold text-sky-300 uppercase tracking-widest flex items-center gap-2 flex-wrap">
              <span>{kloter.id}</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-white mt-1 tracking-tight">
              {kloter.namaKloter}
            </h1>
            <p className="text-xs text-sky-200 mt-1.5 font-medium flex items-center gap-2 flex-wrap">
              <span>Tanggal Masuk: {formatDateIndonesian(kloter.tanggalBeliDoc)}</span>
              <span>&bull;</span>
              <span>DOC Awal: {formatNumber(kloter.docAwal)} Ekor</span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 flex-shrink-0">
            {/* Quick Export Excel & PDF Buttons */}
            <div className="flex items-center gap-1 bg-white/10 p-1 rounded-xl border border-white/20">
              <button
                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-white font-extrabold text-xs rounded-lg transition cursor-pointer shadow-xs"
                onClick={() => exportKloterToExcel([kloter], kloter.id, activeHargaPerOns)}
                title="Export Kloter ini ke Excel"
              >
                <FileSpreadsheet size={14} />
                <span>Excel</span>
              </button>
              <button
                className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500 hover:bg-red-400 text-white font-extrabold text-xs rounded-lg transition cursor-pointer shadow-xs"
                onClick={() => exportKloterToPDF([kloter], kloter.id, activeHargaPerOns)}
                title="Export Kloter ini ke PDF"
              >
                <FileText size={14} />
                <span>PDF</span>
              </button>
            </div>

            {/* Status Progression Button */}
            {isAdmin && (
              <>
                {kloter.status === 'Aktif' && (
                  <button
                    className="flex items-center gap-2 px-3.5 py-2 bg-amber-400 hover:bg-amber-300 text-amber-900 font-extrabold text-xs rounded-xl shadow-md transition cursor-pointer border border-amber-300"
                    onClick={() => onUpdateStatus(kloter.id, 'Panen')}
                  >
                    <Boxes size={14} />
                    <span>Mulai Fase Panen →</span>
                  </button>
                )}
                {kloter.status === 'Panen' && (
                  <button
                    className="flex items-center gap-2 px-3.5 py-2 bg-violet-400 hover:bg-violet-300 text-violet-900 font-extrabold text-xs rounded-xl shadow-md transition cursor-pointer border border-violet-300"
                    onClick={() => onUpdateStatus(kloter.id, 'Penjualan')}
                  >
                    <Scale size={14} />
                    <span>Tandai Fase Penjualan →</span>
                  </button>
                )}
                {kloter.status === 'Penjualan' && (
                  <button
                    className="flex items-center gap-2 px-3.5 py-2 bg-emerald-400 hover:bg-emerald-300 text-emerald-900 font-extrabold text-xs rounded-xl shadow-md transition cursor-pointer border border-emerald-300"
                    onClick={() => onUpdateStatus(kloter.id, 'Selesai')}
                  >
                    <CheckCircle2 size={14} />
                    <span>Selesaikan Kloter →</span>
                  </button>
                )}
                {kloter.status === 'Selesai' && isSuperAdmin && (
                  <button
                    className="flex items-center gap-2 px-3.5 py-2 bg-white/20 hover:bg-white/30 text-white font-bold text-xs rounded-xl transition cursor-pointer border border-white/30"
                    onClick={() => onUpdateStatus(kloter.id, 'Aktif')}
                  >
                    <span>Buka Kembali</span>
                  </button>
                )}
              </>
            )}

            {/* Action Dropdown — only show if status allows input */}
            {!isViewer && (kloter.status === 'Aktif' || kloter.status === 'Panen') && (
              <div className="relative">
                <button
                  className="flex items-center gap-2 px-4 py-2.5 bg-sky-500 hover:bg-sky-400 text-white font-extrabold text-xs rounded-xl shadow-md transition cursor-pointer border border-sky-300"
                  onClick={() => setShowActionMenu(!showActionMenu)}
                >
                  <PlusCircle size={16} />
                  <span>+ Catat Transaksi</span>
                  <ChevronDown size={14} />
                </button>

                {showActionMenu && (
                  <div
                    className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-slate-200/80 p-2 z-50 text-xs font-bold text-slate-800 space-y-1"
                    onClick={() => setShowActionMenu(false)}
                  >
                    <button
                      className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-sky-50 text-slate-700 hover:text-sky-800 rounded-xl transition text-left cursor-pointer"
                      onClick={() => onOpenModal('input_pengeluaran', kloter.id)}
                    >
                      <Coins size={15} className="text-sky-600" />
                      <span>+ Catat Pengeluaran</span>
                    </button>
                    <button
                      className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-sky-50 text-slate-700 hover:text-sky-800 rounded-xl transition text-left cursor-pointer"
                      onClick={() => onOpenModal('input_kematian', kloter.id)}
                    >
                      <Activity size={15} className="text-red-500" />
                      <span>+ Catat Kematian</span>
                    </button>
                    {kloter.status === 'Panen' && (
                      <button
                        className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-sky-50 text-slate-700 hover:text-sky-800 rounded-xl transition text-left cursor-pointer"
                        onClick={() => onOpenModal('input_panen', kloter.id)}
                      >
                        <Boxes size={15} className="text-amber-500" />
                        <span>+ Input Panen</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main KPI Summary Grid — 7 cards, 2 rows */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Row 1: Operasional */}
        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-title">Sisa Ayam Hidup</span>
            <div className="kpi-icon-box"><Boxes size={18} /></div>
          </div>
          <div className="kpi-value text-sky-800">{formatNumber(metrics.sisaAyamHidup)} ekor</div>
          <span className="kpi-subtext">Dari DOC {formatNumber(metrics.docAwal)} ekor</span>
        </div>

        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-title">Total Kematian</span>
            <div className="kpi-icon-box bg-red-100"><Activity size={18} className="text-red-600" /></div>
          </div>
          <div className="kpi-value text-red-600">{formatNumber(metrics.totalKematian)} ekor</div>
          <span className="kpi-subtext">Mortality: {formatNumber(metrics.mortalityRate, 2)}%</span>
        </div>

        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-title">Sudah Dipanen</span>
            <div className="kpi-icon-box bg-amber-100"><CheckCircle2 size={18} className="text-amber-600" /></div>
          </div>
          <div className="kpi-value text-amber-700">{formatNumber(metrics.totalEkorDipanen)} ekor</div>
          <span className="kpi-subtext">{kloter.panenList?.length || 0}x sesi panen</span>
        </div>

        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-title">Total Pakan</span>
            <div className="kpi-icon-box bg-sky-100"><FileSpreadsheet size={18} className="text-sky-600" /></div>
          </div>
          <div className="kpi-value text-sky-800">{formatNumber(metrics.totalPakanKg)} Kg</div>
          <span className="kpi-subtext">FCR: {metrics.fcr > 0 ? formatNumber(metrics.fcr, 2) : '-'}</span>
        </div>

        {/* Row 2: Finansial */}
        <div className={`kpi-card col-span-2 sm:col-span-1 ${metrics.mortalityRate > 2.5 ? 'danger' : ''}`}>
          <div className="kpi-header">
            <span className="kpi-title">Mortality Rate</span>
            <div className="kpi-icon-box"><Activity size={18} /></div>
          </div>
          <div className="kpi-value">{formatNumber(metrics.mortalityRate, 2)} %</div>
          <span className="kpi-subtext">Batas aman &lt; 2,5%</span>
        </div>

        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-title">FCR (Feed Ratio)</span>
            <div className="kpi-icon-box"><FileSpreadsheet size={18} /></div>
          </div>
          <div className="kpi-value">{formatNumber(metrics.fcr, 2)}</div>
          <span className="kpi-subtext">{formatNumber(metrics.totalPakanKg)} Kg / {formatNumber(metrics.totalBobotPanenKg, 1)} Kg</span>
        </div>

        <div className={`kpi-card col-span-2 sm:col-span-2 ${metrics.netProfit >= 0 ? 'success' : 'danger'}`}>
          <div className="kpi-header">
            <span className="kpi-title">Net Profit</span>
            <div className="kpi-icon-box"><Coins size={18} /></div>
          </div>
          <div className="kpi-value">{formatRupiah(metrics.netProfit)}</div>
          <span className="kpi-subtext">Margin / ROI: {formatNumber(metrics.roi, 2)}%</span>
        </div>
      </div>

      {/* Detail Tabs Navigation */}
      <div className="bg-white rounded-2xl border border-sky-100 shadow-xs overflow-hidden">
        <div className="flex items-center gap-1 border-b border-sky-100 px-4 pt-3 overflow-x-auto">
          <button
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition whitespace-nowrap cursor-pointer ${
              activeTab === 'ringkasan'
                ? 'border-sky-600 text-sky-700'
                : 'border-transparent text-slate-500 hover:text-sky-600'
            }`}
            onClick={() => setActiveTab('ringkasan')}
          >
            <FileSpreadsheet size={16} />
            <span>Ringkasan & Metrik</span>
          </button>
          <button
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition whitespace-nowrap cursor-pointer ${
              activeTab === 'pengeluaran'
                ? 'border-sky-600 text-sky-700'
                : 'border-transparent text-slate-500 hover:text-sky-600'
            }`}
            onClick={() => setActiveTab('pengeluaran')}
          >
            <Coins size={16} />
            <span>Pengeluaran ({kloter.pengeluaranList?.length || 0})</span>
          </button>
          <button
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition whitespace-nowrap cursor-pointer ${
              activeTab === 'kematian'
                ? 'border-sky-600 text-sky-700'
                : 'border-transparent text-slate-500 hover:text-sky-600'
            }`}
            onClick={() => setActiveTab('kematian')}
          >
            <Activity size={16} />
            <span>Kematian ({kloter.kematianList?.length || 0})</span>
          </button>
          <button
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition whitespace-nowrap cursor-pointer ${
              activeTab === 'panen'
                ? 'border-sky-600 text-sky-700'
                : 'border-transparent text-slate-500 hover:text-sky-600'
            }`}
            onClick={() => setActiveTab('panen')}
          >
            <Boxes size={16} />
            <span>Panen Bertahap ({kloter.panenList?.length || 0})</span>
          </button>
          <button
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition whitespace-nowrap cursor-pointer ${
              activeTab === 'penjualan'
                ? 'border-sky-600 text-sky-700'
                : 'border-transparent text-slate-500 hover:text-sky-600'
            }`}
            onClick={() => setActiveTab('penjualan')}
          >
            <Scale size={16} />
            <span>Penjualan ({kloter.penjualanList?.length || 0})</span>
          </button>
        </div>

        <div className="p-4 sm:p-6">
          {/* TAB 1: RINGKASAN */}
          {activeTab === 'ringkasan' && (
            <div className="space-y-6">
              <h3 className="font-extrabold text-base text-slate-900 border-b pb-2">
                Rincian Kalkulasi & Formulasi Kloter
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-sky-50/70 p-4 rounded-xl border border-sky-100 space-y-3">
                  <h4 className="font-extrabold text-sky-900 text-xs uppercase tracking-wider">
                    1. Rincian Modal Usaha (Beban Biaya)
                  </h4>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between py-1 border-b border-sky-100">
                      <span>Pembelian DOC ({formatNumber(metrics.docAwal)} ekor @ {formatRupiah(metrics.hargaDocPerEkor)}):</span>
                      <strong className="text-slate-800">{formatRupiah(metrics.modalDoc)}</strong>
                    </div>
                    <div className="flex justify-between py-1 border-b border-sky-100">
                      <span>Total Pakan Terpakai ({formatNumber(metrics.totalPakanKg)} Kg):</span>
                      <strong className="text-slate-800">
                        {formatRupiah(
                          (kloter.pengeluaranList || [])
                            .filter((e) => e.kategori === 'Pakan')
                            .reduce((s, e) => s + e.jumlahRp, 0)
                        )}
                      </strong>
                    </div>
                    <div className="flex justify-between py-1 border-b border-sky-100">
                      <span>Biaya Obat, Listrik, Gaji & Lainnya:</span>
                      <strong className="text-slate-800">
                        {formatRupiah(
                          (kloter.pengeluaranList || [])
                            .filter((e) => e.kategori !== 'Pakan')
                            .reduce((s, e) => s + e.jumlahRp, 0)
                        )}
                      </strong>
                    </div>
                    <div className="flex justify-between py-2 text-xs font-extrabold text-sky-900 pt-2 border-t border-sky-200">
                      <span>TOTAL MODAL KESELURUHAN:</span>
                      <span>{formatRupiah(metrics.totalModal)}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-emerald-50/70 p-4 rounded-xl border border-emerald-100 space-y-3">
                  <h4 className="font-extrabold text-emerald-900 text-xs uppercase tracking-wider">
                    2. Rincian Hasil Penjualan & Margin
                  </h4>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between py-1 border-b border-emerald-100">
                      <span>Total Ekor Dipanen:</span>
                      <strong className="text-slate-800">{formatNumber(metrics.totalEkorDipanen)} ekor</strong>
                    </div>
                    <div className="flex justify-between py-1 border-b border-emerald-100">
                      <span>Total Bobot Penjualan Timbangan:</span>
                      <strong className="text-slate-800">{formatNumber(metrics.totalBobotPanenKg, 2)} Kg</strong>
                    </div>
                    <div className="flex justify-between py-1 border-b border-emerald-100">
                      <span>Total Pendapatan Kotor (Revenue):</span>
                      <strong className="text-slate-800">{formatRupiah(metrics.totalPemasukan)}</strong>
                    </div>
                    <div className="flex justify-between py-2 text-xs font-extrabold text-emerald-900 pt-2 border-t border-emerald-200">
                      <span>NET PROFIT (KEUNTUNGAN BERSIH):</span>
                      <span className={metrics.netProfit >= 0 ? 'text-emerald-700' : 'text-red-600'}>
                        {formatRupiah(metrics.netProfit)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PENGELUARAN */}
          {activeTab === 'pengeluaran' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-extrabold text-sm text-slate-900">
                  Daftar Pengeluaran Operasional
                </h3>
                {!isViewer && kloter.status !== 'Selesai' && (
                  <button
                    className="px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer"
                    onClick={() => onOpenModal('input_pengeluaran', kloter.id)}
                  >
                    + Catat Pengeluaran
                  </button>
                )}
              </div>

              <div className="table-container border border-slate-100 rounded-xl overflow-hidden">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Tanggal</th>
                      <th>Kategori</th>
                      <th>Keterangan Deskriptif</th>
                      <th>Jumlah Pakan (Kg)</th>
                      <th>Total Biaya (Rp)</th>
                      <th>Dicatat Oleh</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(kloter.pengeluaranList || [])
                      .slice((pagePengeluaran - 1) * pageSize, pagePengeluaran * pageSize)
                      .map((item) => (
                        <tr key={item.id}>
                          <td className="whitespace-nowrap font-medium">{formatDateIndonesian(item.tanggal)}</td>
                          <td>
                            <span className="px-2 py-0.5 bg-sky-100 text-sky-800 font-bold rounded text-xs">
                              {item.kategori}
                            </span>
                          </td>
                          <td className="max-w-xs">{item.keterangan}</td>
                          <td className="font-bold">
                            {item.kategori === 'Pakan' ? `${formatNumber(item.jumlahKg)} Kg` : '-'}
                          </td>
                          <td className="font-bold text-sky-900">{formatRupiah(item.jumlahRp)}</td>
                          <td className="text-xs text-slate-500">{item.dicatatOleh}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>

                <Pagination
                  currentPage={pagePengeluaran}
                  totalItems={kloter.pengeluaranList?.length || 0}
                  pageSize={pageSize}
                  onPageChange={setPagePengeluaran}
                />
              </div>
            </div>
          )}

          {/* TAB 3: KEMATIAN */}
          {activeTab === 'kematian' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-extrabold text-sm text-slate-900">
                  Catatan Kematian Ayam Harian
                </h3>
                {!isViewer && kloter.status !== 'Selesai' && (
                  <button
                    className="px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer"
                    onClick={() => onOpenModal('input_kematian', kloter.id)}
                  >
                    + Catat Kematian
                  </button>
                )}
              </div>

              <div className="table-container border border-slate-100 rounded-xl overflow-hidden">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Tanggal</th>
                      <th>Jumlah Kematian</th>
                      <th>Penyebab & Catatan Rinci</th>
                      <th>Petugas Pencatat</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(kloter.kematianList || [])
                      .slice((pageKematian - 1) * pageSize, pageKematian * pageSize)
                      .map((item) => (
                        <tr key={item.id}>
                          <td className="whitespace-nowrap font-medium">{formatDateIndonesian(item.tanggal)}</td>
                          <td className="font-bold text-red-600">{item.jumlahEkor} Ekor</td>
                          <td className="max-w-md text-slate-700">{item.penyebab}</td>
                          <td className="text-xs text-slate-500">{item.dicatatOleh}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>

                <Pagination
                  currentPage={pageKematian}
                  totalItems={kloter.kematianList?.length || 0}
                  pageSize={pageSize}
                  onPageChange={setPageKematian}
                />
              </div>
            </div>
          )}

          {/* TAB 4: PANEN BERTAHAP */}
          {activeTab === 'panen' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-extrabold text-sm text-slate-900">
                  Riwayat Panen Bertahap (Hitung Tangkapan Ekor)
                </h3>
                {!isViewer && kloter.status !== 'Selesai' && (
                  <button
                    className="px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer"
                    onClick={() => onOpenModal('input_panen', kloter.id)}
                  >
                    + Input Panen
                  </button>
                )}
              </div>

              <div className="table-container border border-slate-100 rounded-xl overflow-hidden">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Tanggal Panen</th>
                      <th>Jumlah Panen (Ekor)</th>
                      <th>Catatan Penjarangan / Tangkapan</th>
                      <th>Petugas Pencatat</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(kloter.panenList || [])
                      .slice((pagePanen - 1) * pageSize, pagePanen * pageSize)
                      .map((item) => (
                        <tr key={item.id}>
                          <td className="whitespace-nowrap font-medium">{formatDateIndonesian(item.tanggal)}</td>
                          <td className="font-extrabold text-sky-900 text-sm">{formatNumber(item.jumlahEkor)} Ekor</td>
                          <td className="text-xs text-slate-700">{item.catatan || '-'}</td>
                          <td className="text-xs text-slate-500">{item.dicatatOleh || 'Admin'}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>

                <Pagination
                  currentPage={pagePanen}
                  totalItems={kloter.panenList?.length || 0}
                  pageSize={pageSize}
                  onPageChange={setPagePanen}
                />
              </div>
            </div>
          )}

          {/* TAB 5: PENJUALAN */}
          {activeTab === 'penjualan' && (
            <div className="space-y-4">
              <div>
                <h3 className="font-extrabold text-sm text-slate-900">
                  Data Penjualan Berbasis Ons (1 Ons = 100 Gram)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Total harga dihitung otomatis: (Berat Gram / 100) &times; Snapshot Harga per Ons
                </p>
              </div>

              <div className="table-container border border-slate-100 rounded-xl overflow-hidden">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Tanggal</th>
                      <th>Pembeli / Pelanggan</th>
                      <th>Berat Timbangan (Gram)</th>
                      <th>Konversi Ons</th>
                      <th>Harga per Ons (Snapshot)</th>
                      <th>Total Uang Penjualan (Rp)</th>
                      <th>Metode</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(kloter.penjualanList || [])
                      .slice((pagePenjualan - 1) * pageSize, pagePenjualan * pageSize)
                      .map((item) => {
                        const ons = gramToOns(item.beratGram);
                        return (
                          <tr key={item.id}>
                            <td className="whitespace-nowrap font-medium">{formatDateIndonesian(item.tanggal)}</td>
                            <td className="font-semibold text-slate-800">{item.pembeli}</td>
                            <td className="font-bold">{formatNumber(item.beratGram)} Gram</td>
                            <td className="font-bold text-sky-700">{formatNumber(ons, 1)} Ons</td>
                            <td className="text-xs">{formatRupiah(item.hargaPerOnsSnapshot)} / ons</td>
                            <td className="font-bold text-emerald-700">{formatRupiah(item.totalHarga)}</td>
                            <td className="text-xs text-slate-500">{item.metodePembayaran}</td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>

                <Pagination
                  currentPage={pagePenjualan}
                  totalItems={kloter.penjualanList?.length || 0}
                  pageSize={pageSize}
                  onPageChange={setPagePenjualan}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
