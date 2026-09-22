import React, { useState } from 'react';
import { X, CheckCircle2, Boxes, Percent } from 'lucide-react';
import { formatRupiah, formatNumber, calculateKloterMetrics } from '../../utils/calculations';

export function ModalInputPenjualan({ kloters, targetKloterId, activeHargaPerOns, onClose, onSubmit }) {
  const [kloterId, setKloterId] = useState(targetKloterId || kloters[0]?.id);
  const [tanggal, setTanggal] = useState(new Date().toISOString().split('T')[0]);
  const [pembeli, setPembeli] = useState('');
  const [jumlahEkor, setJumlahEkor] = useState('');
  const [inputSubtotalHarga, setInputSubtotalHarga] = useState('');
  const [subtotalDisplayText, setSubtotalDisplayText] = useState('');
  const [isDiscountActive, setIsDiscountActive] = useState(false);
  const [diskonPersen, setDiskonPersen] = useState(5);
  const [metodePembayaran, setMetodePembayaran] = useState('Transfer Bank (Lunas)');
  const [catatanNota, setCatatanNota] = useState('');

  const handleSubtotalChange = (e) => {
    const raw = e.target.value.replace(/\./g, '').replace(/[^0-9]/g, '');
    const numeric = Number(raw) || 0;
    setInputSubtotalHarga(numeric);
    setSubtotalDisplayText(numeric > 0 ? numeric.toLocaleString('id-ID') : '');
  };

  const selectedKloter = kloters.find((k) => k.id === kloterId) || kloters[0];
  const metrics = calculateKloterMetrics(selectedKloter, activeHargaPerOns);

  // Live Calculations (Reverse Logic: Harga -> Timbangan)
  const subtotalRp = Number(inputSubtotalHarga) || 0;
  const nominalDiskonRp = isDiscountActive ? subtotalRp * (Number(diskonPersen) / 100) : 0;
  const totalCalculatedRp = Math.max(0, subtotalRp - nominalDiskonRp);

  const onsCalculated = activeHargaPerOns > 0 ? subtotalRp / activeHargaPerOns : 0;
  const beratGramCalculated = onsCalculated * 100;
  const stokHabis = metrics.stokSiapJual <= 0;
  const jumlahMelebihiStok = Number(jumlahEkor) > metrics.stokSiapJual;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      kloterId,
      tanggal,
      pembeli,
      jumlahEkor: Number(jumlahEkor) || 1,
      beratGram: Number(beratGramCalculated),
      hargaPerOnsSnapshot: activeHargaPerOns,
      subtotalHarga: subtotalRp,
      isDiscountActive,
      diskonPersen: isDiscountActive ? Number(diskonPersen) : 0,
      nominalDiskon: nominalDiskonRp,
      totalHarga: totalCalculatedRp,
      metodePembayaran,
      catatanNota,
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="modal-header">
        <h3 className="modal-title">Input Penjualan (Harga &rarr; Timbangan)</h3>
        <button type="button" className="modal-close-btn" onClick={onClose}><X size={18} /></button>
      </div>
      <div className="modal-body">
        {targetKloterId ? (
          <div className="flex items-center gap-3 bg-sky-50 border border-sky-200 px-3.5 py-2.5 rounded-xl">
            <Boxes size={16} className="text-sky-600 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="text-[10px] font-bold text-sky-600 uppercase tracking-wider">Kloter Terpilih</div>
              <div className="text-xs font-extrabold text-slate-900 truncate">{selectedKloter?.namaKloter}</div>
            </div>
            <span className="text-xs font-extrabold text-amber-900 bg-amber-100 px-2.5 py-1 rounded-lg border border-amber-200 whitespace-nowrap">
              Stok Siap Jual: {formatNumber(metrics.stokSiapJual)} Ekor
            </span>
          </div>
        ) : (
          <div className="form-group">
            <label className="form-label">Pilih Kloter Tujuan (Kloter Berjalan):</label>
            <select
              className="form-select font-bold"
              value={kloterId}
              onChange={(e) => setKloterId(e.target.value)}
            >
              {kloters.map((k) => (
                <option key={k.id} value={k.id}>
                  {k.namaKloter} ({k.status})
                </option>
              ))}
            </select>
            <div className="flex items-center justify-between bg-amber-50 border border-amber-200 p-2.5 rounded-xl text-xs mt-1">
              <span className="text-slate-700 font-semibold flex items-center gap-1.5">
                <Boxes size={14} className="text-amber-600" />
                Stok Panen Siap Dijual:
              </span>
              <strong className="text-amber-900 font-extrabold">{formatNumber(metrics.stokSiapJual)} Ekor</strong>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="form-group">
            <label className="form-label">Tanggal Penjualan:</label>
            <input
              type="date"
              className="form-input"
              value={tanggal}
              onChange={(e) => setTanggal(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Nama Pembeli / Toko:</label>
            <input
              type="text"
              className="form-input"
              placeholder="Nama pelanggan / toko..."
              value={pembeli}
              onChange={(e) => setPembeli(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Jumlah Ekor Dijual:</label>
            <input
              type="number"
              className="form-input font-bold"
              placeholder="Jumlah ekor..."
              value={jumlahEkor}
              onChange={(e) => setJumlahEkor(e.target.value === '' ? '' : Math.max(0, Number(e.target.value)))}
              min="1"
              max={metrics.stokSiapJual}
              required
            />
          </div>
        </div>

        <div className={`rounded-xl border px-3 py-2.5 text-xs font-bold ${stokHabis || jumlahMelebihiStok ? 'bg-red-50 border-red-200 text-red-700' : 'bg-emerald-50 border-emerald-200 text-emerald-700'}`}>
          {stokHabis
            ? 'Stok ayam sudah habis. Transaksi penjualan baru tidak dapat dibuat.'
            : jumlahMelebihiStok
              ? `Jumlah melebihi stok. Maksimal ${formatNumber(metrics.stokSiapJual)} ekor.`
              : `Stok tersedia setelah transaksi: ${formatNumber(Math.max(0, metrics.stokSiapJual - Number(jumlahEkor)))} ekor.`}
        </div>

        <div className="form-group">
          <label className="form-label">Total Harga Penjualan (Rp):</label>
          <div className="relative flex items-center">
            <span className="absolute left-3 text-xs font-bold text-slate-500 select-none pointer-events-none">Rp</span>
            <input
              type="text"
              inputMode="numeric"
              className="form-input form-input-prefix font-bold"
              placeholder="0"
              value={subtotalDisplayText}
              onChange={handleSubtotalChange}
              required
            />
          </div>
          <span className="form-help">Masukkan nominal harga. Estimasi berat hasil timbangan akan dihitung otomatis.</span>
        </div>

        {/* DISCOUNT CHECKBOX & PERCENTAGE INPUT */}
        <div className="bg-amber-50/70 border border-amber-200 p-3 rounded-xl space-y-2">
          <label className="flex items-center gap-2 cursor-pointer font-bold text-xs text-amber-900 select-none">
            <input
              type="checkbox"
              className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 cursor-pointer"
              checked={isDiscountActive}
              onChange={(e) => setIsDiscountActive(e.target.checked)}
            />
            <Percent size={15} className="text-amber-600" />
            <span>Berikan Diskon Penjualan (%)</span>
          </label>

          {isDiscountActive && (
            <div className="pt-2 border-t border-amber-200 grid grid-cols-2 gap-3 items-center">
              <div>
                <label className="text-[11px] font-bold text-amber-900 block mb-1">Potongan Diskon (%):</label>
                <div className="relative">
                  <input
                    type="number"
                    className="w-full p-2 text-xs rounded-lg border border-amber-300 font-bold bg-white focus:outline-none focus:border-amber-500 pr-7"
                    value={diskonPersen}
                    onChange={(e) => setDiskonPersen(Math.max(0, Math.min(100, Number(e.target.value))))}
                    min="0"
                    max="100"
                    step="0.5"
                    required
                  />
                  <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-amber-700">%</span>
                </div>
              </div>

              <div>
                <span className="text-[11px] font-bold text-amber-900 block mb-1">Nominal Hemat Diskon:</span>
                <div className="p-2 text-xs rounded-lg bg-amber-100 font-extrabold text-amber-900 border border-amber-300">
                  - {formatRupiah(nominalDiskonRp)}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Live Calculation Output Display Box */}
        <div className="calc-preview-box border-sky-300">
          <div className="calc-preview-row">
            <span className="calc-preview-label">Snapshot Harga Aktif:</span>
            <span className="calc-preview-value">{formatRupiah(activeHargaPerOns)} / Ons</span>
          </div>
          <div className="calc-preview-row">
            <span className="calc-preview-label">Konversi Ke Ons:</span>
            <span className="calc-preview-value">{formatNumber(onsCalculated, 1)} Ons</span>
          </div>
          <div className="calc-preview-row border-t border-sky-200 pt-1.5 mt-1.5 font-extrabold">
            <span className="calc-preview-label text-sky-900">ESTIMASI BERAT TOTAL (KG):</span>
            <span className="text-emerald-700">{formatNumber(beratGramCalculated / 1000, 2)} Kg</span>
          </div>
          {isDiscountActive && (
            <div className="calc-preview-row text-amber-800 border-t border-sky-200 pt-1.5 mt-1.5">
              <span className="calc-preview-label">Potongan Diskon ({diskonPersen}%):</span>
              <span className="font-bold">- {formatRupiah(nominalDiskonRp)}</span>
            </div>
          )}
          <div className="calc-preview-row pt-2 border-t border-sky-200 text-sm font-extrabold text-emerald-800">
            <span>TOTAL SETELAH DISKON:</span>
            <span>{formatRupiah(totalCalculatedRp)}</span>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Metode Pembayaran:</label>
          <select
            className="form-select"
            value={metodePembayaran}
            onChange={(e) => setMetodePembayaran(e.target.value)}
          >
            <option value="Transfer Bank (Lunas)">Transfer Bank (Lunas)</option>
            <option value="Tunai / Cash">Tunai / Cash Direct</option>
            <option value="Tempo 7 Hari">Tempo Pembayaran 7 Hari</option>
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Catatan Nota Penjualan:</label>
          <input
            type="text"
            className="form-input"
            placeholder="Nomor nota transaksi, ekspedisi..."
            value={catatanNota}
            onChange={(e) => setCatatanNota(e.target.value)}
          />
        </div>
      </div>
      <div className="modal-footer">
        <button type="button" className="btn btn-secondary btn-sm" onClick={onClose}>Batal</button>
        <button type="submit" disabled={stokHabis || jumlahMelebihiStok} className="btn btn-primary btn-sm disabled:opacity-50 disabled:cursor-not-allowed"><CheckCircle2 size={16} /> Simpan Transaksi Penjualan</button>
      </div>
    </form>
  );
}
