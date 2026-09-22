import React, { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { formatDateIndonesian } from '../../utils/calculations';
import { Pagination } from '../Pagination';

export function TabKematian({ kloter, isViewer, onOpenModal, onDeleteKematian }) {
  const [page, setPage] = useState(1);
  const pageSize = 15;

  return (
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
              {!isViewer && <th className="text-right">Aksi</th>}
            </tr>
          </thead>
          <tbody>
            {(kloter.kematianList || [])
              .slice((page - 1) * pageSize, page * pageSize)
              .map((item) => (
                <tr key={item.id}>
                  <td className="whitespace-nowrap font-medium">{formatDateIndonesian(item.tanggal)}</td>
                  <td className="font-bold text-red-600">{item.jumlahEkor} Ekor</td>
                  <td className="max-w-md text-slate-700">{item.penyebab}</td>
                  <td className="text-xs text-slate-500">{item.dicatatOleh}</td>
                  {!isViewer && (
                    <td className="text-right">
                      <button
                        className="text-red-500 hover:text-red-700 transition cursor-pointer p-1"
                        onClick={() => onDeleteKematian(kloter.id, item.id)}
                        title="Hapus Data Kematian"
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
          totalItems={kloter.kematianList?.length || 0}
          pageSize={pageSize}
          onPageChange={setPage}
        />
      </div>
    </div>
  );
}
