import React, { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { formatRupiah, formatNumber, formatDateIndonesian } from '../../utils/calculations';
import { Pagination } from '../Pagination';

export function TabPengeluaran({ kloter, isViewer, onOpenModal, onDeletePengeluaran }) {
  const [page, setPage] = useState(1);
  const pageSize = 15;

  return (
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
              {!isViewer && <th className="text-right">Aksi</th>}
            </tr>
          </thead>
          <tbody>
            {(kloter.pengeluaranList || [])
              .slice((page - 1) * pageSize, page * pageSize)
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
                  {!isViewer && (
                    <td className="text-right">
                      <button
                        className="text-red-500 hover:text-red-700 transition cursor-pointer p-1"
                        onClick={() => onDeletePengeluaran(kloter.id, item.id)}
                        title="Hapus Pengeluaran"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  )}
                </tr>
              ))}
          </tbody>
        </table>

        <Pagination
          currentPage={page}
          totalItems={kloter.pengeluaranList?.length || 0}
          pageSize={pageSize}
          onPageChange={setPage}
        />
      </div>
    </div>
  );
}
