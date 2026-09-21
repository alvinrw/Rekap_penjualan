import React, { useState } from 'react';
import { FileSpreadsheet, Download } from 'lucide-react';
import { calculateKloterMetrics, formatRupiah, formatNumber } from '../utils/calculations';
import { exportKloterToExcel } from '../utils/exportUtils';
import { Pagination } from './Pagination';

export function LaporanAnalytics({ kloters, activeHargaPerOns }) {
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 15;

  const reportsData = kloters.map((kloter) => ({
    kloter,
    metrics: calculateKloterMetrics(kloter, activeHargaPerOns),
  }));

  const paginatedReportsData = reportsData.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Laporan Performa Kloter
          </h1>
        </div>

        <button
          className="flex items-center justify-center gap-2 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white border border-emerald-600 font-bold text-xs rounded-xl shadow-xs transition self-start sm:self-auto cursor-pointer"
          onClick={() => exportKloterToExcel(kloters, 'all', activeHargaPerOns)}
        >
          <Download size={15} />
          <span>Export Excel</span>
        </button>
      </div>

      {/* Comparison Data Section */}
      <div className="bg-white rounded-2xl border border-sky-100 p-4 sm:p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-extrabold text-sm sm:text-base text-slate-900 flex items-center gap-2">
            <FileSpreadsheet size={18} className="text-sky-600" />
            <span>Perbandingan Performa Kloter</span>
          </h3>
          <span className="text-xs font-bold text-slate-500">{kloters.length} Kloter</span>
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
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <Pagination
          currentPage={currentPage}
          totalItems={kloters.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
        />
      </div>
    </div>
  );
}

