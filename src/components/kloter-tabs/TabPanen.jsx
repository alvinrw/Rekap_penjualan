import React, { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { formatNumber, formatDateIndonesian } from '../../utils/calculations';
import { Pagination } from '../Pagination';

export function TabPanen({ kloter, isViewer, onOpenModal, onDeletePanen }) {
  const [page, setPage] = useState(1);
  const pageSize = 15;

  return (
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
              {!isViewer && <th className="text-right">Aksi</th>}
            </tr>
          </thead>
          <tbody>
            {(kloter.panenList || [])
              .slice((page - 1) * pageSize, page * pageSize)
              .map((item) => (
                <tr key={item.id}>
                  <td className="whitespace-nowrap font-medium">{formatDateIndonesian(item.tanggal)}</td>
                  <td className="font-extrabold text-sky-900 text-sm">{formatNumber(item.jumlahEkor)} Ekor</td>
                  <td className="text-xs text-slate-700">{item.catatan || '-'}</td>
                  <td className="text-xs text-slate-500">{item.dicatatOleh || 'Admin'}</td>
                  {!isViewer && (
                    <td className="text-right">
                      <button
                        className="text-red-500 hover:text-red-700 transition cursor-pointer p-1"
                        onClick={() => onDeletePanen(kloter.id, item.id)}
                        title="Hapus Data Panen"
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
          totalItems={kloter.panenList?.length || 0}
          pageSize={pageSize}
          onPageChange={setPage}
        />
      </div>
    </div>
  );
}
