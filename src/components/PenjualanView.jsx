import React, { useState } from 'react';
import {
  Scale,
  PlusCircle,
  Search,
  Printer,
  Edit,
  Trash2,
  Filter,
  Receipt,
  CheckCircle2,
  X,
  Building2,
  Calendar,
  FileSpreadsheet,
  FileText,
  Download,
} from 'lucide-react';
import {
  formatRupiah,
  formatNumber,
  gramToOns,
  formatDateIndonesian,
} from '../utils/calculations';
import { exportPenjualanToExcel, exportPenjualanToPDF } from '../utils/exportUtils';

import { Pagination } from './Pagination';

export function PenjualanView({
  kloters,
  activeHargaPerOns,
  currentRole,
  onOpenModal,
  onEditPenjualan,
  onDeletePenjualan,
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedKloterFilter, setSelectedKloterFilter] = useState('semua');
  const [receiptItem, setReceiptItem] = useState(null); // When printable receipt modal is active
  const [editingItem, setEditingItem] = useState(null); // When editing modal is active
  const [currentPage, setCurrentPage] = useState(1);

  const isViewer = currentRole === 'viewer';

  // Aggregate all sales transactions from all kloters
  const allSalesList = kloters.flatMap((kloter) =>
    (kloter.penjualanList || []).map((sale) => ({
      ...sale,
      kloterId: kloter.id,
      namaKloter: kloter.namaKloter,
      kandang: kloter.kandang,
    }))
  );

  // Filter sales list
  const filteredSales = allSalesList.filter((item) => {
    const matchKloter =
      selectedKloterFilter === 'semua' || item.kloterId === selectedKloterFilter;
    const matchQuery =
      item.pembeli.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.namaKloter.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.catatanNota && item.catatanNota.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchKloter && matchQuery;
  });

  // Calculate paginated sales (max 15 rows)
  const pageSize = 15;
  const paginatedSales = filteredSales.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // Calculate totals
  const totalOmzet = filteredSales.reduce((sum, item) => sum + (Number(item.totalHarga) || 0), 0);
  const totalBeratGram = filteredSales.reduce((sum, item) => sum + (Number(item.beratGram) || 0), 0);
  const totalOns = gramToOns(totalBeratGram);
  const totalKg = totalBeratGram / 1000;

  // Calculate total ekor sold / harvested for filtered selection
  const totalEkorDirect = filteredSales.reduce(
    (sum, item) => sum + (Number(item.jumlahEkor) || 0),
    0
  );
  const totalEkorDipanenFiltered = kloters
    .filter((k) => selectedKloterFilter === 'semua' || k.id === selectedKloterFilter)
    .reduce(
      (sum, k) =>
        sum + (k.panenList || []).reduce((s, p) => s + (Number(p.jumlahEkor) || 0), 0),
      0
    );
  const totalAyamTerjual = totalEkorDirect > 0 ? totalEkorDirect : totalEkorDipanenFiltered;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Scale className="text-sky-600" size={24} />
            <span>Data Penjualan Berbasis Ons</span>
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-auto">
          {/* Export All Sales Data Buttons */}
          <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-sky-200 shadow-xs">
            <button
              className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg transition cursor-pointer shadow-xs"
              onClick={() => exportPenjualanToExcel(kloters)}
              title="Export Seluruh Data Transaksi Penjualan ke Excel"
            >
              <FileSpreadsheet size={15} />
              <span>Export Excel</span>
            </button>
            <button
              className="flex items-center gap-1.5 px-3 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-lg transition cursor-pointer shadow-xs"
              onClick={() => exportPenjualanToPDF(kloters)}
              title="Export Seluruh Data Transaksi Penjualan ke PDF"
            >
              <FileText size={15} />
              <span>Export PDF</span>
            </button>
          </div>

          {!isViewer && (
            <button
              className="flex items-center justify-center gap-2 px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl shadow-md transition cursor-pointer"
              onClick={() => onOpenModal('input_penjualan')}
            >
              <PlusCircle size={16} />
              <span>+ Input Penjualan Baru</span>
            </button>
          )}
        </div>
      </div>

      {/* Metric Cards Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-sky-100 shadow-xs flex flex-col justify-between">
          <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">
            Total Transaksi Jual
          </span>
          <div className="text-xl font-extrabold text-slate-900 mt-1">
            {filteredSales.length} Transaksi
          </div>
          <span className="text-[11px] text-slate-500 mt-1">Tercatat dalam sistem</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-sky-100 shadow-xs flex flex-col justify-between">
          <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">
            Jumlah Ayam Terjual
          </span>
          <div className="text-xl font-extrabold text-sky-900 mt-1">
            {formatNumber(totalAyamTerjual)} Ekor
          </div>
          <span className="text-[11px] text-slate-500 mt-1">Hasil tangkapan & panen</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-sky-100 shadow-xs flex flex-col justify-between">
          <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">
            Total Timbangan
          </span>
          <div className="text-xl font-extrabold text-sky-700 mt-1">
            {formatNumber(totalOns, 1)} Ons <span className="text-xs font-normal text-slate-500">({formatNumber(totalKg, 1)} Kg)</span>
          </div>
          <span className="text-[11px] text-slate-500 mt-1">Konversi 100 gram = 1 ons</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-sky-100 shadow-xs flex flex-col justify-between">
          <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">
            Total Omzet Penjualan
          </span>
          <div className="text-xl font-extrabold text-emerald-700 mt-1">
            {formatRupiah(totalOmzet)}
          </div>
          <span className="text-[11px] text-slate-500 mt-1">Akumulasi pendapatan kotor</span>
        </div>
      </div>

      {/* Filter & Search Controls */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between items-stretch sm:items-center bg-white p-3.5 rounded-2xl border border-sky-100 shadow-xs">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
            placeholder="Cari berdasarkan pembeli, nama kloter, atau nomor nota..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter size={14} className="text-slate-400 flex-shrink-0" />
          <select
            className="text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 focus:outline-none focus:border-sky-500"
            value={selectedKloterFilter}
            onChange={(e) => setSelectedKloterFilter(e.target.value)}
          >
            <option value="semua">Semua Kloter</option>
            {kloters.map((k) => (
              <option key={k.id} value={k.id}>
                {k.namaKloter}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Sales Transactions Table */}
      <div className="bg-white rounded-2xl border border-sky-100 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-sky-50/80 text-sky-900 border-b border-sky-100 font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Tanggal</th>
                <th className="py-3 px-4">Kloter Ayam</th>
                <th className="py-3 px-4">Nama Pembeli</th>
                <th className="py-3 px-4">Timbangan Gram</th>
                <th className="py-3 px-4">Hasil Ons</th>
                <th className="py-3 px-4">Harga / Ons</th>
                <th className="py-3 px-4">Total Rp</th>
                <th className="py-3 px-4">Metode</th>
                <th className="py-3 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedSales.map((sale) => {
                const ons = gramToOns(sale.beratGram);
                return (
                  <tr key={sale.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3.5 px-4 font-semibold text-slate-700 whitespace-nowrap">
                      {formatDateIndonesian(sale.tanggal)}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{sale.namaKloter}</div>
                      <div className="text-[10px] text-slate-400 font-semibold">{sale.kloterId}</div>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-800">
                      {sale.pembeli}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-700 whitespace-nowrap">
                      {formatNumber(sale.beratGram)} g
                    </td>
                    <td className="py-3.5 px-4 font-extrabold text-sky-700 whitespace-nowrap">
                      {formatNumber(ons, 1)} Ons
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap">
                      {formatRupiah(sale.hargaPerOnsSnapshot)}
                    </td>
                    <td className="py-3.5 px-4 font-extrabold text-emerald-700 text-sm whitespace-nowrap">
                      {formatRupiah(sale.totalHarga)}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold">
                        {sale.metodePembayaran}
                      </span>
                    </td>
                    {/* Action Column */}
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        {/* Cetak Struk Button */}
                        <button
                          className="p-1.5 bg-sky-50 text-sky-700 hover:bg-sky-100 rounded-lg transition"
                          onClick={() => setReceiptItem(sale)}
                          title="Cetak Struk Penjualan"
                        >
                          <Printer size={15} />
                        </button>

                        {!isViewer && (
                          <>
                            {/* Edit Button */}
                            <button
                              className="p-1.5 bg-amber-50 text-amber-700 hover:bg-amber-100 rounded-lg transition"
                              onClick={() => setEditingItem(sale)}
                              title="Edit Transaksi Penjualan"
                            >
                              <Edit size={15} />
                            </button>

                            {/* Delete Button */}
                            <button
                              className="p-1.5 bg-red-50 text-red-700 hover:bg-red-100 rounded-lg transition"
                              onClick={() => {
                                if (
                                  window.confirm(
                                    `Apakah Anda yakin ingin menghapus data penjualan dari '${sale.pembeli}' sebesar ${formatRupiah(sale.totalHarga)}?`
                                  )
                                ) {
                                  onDeletePenjualan(sale.kloterId, sale.id);
                                }
                              }}
                              title="Hapus Transaksi"
                            >
                              <Trash2 size={15} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredSales.length === 0 && (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-500">
                    Tidak ditemukan data penjualan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <Pagination
          currentPage={currentPage}
          totalItems={filteredSales.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
        />
      </div>

      {/* PRINTABLE RECEIPT MODAL */}
      {receiptItem && (
        <ModalCetakStruk item={receiptItem} onClose={() => setReceiptItem(null)} />
      )}

      {/* EDIT SALES MODAL */}
      {editingItem && (
        <ModalEditPenjualan
          item={editingItem}
          onClose={() => setEditingItem(null)}
          onSave={(updatedData) => {
            onEditPenjualan(editingItem.kloterId, editingItem.id, updatedData);
            setEditingItem(null);
          }}
        />
      )}
    </div>
  );
}

/* Modal Struk Nota Penjualan */
function ModalCetakStruk({ item, onClose }) {
  const ons = gramToOns(item.beratGram);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-200" onClick={(e) => e.stopPropagation()}>
        {/* Printable Invoice Sheet */}
        <div id="printable-receipt" className="space-y-4 text-slate-900 font-sans">
          {/* Farm Header */}
          <div className="text-center border-b pb-3 border-dashed border-slate-300">
            <h2 className="text-base font-extrabold uppercase tracking-tight text-slate-900">
              PETERNAKAN UNGGUL MANDIRI
            </h2>
            <p className="text-[11px] text-slate-500">
              Sistem Pendataan & Penjualan Ayam Broiler Berbasis Ons
            </p>
            <p className="text-[10px] text-slate-400 mt-0.5">
              Nota Ref: #{item.id} &bull; {formatDateIndonesian(item.tanggal)}
            </p>
          </div>

          {/* Details Table */}
          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-0.5">
              <span className="text-slate-500">Kloter Ayam:</span>
              <strong className="text-slate-900">{item.namaKloter}</strong>
            </div>
            <div className="flex justify-between py-0.5">
              <span className="text-slate-500">Nama Pembeli:</span>
              <strong className="text-slate-900">{item.pembeli}</strong>
            </div>
            <div className="flex justify-between py-0.5">
              <span className="text-slate-500">Metode Bayar:</span>
              <strong className="text-slate-800">{item.metodePembayaran}</strong>
            </div>
          </div>

          <div className="border-t border-b py-2.5 border-dashed border-slate-300 space-y-1.5 text-xs">
            <div className="flex justify-between">
              <span>Berat Timbangan Digital:</span>
              <strong className="text-slate-900">{formatNumber(item.beratGram)} Gram</strong>
            </div>
            <div className="flex justify-between">
              <span>Hasil Konversi Ons (100g):</span>
              <strong className="text-sky-700 font-extrabold">{formatNumber(ons, 1)} Ons</strong>
            </div>
            <div className="flex justify-between">
              <span>Harga Acuan Per Ons:</span>
              <span>{formatRupiah(item.hargaPerOnsSnapshot)} / Ons</span>
            </div>
          </div>

          <div className="flex justify-between items-center text-sm font-extrabold pt-1">
            <span>TOTAL PEMBAYARAN:</span>
            <span className="text-emerald-700 text-base">{formatRupiah(item.totalHarga)}</span>
          </div>

          {item.catatanNota && (
            <p className="text-[11px] text-slate-500 italic bg-slate-50 p-2 rounded-lg border border-slate-200">
              Catatan: {item.catatanNota}
            </p>
          )}

          {/* Signature Footer */}
          <div className="grid grid-cols-2 gap-4 pt-6 text-center text-[10px] text-slate-500">
            <div>
              <p>Pembeli / Penerima</p>
              <div className="h-10"></div>
              <p className="font-bold text-slate-800 underline">({item.pembeli})</p>
            </div>
            <div>
              <p>Kasir / Admin Peternakan</p>
              <div className="h-10"></div>
              <p className="font-bold text-slate-800 underline">( Petugas Penjualan )</p>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
          <button className="px-3 py-1.5 text-xs font-bold rounded-xl border border-slate-300 hover:bg-slate-100" onClick={onClose}>
            Tutup
          </button>
          <button className="px-4 py-1.5 text-xs font-bold rounded-xl bg-sky-600 hover:bg-sky-700 text-white flex items-center gap-1.5 shadow-sm cursor-pointer" onClick={handlePrint}>
            <Printer size={15} />
            <span>Cetak Struk Sekarang</span>
          </button>
        </div>
      </div>
    </div>
  );
}

/* Modal Edit Penjualan */
function ModalEditPenjualan({ item, onClose, onSave }) {
  const [pembeli, setPembeli] = useState(item.pembeli);
  const [beratGram, setBeratGram] = useState(item.beratGram);
  const [metodePembayaran, setMetodePembayaran] = useState(item.metodePembayaran);
  const [catatanNota, setCatatanNota] = useState(item.catatanNota || '');

  const onsCalculated = gramToOns(beratGram);
  const totalCalculatedRp = onsCalculated * item.hargaPerOnsSnapshot;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      pembeli,
      beratGram: Number(beratGram),
      totalHarga: totalCalculatedRp,
      metodePembayaran,
      catatanNota,
    });
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 border border-slate-200" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center border-b pb-3">
          <h3 className="font-extrabold text-sm text-slate-900">Edit Data Penjualan (#{item.id})</h3>
          <button onClick={onClose}><X size={18} className="text-slate-400" /></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="font-bold text-slate-700 block mb-1">Nama Pembeli / Toko:</label>
            <input
              type="text"
              className="w-full p-2 border border-slate-300 rounded-xl font-medium"
              value={pembeli}
              onChange={(e) => setPembeli(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Berat Timbangan Digital (Gram):</label>
            <input
              type="number"
              className="w-full p-2 border border-slate-300 rounded-xl font-bold"
              value={beratGram}
              onChange={(e) => setBeratGram(e.target.value)}
              required
              min="100"
              step="100"
            />
          </div>

          <div className="bg-sky-50 p-3 rounded-xl border border-sky-200 space-y-1">
            <div className="flex justify-between">
              <span className="text-slate-600">Konversi Ke Ons:</span>
              <strong className="text-sky-800">{formatNumber(onsCalculated, 1)} Ons</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Harga Snapshot:</span>
              <span>{formatRupiah(item.hargaPerOnsSnapshot)} / Ons</span>
            </div>
            <div className="flex justify-between pt-1 border-t border-sky-200 font-extrabold text-sm text-emerald-800">
              <span>Total Baru:</span>
              <span>{formatRupiah(totalCalculatedRp)}</span>
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Metode Pembayaran:</label>
            <select
              className="w-full p-2 border border-slate-300 rounded-xl font-medium"
              value={metodePembayaran}
              onChange={(e) => setMetodePembayaran(e.target.value)}
            >
              <option value="Transfer Bank (Lunas)">Transfer Bank (Lunas)</option>
              <option value="Tunai / Cash">Tunai / Cash Direct</option>
              <option value="Tempo 7 Hari">Tempo Pembayaran 7 Hari</option>
            </select>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Catatan Nota:</label>
            <input
              type="text"
              className="w-full p-2 border border-slate-300 rounded-xl font-medium"
              value={catatanNota}
              onChange={(e) => setCatatanNota(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t">
            <button type="button" className="px-3 py-1.5 border rounded-xl" onClick={onClose}>Batal</button>
            <button type="submit" className="px-4 py-1.5 bg-sky-600 text-white font-bold rounded-xl">Simpan Perubahan</button>
          </div>
        </form>
      </div>
    </div>
  );
}
