import React, { useState } from 'react';
import { X, CheckCircle2, Boxes } from 'lucide-react';
import { formatNumber, calculateKloterMetrics } from '../../utils/calculations';

export function ModalInputPengeluaran({ kloters, targetKloterId, activeHargaPerOns, onClose, onSubmit }) {
  const [kloterId, setKloterId] = useState(targetKloterId || kloters[0]?.id);
  const [tanggal, setTanggal] = useState(new Date().toISOString().split('T')[0]);
  const [kategori, setKategori] = useState('Pakan');
  const [keterangan, setKeterangan] = useState('');
  const [jumlahKg, setJumlahKg] = useState('');
  const [jumlahRp, setJumlahRp] = useState('');
  const [jumlahRpDisplayText, setJumlahRpDisplayText] = useState('');

  const handleJumlahRpChange = (e) => {
    const raw = e.target.value.replace(/\./g, '').replace(/[^0-9]/g, '');
    const numeric = Number(raw) || 0;
    setJumlahRp(numeric);
    setJumlahRpDisplayText(numeric > 0 ? numeric.toLocaleString('id-ID') : '');
  };

  const selectedKloter = kloters.find((k) => k.id === kloterId) || kloters[0];
  const metrics = calculateKloterMetrics(selectedKloter, activeHargaPerOns);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      kloterId,
      tanggal,
      kategori,
      keterangan,
      jumlahKg: kategori === 'Pakan' ? Number(jumlahKg) : 0,
      jumlahRp: Number(jumlahRp),
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="modal-header">
        <h3 className="modal-title">Catat Pengeluaran Operasional</h3>
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
            <span className="text-xs font-extrabold text-sky-800 whitespace-nowrap">{formatNumber(metrics.sisaAyamHidup)} Ekor</span>
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
            <div className="flex items-center justify-between bg-sky-50 border border-sky-200 p-2.5 rounded-xl text-xs mt-1">
              <span className="text-slate-600 font-semibold flex items-center gap-1.5">
                <Boxes size={14} className="text-sky-600" />
                Sisa Ayam Hidup Saat Ini:
              </span>
              <strong className="text-sky-800 font-extrabold">{formatNumber(metrics.sisaAyamHidup)} Ekor</strong>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div className="form-group">
            <label className="form-label">Tanggal Transaksi:</label>
            <input
              type="date"
              className="form-input"
              value={tanggal}
              onChange={(e) => setTanggal(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Kategori Biaya:</label>
            <select
              className="form-select"
              value={kategori}
              onChange={(e) => setKategori(e.target.value)}
            >
              <option value="Pakan">Pakan (Hitung Kg)</option>
              <option value="Obat-obatan">Obat-obatan & Vaksin</option>
              <option value="Listrik & Air">Listrik, Air & Bahan Bakar</option>
              <option value="Tenaga Kerja">Gaji Tenaga Kerja / Anak Kandang</option>
              <option value="Pemeliharaan Kandang">Pemeliharaan Kandang</option>
              <option value="Lainnya">Lainnya</option>
            </select>
          </div>
        </div>

        {kategori === 'Pakan' && (
          <div className="form-group">
            <label className="form-label">Jumlah Berat Pakan (Kg):</label>
            <input
              type="number"
              className="form-input"
              placeholder="Total Kg pakan yang dibeli..."
              value={jumlahKg}
              onChange={(e) => setJumlahKg(e.target.value)}
              required
              min="1"
            />
            <span className="form-help">Wajib diisi untuk kalkulasi rasio pakan (FCR).</span>
          </div>
        )}

        <div className="form-group">
          <label className="form-label">Total Nominal Biaya (Rp):</label>
          <div className="relative flex items-center">
            <span className="absolute left-3 text-xs font-bold text-slate-400 select-none pointer-events-none">Rp</span>
            <input
              type="text"
              inputMode="numeric"
              className="form-input form-input-prefix font-bold tracking-wide"
              placeholder="0"
              value={jumlahRpDisplayText}
              onChange={handleJumlahRpChange}
              required
            />
          </div>
          <span className="form-help">Titik ribuan muncul otomatis saat mengetik nominal.</span>
        </div>

        <div className="form-group">
          <label className="form-label">Keterangan Deskriptif Rinci:</label>
          <input
            type="text"
            className="form-input"
            placeholder="Misal: Pembelian Pakan Starter BR-1 Comfeed 50 Sak..."
            value={keterangan}
            onChange={(e) => setKeterangan(e.target.value)}
            required
          />
        </div>
      </div>
      <div className="modal-footer">
        <button type="button" className="btn btn-secondary btn-sm" onClick={onClose}>Batal</button>
        <button type="submit" className="btn btn-primary btn-sm"><CheckCircle2 size={16} /> Simpan Pengeluaran</button>
      </div>
    </form>
  );
}
