import React, { useState } from 'react';
import { FileSpreadsheet, Download, FileText, Filter } from 'lucide-react';
import { calculateKloterMetrics, formatRupiah, formatNumber } from '../utils/calculations';
import { exportKloterToExcel, exportKloterToPDF, exportKloterReportWithCoverPDF } from '../utils/exportUtils';
import { Pagination } from './Pagination';

export function LaporanAnalytics({ kloters, activeHargaPerOns, users = [], auditLogs = [] }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedKloterId, setSelectedKloterId] = useState('all');
  const [selectedBulan, setSelectedBulan] = useState('all');
  const [selectedTahun, setSelectedTahun] = useState('all');
  const pageSize = 15;

  const currentYear = new Date().getFullYear();
  const availableYears = [currentYear - 2, currentYear - 1, currentYear, currentYear + 1];

  const monthOptions = [
    { value: 'all', label: 'Semua Bulan' },
    { value: '1', label: 'Januari' },
    { value: '2', label: 'Februari' },
    { value: '3', label: 'Maret' },
    { value: '4', label: 'April' },
    { value: '5', label: 'Mei' },
    { value: '6', label: 'Juni' },
    { value: '7', label: 'Juli' },
    { value: '8', label: 'Agustus' },
    { value: '9', label: 'September' },
    { value: '10', label: 'Oktober' },
    { value: '11', label: 'November' },
    { value: '12', label: 'Desember' },
  ];

  // Filter kloters based on selected kloter ID
  const filteredKloters = selectedKloterId === 'all'
    ? kloters
    : kloters.filter((k) => k.id === selectedKloterId);

  const reportsData = filteredKloters.map((kloter) => ({
    kloter,
    metrics: calculateKloterMetrics(kloter, activeHargaPerOns),
  }));

  const paginatedReportsData = reportsData.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleCetakPDF = (kloterObj) => {
    if (kloterObj) {
      exportKloterReportWithCoverPDF(kloterObj, selectedBulan, selectedTahun, activeHargaPerOns);
    } else {
      // Export all filtered kloters
      if (filteredKloters.length === 0) {
        alert('Tidak ada data kloter untuk di-export!');
        return;
      }
      filteredKloters.forEach((k) => {
        exportKloterReportWithCoverPDF(k, selectedBulan, selectedTahun, activeHargaPerOns);
      });
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Laporan Performa Kloter
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Cetak laporan resmi kloter dengan cover template sesuai periode bulan &amp; tahun.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            className="flex items-center justify-center gap-2 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white border border-emerald-600 font-bold text-xs rounded-xl shadow-xs transition cursor-pointer"
            onClick={() => exportKloterToExcel(filteredKloters, selectedKloterId, activeHargaPerOns, { users, auditLogs })}
          >
            <Download size={15} />
            <span>Export Excel</span>
          </button>
        </div>
      </div>

      {/* Filter Control Box */}
      <div className="bg-white rounded-2xl border border-sky-100 p-4 shadow-xs">
        <div className="flex items-center gap-2 mb-3">
          <Filter size={16} className="text-sky-600" />
          <h3 className="font-extrabold text-xs text-slate-800 uppercase tracking-wide">
            Filter Laporan Kloter &amp; Periode
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Filter Kloter */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">
              Pilih Kloter Ayam
            </label>
            <select
              value={selectedKloterId}
              onChange={(e) => {
                setSelectedKloterId(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:border-sky-500 outline-none"
            >
              <option value="all">Semua Kloter ({kloters.length})</option>
              {kloters.map((k) => (
                <option key={k.id} value={k.id}>
                  {k.namaKloter} ({k.kandang || 'Kandang'})
                </option>
              ))}
            </select>
          </div>

          {/* Filter Bulan */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">
              Filter Bulan Panen/Penjualan
            </label>
            <select
              value={selectedBulan}
              onChange={(e) => setSelectedBulan(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:border-sky-500 outline-none"
            >
              {monthOptions.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>

          {/* Filter Tahun */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">
              Filter Tahun
            </label>
            <select
              value={selectedTahun}
              onChange={(e) => setSelectedTahun(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:border-sky-500 outline-none"
            >
              <option value="all">Semua Tahun</option>
              {availableYears.map((yr) => (
                <option key={yr} value={yr}>
                  Tahun {yr}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Comparison Data Section */}
      <div className="bg-white rounded-2xl border border-sky-100 p-4 sm:p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-extrabold text-sm sm:text-base text-slate-900 flex items-center gap-2">
            <FileSpreadsheet size={18} className="text-sky-600" />
            <span>Perbandingan Performa Kloter</span>
          </h3>
          <span className="text-xs font-bold text-slate-500">{filteredKloters.length} Kloter</span>
        </div>

        {/* Mobile View: Responsive Stacked Cards (< 640px) */}
        <div className="block sm:hidden space-y-3">
          {paginatedReportsData.map(({ kloter, metrics }) => (
            <div
              key={kloter.id}
              className="p-4 rounded-xl border border-sky-100 bg-sky-50/40 space-y-3"
            >
              <div className="flex items-center justify-between pb-2 border-b border-sky-100">
                <div>
                  <h4 className="font-extrabold text-sm text-slate-900">{kloter.namaKloter}</h4>
                  <span className="text-[11px] text-slate-500 font-medium">{kloter.kandang}</span>
                </div>
                <span className={`badge badge-${kloter.status.toLowerCase()}`}>
                  {kloter.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-white p-2 rounded-lg border border-slate-100">
                  <span className="text-slate-500 font-medium block text-[10px]">DOC Awal:</span>
                  <strong className="text-slate-900 font-bold">{formatNumber(metrics.docAwal)} ekor</strong>
                </div>

                <div className="bg-white p-2 rounded-lg border border-slate-100">
                  <span className="text-slate-500 font-medium block text-[10px]">Mortality Rate:</span>
                  <strong className={metrics.mortalityRate > 2.5 ? 'text-red-600 font-bold' : 'text-slate-900 font-bold'}>
                    {formatNumber(metrics.mortalityRate, 2)}%
                  </strong>
                </div>

                <div className="bg-white p-2 rounded-lg border border-slate-100">
                  <span className="text-slate-500 font-medium block text-[10px]">FCR Pakan:</span>
                  <strong className="text-sky-800 font-bold">
                    {metrics.fcr > 0 ? formatNumber(metrics.fcr, 2) : '-'}
                  </strong>
                </div>

                <div className="bg-white p-2 rounded-lg border border-slate-100">
                  <span className="text-slate-500 font-medium block text-[10px]">ROI Margin:</span>
                  <strong className="text-sky-900 font-bold">{formatNumber(metrics.roi, 2)}%</strong>
                </div>
              </div>

              <div className="pt-2 border-t border-sky-100 space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Total Modal:</span>
                  <strong className="text-slate-800">{formatRupiah(metrics.totalModal)}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Hasil Penjualan:</span>
                  <strong className="text-slate-800">{formatRupiah(metrics.totalPemasukan)}</strong>
                </div>
                <div className="flex justify-between pt-1 border-t border-slate-200/60 font-bold">
                  <span className="text-slate-700">Net Profit:</span>
                  <span className={metrics.netProfit >= 0 ? 'text-emerald-700 font-extrabold' : 'text-red-600 font-extrabold'}>
                    {formatRupiah(metrics.netProfit)}
                  </span>
                </div>
              </div>

              {/* Action Buttons for Mobile */}
              <div className="pt-2 border-t border-sky-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-lg shadow-xs transition cursor-pointer"
                  onClick={() => handleCetakPDF(kloter)}
                >
                  <FileText size={14} />
                  <span>PDF Cover</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop / Tablet View: Full Data Table (>= 640px) */}
        <div className="hidden sm:block table-container border border-slate-100 rounded-xl overflow-hidden">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Nama Kloter &amp; Kandang</th>
                <th>Status</th>
                <th>DOC Awal</th>
                <th>Mortality Rate (%)</th>
                <th>FCR Pakan</th>
                <th>Total Modal (Rp)</th>
                <th>Hasil Penjualan (Rp)</th>
                <th>Net Profit (Rp)</th>
                <th>ROI (%)</th>
                <th className="text-right">Cetak Laporan</th>
              </tr>
            </thead>
            <tbody>
              {paginatedReportsData.map(({ kloter, metrics }) => (
                <tr key={kloter.id}>
                  <td>
                    <div className="font-bold text-slate-900">{kloter.namaKloter}</div>
                    <div className="text-[11px] text-slate-500">{kloter.kandang}</div>
                  </td>
                  <td>
                    <span className={`badge badge-${kloter.status.toLowerCase()}`}>
                      {kloter.status}
                    </span>
                  </td>
                  <td className="font-bold">{formatNumber(metrics.docAwal)} ekor</td>
                  <td className={metrics.mortalityRate > 2.5 ? 'font-bold text-red-600' : 'text-slate-800'}>
                    {formatNumber(metrics.mortalityRate, 2)}%
                  </td>
                  <td className="font-bold text-sky-800">
                    {metrics.fcr > 0 ? formatNumber(metrics.fcr, 2) : '-'}
                  </td>
                  <td className="text-slate-700">{formatRupiah(metrics.totalModal)}</td>
                  <td className="text-slate-700">{formatRupiah(metrics.totalPemasukan)}</td>
                  <td className={metrics.netProfit >= 0 ? 'font-bold text-emerald-700' : 'font-bold text-red-600'}>
                    {formatRupiah(metrics.netProfit)}
                  </td>
                  <td className="font-extrabold text-sky-900">
                    {formatNumber(metrics.roi, 2)}%
                  </td>
                  <td className="text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        className="flex items-center gap-1 px-2.5 py-1 bg-red-600 hover:bg-red-700 text-white font-bold text-[11px] rounded-lg shadow-xs transition cursor-pointer"
                        onClick={() => handleCetakPDF(kloter)}
                        title="Cetak Laporan PDF Cover Template"
                      >
                        <FileText size={13} />
                        <span>PDF Cover</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <Pagination
          currentPage={currentPage}
          totalItems={filteredKloters.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
        />
      </div>
    </div>
  );
}


