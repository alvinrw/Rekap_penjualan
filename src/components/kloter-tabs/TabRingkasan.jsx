import React from 'react';
import { formatRupiah, formatNumber } from '../../utils/calculations';

export function TabRingkasan({ kloter, metrics }) {
  return (
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
  );
}
