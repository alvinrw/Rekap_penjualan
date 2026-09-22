import React, { useState } from 'react';
import { Trash2, Printer } from 'lucide-react';
import { formatRupiah, formatNumber, formatDateIndonesian, gramToOns } from '../../utils/calculations';
import { exportStrukPDF } from '../../utils/exportUtils';
import { Pagination } from '../Pagination';

export function TabPenjualan({ kloter, isViewer, onDeletePenjualan }) {
  const [page, setPage] = useState(1);
  const pageSize = 15;

  return (
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
              {!isViewer && <th className="text-right">Aksi</th>}
            </tr>
          </thead>
          <tbody>
            {(kloter.penjualanList || [])
              .slice((page - 1) * pageSize, page * pageSize)
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
                    {!isViewer && (
                      <td className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            className="text-sky-500 hover:text-sky-700 transition cursor-pointer p-1"
                            onClick={() => exportStrukPDF(item, kloter)}
                            title="Cetak Struk PDF"
                          >
                            <Printer size={16} />
                          </button>
                          <button
                            className="text-red-500 hover:text-red-700 transition cursor-pointer p-1"
                            onClick={() => onDeletePenjualan(kloter.id, item.id, item)}
                            title="Hapus Penjualan"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}
          </tbody>
        </table>

        <Pagination
          currentPage={page}
          totalItems={kloter.penjualanList?.length || 0}
          pageSize={pageSize}
          onPageChange={setPage}
        />
      </div>
    </div>
  );
}
