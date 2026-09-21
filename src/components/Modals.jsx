import React, { useState } from 'react';
import { X, CheckCircle2, Calculator, Tag, Boxes, AlertCircle, Percent } from 'lucide-react';
import {
  formatRupiah,
  formatNumber,
  gramToOns,
  calculateSalesPrice,
  calculateKloterMetrics,
} from '../utils/calculations';

export function Modals({
  activeModal,
  selectedKloterId,
  kloters,
  activeHargaPerOns,
  currentRole,
  onClose,
  onSubmitTambahKloter,
  onSubmitPengeluaran,
  onSubmitKematian,
  onSubmitPanen,
  onSubmitPenjualan,
}) {
  if (!activeModal) return null;

  // Filter ONLY active / ongoing kloters (exclude 'Selesai') for transactions
  const activeKlotersOnly = kloters.filter((k) => k.status !== 'Selesai');
  const targetKloter = activeKlotersOnly.find((k) => k.id === selectedKloterId) || activeKlotersOnly[0] || kloters[0];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* MODAL 1: TAMBAH KLOTER */}
        {activeModal === 'tambah_kloter' && (
          <ModalTambahKloter onClose={onClose} onSubmit={onSubmitTambahKloter} />
        )}

        {/* MODAL 2: INPUT PENGELUARAN */}
        {activeModal === 'input_pengeluaran' && (
          <ModalInputPengeluaran
            kloters={activeKlotersOnly}
            targetKloterId={targetKloter?.id}
            activeHargaPerOns={activeHargaPerOns}
            onClose={onClose}
            onSubmit={onSubmitPengeluaran}
          />
        )}

        {/* MODAL 3: INPUT KEMATIAN */}
        {activeModal === 'input_kematian' && (
          <ModalInputKematian
            kloters={activeKlotersOnly}
            targetKloterId={targetKloter?.id}
            activeHargaPerOns={activeHargaPerOns}
            onClose={onClose}
            onSubmit={onSubmitKematian}
          />
        )}

        {/* MODAL 4: INPUT PANEN (SIMPLIFIED: EKOR ONLY) */}
        {activeModal === 'input_panen' && (
          <ModalInputPanen
            kloters={activeKlotersOnly}
            targetKloterId={targetKloter?.id}
            activeHargaPerOns={activeHargaPerOns}
            onClose={onClose}
            onSubmit={onSubmitPanen}
          />
        )}

        {/* MODAL 5: INPUT PENJUALAN WITH DISCOUNT CHECKBOX */}
        {activeModal === 'input_penjualan' && (
          <ModalInputPenjualan
            kloters={activeKlotersOnly}
            targetKloterId={targetKloter?.id}
            activeHargaPerOns={activeHargaPerOns}
            onClose={onClose}
            onSubmit={onSubmitPenjualan}
          />
        )}
      </div>
    </div>
  );
}

