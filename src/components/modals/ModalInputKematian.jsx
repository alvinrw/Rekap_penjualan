import React, { useState } from 'react';
import { X, CheckCircle2, Boxes } from 'lucide-react';
import { formatNumber, calculateKloterMetrics } from '../../utils/calculations';

export function ModalInputKematian({ kloters, targetKloterId, activeHargaPerOns, onClose, onSubmit }) {
  const [kloterId, setKloterId] = useState(targetKloterId || kloters[0]?.id);
  const [tanggal, setTanggal] = useState(new Date().toISOString().split('T')[0]);
  const [jumlahEkor, setJumlahEkor] = useState('');
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
