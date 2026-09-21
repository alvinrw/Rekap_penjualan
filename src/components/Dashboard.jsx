import React, { useState } from 'react';
import {
  Boxes,
  PieChart,
  AlertTriangle,
  Coins,
  Activity,
  FileSpreadsheet,
  Building2,
  CheckCircle2,
  TrendingUp,
} from 'lucide-react';
import {
  calculateKloterMetrics,
  formatRupiah,
  formatNumber,
} from '../utils/calculations';

import { KloterSelect } from './KloterSelect';

export function Dashboard({
  kloters,
  activeHargaPerOns,
  currentRole,
  onSelectKloter,
}) {
  const [selectedKloterId, setSelectedKloterId] = useState('semua');

  // Calculate aggregated metrics for all active & completed kloters
  const allMetrics = kloters.map((k) => ({
    kloter: k,
    metrics: calculateKloterMetrics(k, activeHargaPerOns),
  }));

  const activeKloters = allMetrics.filter((m) => m.kloter.status === 'Aktif' || m.kloter.status === 'Panen');
  const totalSisaAyamHidup = activeKloters.reduce((sum, m) => sum + m.metrics.sisaAyamHidup, 0);
  const totalDocAktif = activeKloters.reduce((sum, m) => sum + m.metrics.docAwal, 0);

  const avgMortalityRate =
    allMetrics.length > 0
      ? allMetrics.reduce((sum, m) => sum + m.metrics.mortalityRate, 0) / allMetrics.length
      : 0;

  const validFcrKloters = allMetrics.filter((m) => m.metrics.fcr > 0);
  const avgFcr =
    validFcrKloters.length > 0
      ? validFcrKloters.reduce((sum, m) => sum + m.metrics.fcr, 0) / validFcrKloters.length
      : 0;

  const totalAccumulatedProfit = allMetrics.reduce((sum, m) => sum + m.metrics.netProfit, 0);
  const totalAccumulatedModal = allMetrics.reduce((sum, m) => sum + m.metrics.totalModal, 0);
  const overallRoi =
    totalAccumulatedModal > 0 ? (totalAccumulatedProfit / totalAccumulatedModal) * 100 : 0;

  // Selected Kloter metrics for Donut Chart Visual
  const selectedMetricsData =
    selectedKloterId === 'semua'
      ? {
          docAwal: allMetrics.reduce((s, m) => s + m.metrics.docAwal, 0),
          totalEkorDipanen: allMetrics.reduce((s, m) => s + m.metrics.totalEkorDipanen, 0),
          sisaAyamHidup: allMetrics.reduce((s, m) => s + m.metrics.sisaAyamHidup, 0),
          totalKematian: allMetrics.reduce((s, m) => s + m.metrics.totalKematian, 0),
          totalPemasukan: allMetrics.reduce((s, m) => s + m.metrics.totalPemasukan, 0),
          netProfit: allMetrics.reduce((s, m) => s + m.metrics.netProfit, 0),
          fcr: avgFcr,
          mortalityRate: avgMortalityRate,
        }
      : allMetrics.find((m) => m.kloter.id === selectedKloterId)?.metrics || {
          docAwal: 1,
          totalEkorDipanen: 0,
          sisaAyamHidup: 0,
          totalKematian: 0,
          totalPemasukan: 0,
          netProfit: 0,
          fcr: 0,
          mortalityRate: 0,
        };

  const totalPopulasi = Math.max(1, selectedMetricsData.docAwal);
  const pctPanen = Math.min(100, Math.max(0, (selectedMetricsData.totalEkorDipanen / totalPopulasi) * 100));
  const pctSisa = Math.min(100, Math.max(0, (selectedMetricsData.sisaAyamHidup / totalPopulasi) * 100));
  const pctKematian = Math.min(100, Math.max(0, (selectedMetricsData.totalKematian / totalPopulasi) * 100));

  // SVG Donut Calculations (Circle radius = 40, C ≈ 251.327)
  const C = 251.327;
  const dashPanen = (pctPanen / 100) * C;
  const dashSisa = (pctSisa / 100) * C;
  const dashKematian = (pctKematian / 100) * C;

  const offsetPanen = 0;
  const offsetSisa = -dashPanen;
  const offsetKematian = -(dashPanen + dashSisa);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Dashboard Operasional
        </h1>
      </div>

      {/* High Mortality Warning Banner */}
      {avgMortalityRate > 2.5 && (
        <div className="p-3.5 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-3 text-red-900">
          <AlertTriangle className="text-red-600 flex-shrink-0" size={18} />
          <div className="text-xs">
            <strong className="font-extrabold text-sm">Peringatan Kematian (&gt; 2,5%)</strong>: Tingkat kematian rata-rata kloter terpantau {formatNumber(avgMortalityRate, 2)}%.
          </div>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="kpi-grid">
        {/* Card 1: Jumlah Kloter */}
        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-title">Jumlah Kloter</span>
            <div className="kpi-icon-box">
              <Building2 size={20} />
            </div>
          </div>
          <div className="kpi-value">{kloters.length} Kloter</div>
          <div className="kpi-subtext">
            {activeKloters.length} Berjalan &bull; {kloters.length - activeKloters.length} Selesai
          </div>
        </div>

        {/* Card 2: Kloter Aktif & Sisa Ayam */}
        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-title">Stok Ayam Hidup</span>
            <div className="kpi-icon-box">
              <Boxes size={20} />
            </div>
          </div>
          <div className="kpi-value">{formatNumber(totalSisaAyamHidup)} Ekor</div>
          <div className="kpi-subtext">
            DOC Aktif: {formatNumber(totalDocAktif)} Ekor
          </div>
        </div>

        {/* Card 3: Rata-Rata Mortality Rate */}
        <div className={`kpi-card ${avgMortalityRate > 2.5 ? 'danger' : ''}`}>
          <div className="kpi-header">
            <span className="kpi-title">Mortality Rate Rata-Rata</span>
            <div className="kpi-icon-box">
              <Activity size={20} />
            </div>
          </div>
          <div className="kpi-value">{formatNumber(avgMortalityRate, 2)} %</div>
          <div className="kpi-subtext">
            Batas aman &lt; 2,5%
          </div>
        </div>

        {/* Card 4: Rata-Rata FCR */}
        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-title">FCR (Feed Ratio)</span>
            <div className="kpi-icon-box">
              <FileSpreadsheet size={20} />
            </div>
          </div>
          <div className="kpi-value">{formatNumber(avgFcr, 2)}</div>
          <div className="kpi-subtext">
            Rasio Pakan / Kg Penjualan
          </div>
        </div>

        {/* Card 5: Net Profit Terakumulasi */}
        <div className={`kpi-card ${totalAccumulatedProfit >= 0 ? 'success' : 'danger'}`}>
          <div className="kpi-header">
            <span className="kpi-title">Net Profit Terakumulasi</span>
            <div className="kpi-icon-box">
              <Coins size={20} />
            </div>
          </div>
          <div className="kpi-value">{formatRupiah(totalAccumulatedProfit)}</div>
          <div className="kpi-subtext">
            ROI: <strong>{formatNumber(overallRoi, 2)} %</strong>
          </div>
        </div>
      </div>

      {/* Interactive Donut Chart Monitoring */}
      <div className="bg-white rounded-2xl border border-sky-100 p-6 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-sky-100">
          <div>
            <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
              <PieChart className="text-sky-600" size={20} />
              <span>Monitoring Populasi Kloter</span>
            </h3>
          </div>

          {/* Searchable Kloter Selector Dropdown */}
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="text-xs font-bold text-slate-600 whitespace-nowrap">Pilih Kloter:</span>
            <KloterSelect
              kloters={kloters}
              selectedKloterId={selectedKloterId}
              onSelectKloter={setSelectedKloterId}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Vector SVG Donut Chart */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center relative p-4 bg-sky-50/50 rounded-2xl border border-sky-100">
            <div className="w-44 h-44 sm:w-56 sm:h-56 relative flex items-center justify-center">
              <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                {/* Background Ring */}
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="transparent"
                  stroke="#e2e8f0"
                  strokeWidth="16"
                />
                {/* Segment 1: Panen (Sky Blue) */}
                {dashPanen > 0 && (
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="transparent"
                    stroke="#0284c7"
                    strokeWidth="16"
                    strokeDasharray={`${dashPanen} ${C}`}
                    strokeDashoffset={offsetPanen}
                    className="transition-all duration-500"
                  />
                )}
                {/* Segment 2: Sisa Ayam Hidup (Green) */}
                {dashSisa > 0 && (
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="transparent"
                    stroke="#16a34a"
                    strokeWidth="16"
                    strokeDasharray={`${dashSisa} ${C}`}
                    strokeDashoffset={offsetSisa}
                    className="transition-all duration-500"
                  />
                )}
                {/* Segment 3: Kematian (Red) */}
                {dashKematian > 0 && (
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="transparent"
                    stroke="#ef4444"
                    strokeWidth="16"
                    strokeDasharray={`${dashKematian} ${C}`}
                    strokeDashoffset={offsetKematian}
                    className="transition-all duration-500"
                  />
                )}
              </svg>

              {/* Center Donut Label */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                <span className="text-xl font-extrabold text-slate-900 tracking-tight">
                  {formatNumber(selectedMetricsData.docAwal)}
                </span>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  DOC Awal
                </span>
              </div>
            </div>

            <div className="mt-3 text-[11px] font-bold text-slate-500 text-center">
              {selectedKloterId === 'semua'
                ? 'Akumulasi 3 Kloter Terdaftar'
                : kloters.find((k) => k.id === selectedKloterId)?.namaKloter}
            </div>
          </div>

          {/* Breakdown Legend & Statistics */}
          <div className="lg:col-span-7 space-y-4">
            <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-400">
              Rincian Distribusi & Indikator Performa
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3.5 bg-sky-50 border border-sky-200 rounded-xl space-y-1">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-sky-600 inline-block"></span>
                  <span className="text-xs font-bold text-slate-700">Terjual / Dipanen</span>
                </div>
                <div className="text-lg font-extrabold text-sky-900">
                  {formatNumber(selectedMetricsData.totalEkorDipanen)} <span className="text-xs font-normal">ekor</span>
                </div>
                <div className="text-[11px] font-bold text-sky-700">
                  {formatNumber(pctPanen, 1)}% dari total populasi
                </div>
              </div>

              <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl space-y-1">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-emerald-600 inline-block"></span>
                  <span className="text-xs font-bold text-slate-700">Stok Ayam Hidup</span>
                </div>
                <div className="text-lg font-extrabold text-emerald-900">
                  {formatNumber(selectedMetricsData.sisaAyamHidup)} <span className="text-xs font-normal">ekor</span>
                </div>
                <div className="text-[11px] font-bold text-emerald-700">
                  {formatNumber(pctSisa, 1)}% belum dipanen
                </div>
              </div>

              <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl space-y-1">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-red-500 inline-block"></span>
                  <span className="text-xs font-bold text-slate-700">Total Kematian</span>
                </div>
                <div className="text-lg font-extrabold text-red-900">
                  {formatNumber(selectedMetricsData.totalKematian)} <span className="text-xs font-normal">ekor</span>
                </div>
                <div className="text-[11px] font-bold text-red-600">
                  {formatNumber(pctKematian, 1)}% mortality rate
                </div>
              </div>
            </div>

            {/* Quick Metrics Summary Bar */}
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <span className="text-slate-500 font-semibold block text-[11px]">Rasio Pakan (FCR):</span>
                <strong className="text-slate-900 font-bold text-sm">
                  {selectedMetricsData.fcr > 0 ? formatNumber(selectedMetricsData.fcr, 2) : '-'}
                </strong>
              </div>
              <div>
                <span className="text-slate-500 font-semibold block text-[11px]">Total Pendapatan:</span>
                <strong className="text-slate-900 font-bold text-sm">
                  {formatRupiah(selectedMetricsData.totalPemasukan)}
                </strong>
              </div>
              <div className="col-span-2 sm:col-span-1">
                <span className="text-slate-500 font-semibold block text-[11px]">Estimasi Net Profit:</span>
                <strong className={selectedMetricsData.netProfit >= 0 ? 'text-emerald-700 font-bold text-sm' : 'text-red-600 font-bold text-sm'}>
                  {formatRupiah(selectedMetricsData.netProfit)}
                </strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
