import React, { useState } from 'react';
import {
  ArrowLeft,
  PlusCircle,
  Boxes,
  Activity,
  FileSpreadsheet,
  FileText,
  Coins,
  Scale,
  CheckCircle2,
  ChevronDown,
  Edit2,
  Trash2,
} from 'lucide-react';
import {
  calculateKloterMetrics,
  formatNumber,
  formatDateIndonesian,
} from '../utils/calculations';
import { TabRingkasan } from './kloter-tabs/TabRingkasan';
import { TabPengeluaran } from './kloter-tabs/TabPengeluaran';
import { TabKematian } from './kloter-tabs/TabKematian';
import { TabPanen } from './kloter-tabs/TabPanen';
import { TabPenjualan } from './kloter-tabs/TabPenjualan';

export function KloterDetail({
  kloter,
  activeHargaPerOns,
  currentRole,
  onBack,
  onOpenModal,
  onUpdateStatus,
  onDeletePengeluaran,
  onDeleteKematian,
  onDeletePanen,
  onDeletePenjualan,
  onEditKloter,
  onDeleteKloter,
}) {
  const [activeTab, setActiveTab] = useState('ringkasan');
  const [showActionMenu, setShowActionMenu] = useState(false);

  const isViewer = currentRole === 'viewer';
  const metrics = calculateKloterMetrics(kloter, activeHargaPerOns);

  return (
    <div className="space-y-6 font-sans">
      {/* Top Navigation & Action Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          className="flex items-center gap-2 px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-sky-800 text-xs font-bold rounded-xl shadow-xs transition cursor-pointer"
          onClick={onBack}
        >
          <ArrowLeft size={15} />
          <span>Kembali</span>
        </button>

        <div className="flex items-center gap-2">
          {/* Edit Kloter Button */}
          {!isViewer && (
            <button
              type="button"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-sky-50 text-sky-800 border border-sky-200 font-bold text-xs rounded-xl transition cursor-pointer shadow-xs"
              onClick={() => {
                if (typeof onEditKloter === 'function') {
                  onEditKloter(kloter);
                } else if (typeof onOpenModal === 'function') {
                  onOpenModal('edit_kloter', kloter.id);
                }
              }}
              title="Edit Data Kloter ini"
            >
              <Edit2 size={14} className="text-sky-600" />
              <span>Edit Kloter</span>
            </button>
          )}

          {/* Hapus Kloter Button */}
          {!isViewer && (
            <button
              type="button"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-red-50 text-red-700 border border-red-200 font-bold text-xs rounded-xl transition cursor-pointer shadow-xs"
              onClick={() => {
                if (typeof onDeleteKloter === 'function') {
                  onDeleteKloter(kloter.id);
                }
              }}
              title="Hapus Kloter ini"
            >
              <Trash2 size={14} className="text-red-600" />
              <span>Hapus Kloter</span>
            </button>
          )}

          <div className="h-4 w-px bg-slate-200 mx-1 hidden sm:block"></div>

          <span className="text-xs text-slate-500 font-semibold hidden sm:inline">Status Kloter:</span>
          <span
            className={`px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wide ${
              metrics.autoStatus === 'Aktif'
                ? 'bg-sky-100 text-sky-800 border border-sky-200'
                : metrics.autoStatus === 'Panen'
                ? 'bg-amber-100 text-amber-800 border border-amber-200'
                : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
            }`}
          >
            {metrics.statusLabel}
          </span>
        </div>
      </div>

      {/* Sleek Light Header Card (Clean typography, light background) */}
      <div className="bg-white rounded-2xl border border-sky-100 p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="min-w-0 space-y-1.5">
            <div className="text-xs font-extrabold text-sky-700 uppercase tracking-wider flex items-center gap-2 flex-wrap">
              <span>{kloter.id}</span>
              <span>&bull;</span>
              <span className="bg-amber-50 text-amber-800 px-2.5 py-0.5 rounded-md border border-amber-200 font-extrabold text-xs">
                Usia Ayam: {metrics.usiaAyamHari} Hari
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              {kloter.namaKloter}
            </h1>
            <p className="text-xs text-slate-600 font-medium flex items-center gap-2 flex-wrap">
              <span>{kloter.kandang ? `Kandang: ${kloter.kandang} • ` : ''}Tgl DOC: {formatDateIndonesian(kloter.tanggalBeliDoc)}</span>
              <span>&bull;</span>
              <span>DOC Awal: {formatNumber(kloter.docAwal)} Ekor</span>
              <span>&bull;</span>
              <span className="font-bold text-sky-800">Sisa Ayam: {formatNumber(metrics.sisaAyamHidup)} Ekor</span>
            </p>
          </div>

          <div className="flex items-center gap-3 flex-shrink-0">
            {/* Action Dropdown Button */}
            {!isViewer && (
              <div className="relative">
                <button
                  className="flex items-center gap-2 px-4 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-extrabold text-xs rounded-xl shadow-xs transition cursor-pointer"
                  onClick={() => setShowActionMenu(!showActionMenu)}
                >
                  <PlusCircle size={16} />
                  <span>+ Catat Transaksi</span>
                  <ChevronDown size={14} />
                </button>

                {showActionMenu && (
                  <div
                    className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-sky-100 p-2 z-50 text-xs font-bold text-slate-800 space-y-1"
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
                    <button
                      className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-sky-50 text-slate-700 hover:text-sky-800 rounded-xl transition text-left cursor-pointer"
                      onClick={() => onOpenModal('input_panen', kloter.id)}
                    >
                      <Boxes size={15} className="text-amber-500" />
                      <span>+ Input Panen</span>
                    </button>
                    <button
                      className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-sky-50 text-slate-700 hover:text-sky-800 rounded-xl transition text-left cursor-pointer"
                      onClick={() => onOpenModal('input_penjualan', kloter.id)}
                    >
                      <Scale size={15} className="text-emerald-600" />
                      <span>+ Input Penjualan</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main KPI Summary Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
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
          {activeTab === 'ringkasan' && <TabRingkasan kloter={kloter} metrics={metrics} />}
          {activeTab === 'pengeluaran' && (
            <TabPengeluaran
              kloter={kloter}
              isViewer={isViewer}
              onOpenModal={onOpenModal}
              onDeletePengeluaran={onDeletePengeluaran}
            />
          )}
          {activeTab === 'kematian' && (
            <TabKematian
              kloter={kloter}
              isViewer={isViewer}
              onOpenModal={onOpenModal}
              onDeleteKematian={onDeleteKematian}
            />
          )}
          {activeTab === 'panen' && (
            <TabPanen
              kloter={kloter}
              isViewer={isViewer}
              onOpenModal={onOpenModal}
              onDeletePanen={onDeletePanen}
            />
          )}
          {activeTab === 'penjualan' && (
            <TabPenjualan
              kloter={kloter}
              isViewer={isViewer}
              onDeletePenjualan={onDeletePenjualan}
            />
          )}
        </div>
      </div>
    </div>
  );
}
