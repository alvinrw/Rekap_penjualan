import React, { useState } from 'react';
import { FileText, Search, ShieldCheck } from 'lucide-react';

export function AuditLogView({ auditLogs }) {
  const [search, setSearch] = useState('');

  const filteredLogs = auditLogs.filter(
    (log) =>
      log.deskripsi.toLowerCase().includes(search.toLowerCase()) ||
      log.user.toLowerCase().includes(search.toLowerCase()) ||
      log.modul.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div className="page-title-group">
          <h1>Audit Log & Riwayat Perubahan Sistem</h1>
          <p>
            Jejak aktivitas keamanan seluruh perubahan data kloter, transaksi pengeluaran, kematian, panen, penjualan, dan penyesuaian harga acuan.
          </p>
        </div>
      </div>

      <div className="bg-white p-3 rounded-xl border border-primary-200">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            className="form-input pl-9"
            placeholder="Filter audit log berdasarkan user, modul, atau pesan aktivitas..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="card space-y-4">
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Waktu Timestamp</th>
                <th>Pengguna</th>
                <th>Modul</th>
                <th>Aksi</th>
                <th>Detail Deskripsi Aktivitas</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map((log) => (
                <tr key={log.id}>
                  <td className="whitespace-nowrap font-mono text-xs text-slate-500">{log.timestamp}</td>
                  <td className="font-bold text-xs text-primary-900">{log.user}</td>
                  <td>
                    <span className="px-2 py-0.5 bg-primary-50 text-primary-700 font-bold rounded text-xs">
                      {log.modul}
                    </span>
                  </td>
                  <td className="font-semibold text-xs text-slate-800">{log.aksi}</td>
                  <td className="text-xs text-slate-600 max-w-md">{log.deskripsi}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