/* 1. Modal Tambah Kloter Baru */
function ModalTambahKloter({ onClose, onSubmit }) {
  const [namaKloter, setNamaKloter] = useState('');
  const [tanggalBeliDoc, setTanggalBeliDoc] = useState(new Date().toISOString().split('T')[0]);
  const [docAwal, setDocAwal] = useState(5000);
  const [hargaDocPerEkor, setHargaDocPerEkor] = useState(8200);
  const [hargaDisplayText, setHargaDisplayText] = useState('8.200');
  const [catatanAwal, setCatatanAwal] = useState('');

  // Format titik ribuan saat ketik
  const handleHargaChange = (e) => {
    const raw = e.target.value.replace(/\./g, '').replace(/[^0-9]/g, '');
    const numeric = Number(raw) || 0;
    setHargaDocPerEkor(numeric);
    setHargaDisplayText(numeric > 0 ? numeric.toLocaleString('id-ID') : '');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      namaKloter,
      kandang: '',
      tanggalBeliDoc,
      docAwal: Number(docAwal),
      hargaDocPerEkor: Number(hargaDocPerEkor),
      catatanAwal,
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="modal-header">
        <h3 className="modal-title">Buat Kloter Baru (Beli DOC)</h3>
        <button type="button" className="modal-close-btn" onClick={onClose}><X size={18} /></button>
      </div>
      <div className="modal-body">
        <div className="form-group">
          <label className="form-label">Nama Kloter (Batch):</label>
          <input
            type="text"
            className="form-input"
            placeholder="Contoh: Kloter Broiler Delta - Kandang Utama 03"
            value={namaKloter}
            onChange={(e) => setNamaKloter(e.target.value)}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="form-group">
            <label className="form-label">Tanggal Masuk DOC:</label>
            <input
              type="date"
              className="form-input"
              value={tanggalBeliDoc}
              onChange={(e) => setTanggalBeliDoc(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Jumlah DOC Awal (Ekor):</label>
            <input
              type="number"
              className="form-input"
              value={docAwal}
              onChange={(e) => setDocAwal(e.target.value)}
              required
              min="100"
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Harga Beli DOC Per Ekor (Rp):</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">Rp</span>
            <input
              type="text"
              inputMode="numeric"
              className="form-input pl-9 font-bold tracking-wide"
              placeholder="0"
              value={hargaDisplayText}
              onChange={handleHargaChange}
              required
            />
          </div>
          <span className="form-help">Titik ribuan muncul otomatis. Contoh: ketik 8200 → 8.200</span>
        </div>

        <div className="calc-preview-box">
          <div className="calc-preview-row">
            <span className="calc-preview-label">Estimasi Total Modal Beli DOC:</span>
            <span className="calc-preview-value">{formatRupiah(Number(docAwal) * Number(hargaDocPerEkor))}</span>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Catatan Awal Bibit & Supplier:</label>
          <textarea
            className="form-textarea"
            placeholder="Keterangan strain bibit Cobb 500 / Ross 308, supplier, dan kondisi kesehatan awal..."
            value={catatanAwal}
            onChange={(e) => setCatatanAwal(e.target.value)}
            required
          />
        </div>
      </div>
      <div className="modal-footer">
        <button type="button" className="btn btn-secondary btn-sm" onClick={onClose}>Batal</button>
        <button type="submit" className="btn btn-primary btn-sm"><CheckCircle2 size={16} /> Simpan Kloter</button>
      </div>
    </form>
  );
}

/* 2. Modal Input Pengeluaran */
function ModalInputPengeluaran({ kloters, targetKloterId, activeHargaPerOns, onClose, onSubmit }) {
  const [kloterId, setKloterId] = useState(targetKloterId || kloters[0]?.id);
  const [tanggal, setTanggal] = useState(new Date().toISOString().split('T')[0]);
  const [kategori, setKategori] = useState('Pakan');
  const [keterangan, setKeterangan] = useState('');
  const [jumlahKg, setJumlahKg] = useState(2500);
  const [jumlahRp, setJumlahRp] = useState(21250000);

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
        {/* Kloter Info: jika dari KloterDetail = tampilkan statis, jika global = tampilkan dropdown */}
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
          <input
            type="number"
            className="form-input"
            value={jumlahRp}
            onChange={(e) => setJumlahRp(e.target.value)}
            required
            min="100"
          />
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

/* 3. Modal Input Kematian */
function ModalInputKematian({ kloters, targetKloterId, activeHargaPerOns, onClose, onSubmit }) {
  const [kloterId, setKloterId] = useState(targetKloterId || kloters[0]?.id);
  const [tanggal, setTanggal] = useState(new Date().toISOString().split('T')[0]);
  const [jumlahEkor, setJumlahEkor] = useState(5);
  const [penyebab, setPenyebab] = useState('');

  const selectedKloter = kloters.find((k) => k.id === kloterId) || kloters[0];
  const metrics = calculateKloterMetrics(selectedKloter, activeHargaPerOns);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      kloterId,
      tanggal,
      jumlahEkor: Number(jumlahEkor),
      penyebab,
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="modal-header">
        <h3 className="modal-title">Catat Kematian Ayam Harian</h3>
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
            <label className="form-label">Tanggal Kejadian:</label>
            <input
              type="date"
              className="form-input"
              value={tanggal}
              onChange={(e) => setTanggal(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Jumlah Kematian (Ekor):</label>
            <input
              type="number"
              className="form-input"
              value={jumlahEkor}
              onChange={(e) => setJumlahEkor(e.target.value)}
              required
              min="1"
              max={metrics.sisaAyamHidup}
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Penyebab / Catatan Kondisi:</label>
          <textarea
            className="form-textarea"
            placeholder="Contoh: Heat stress, penyesuaian suhu brooding..."
            value={penyebab}
            onChange={(e) => setPenyebab(e.target.value)}
            required
          />
        </div>
      </div>
      <div className="modal-footer">
        <button type="button" className="btn btn-secondary btn-sm" onClick={onClose}>Batal</button>
        <button type="submit" className="btn btn-primary btn-sm"><CheckCircle2 size={16} /> Simpan Catatan Kematian</button>
      </div>
    </form>
  );
}

/* 4. Modal Input Panen (SIMPLIFIED TO JUMLAH EKOR ONLY) */
function ModalInputPanen({ kloters, targetKloterId, activeHargaPerOns, onClose, onSubmit }) {
  const [kloterId, setKloterId] = useState(targetKloterId || kloters[0]?.id);
  const [tanggal, setTanggal] = useState(new Date().toISOString().split('T')[0]);
  const [jumlahEkor, setJumlahEkor] = useState(1000);
  const [catatan, setCatatan] = useState('');

  const selectedKloter = kloters.find((k) => k.id === kloterId) || kloters[0];
  const metrics = calculateKloterMetrics(selectedKloter, activeHargaPerOns);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      kloterId,
      tanggal,
      jumlahEkor: Number(jumlahEkor),
      catatan,
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="modal-header">
        <h3 className="modal-title">Input Panen Bertahap</h3>
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
            <label className="form-label">Pilih Kloter Tujuan:</label>
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
                Sisa Ayam Hidup:
              </span>
              <strong className="text-sky-800 font-extrabold">{formatNumber(metrics.sisaAyamHidup)} Ekor</strong>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div className="form-group">
            <label className="form-label">Tanggal Panen:</label>
            <input
              type="date"
              className="form-input"
              value={tanggal}
              onChange={(e) => setTanggal(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Jumlah Panen (Ekor):</label>
            <input
              type="number"
              className="form-input font-bold text-sky-900"
              value={jumlahEkor}
              onChange={(e) => setJumlahEkor(e.target.value)}
              required
              min="1"
              max={metrics.sisaAyamHidup}
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Catatan Panen:</label>
          <input
            type="text"
            className="form-input"
            placeholder="Contoh: Panen penjarangan tahap 1..."
            value={catatan}
            onChange={(e) => setCatatan(e.target.value)}
          />
        </div>
      </div>
      <div className="modal-footer">
        <button type="button" className="btn btn-secondary btn-sm" onClick={onClose}>Batal</button>
        <button type="submit" className="btn btn-primary btn-sm"><CheckCircle2 size={16} /> Simpan Panen</button>
      </div>
    </form>
  );
}

/* 5. Modal Input Penjualan */
function ModalInputPenjualan({ kloters, targetKloterId, activeHargaPerOns, onClose, onSubmit }) {
  const [kloterId, setKloterId] = useState(targetKloterId || kloters[0]?.id);
  const [tanggal, setTanggal] = useState(new Date().toISOString().split('T')[0]);
  const [pembeli, setPembeli] = useState('');
  const [inputSubtotalHarga, setInputSubtotalHarga] = useState(187500000); // Default nilai contoh Rp 187.500.000
  const [isDiscountActive, setIsDiscountActive] = useState(false);
  const [diskonPersen, setDiskonPersen] = useState(5);
  const [metodePembayaran, setMetodePembayaran] = useState('Transfer Bank (Lunas)');
  const [catatanNota, setCatatanNota] = useState('');

  const selectedKloter = kloters.find((k) => k.id === kloterId) || kloters[0];
  const metrics = calculateKloterMetrics(selectedKloter, activeHargaPerOns);

  // Live Calculations (Reverse Logic: Harga -> Timbangan)
  const subtotalRp = Number(inputSubtotalHarga) || 0;
  const nominalDiskonRp = isDiscountActive ? subtotalRp * (Number(diskonPersen) / 100) : 0;
  const totalCalculatedRp = Math.max(0, subtotalRp - nominalDiskonRp);
  
  const onsCalculated = activeHargaPerOns > 0 ? subtotalRp / activeHargaPerOns : 0;
  const beratGramCalculated = onsCalculated * 100;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      kloterId,
      tanggal,
      pembeli,
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
                Sisa Ayam Hidup di Kloter Ini:
              </span>
              <strong className="text-sky-800 font-extrabold">{formatNumber(metrics.sisaAyamHidup)} Ekor</strong>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
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
        </div>

        <div className="form-group">
          <label className="form-label">Total Harga Penjualan (Rp):</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-500">Rp</span>
            <input
              type="number"
              className="form-input font-bold pl-8"
              value={inputSubtotalHarga}
              onChange={(e) => setInputSubtotalHarga(e.target.value)}
              required
              min="1000"
              step="1000"
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
        <button type="submit" className="btn btn-primary btn-sm"><CheckCircle2 size={16} /> Simpan Transaksi Penjualan</button>
      </div>
    </form>
  );
}
