import React, { useState } from 'react';
import { X, CheckCircle2 } from 'lucide-react';

export function ModalEditKloter({ kloter, onClose, onSubmit }) {
  const [namaKloter, setNamaKloter] = useState(kloter?.namaKloter || '');
  const [kandang, setKandang] = useState(kloter?.kandang || '');
  const [tanggalBeliDoc, setTanggalBeliDoc] = useState(kloter?.tanggalBeliDoc || '');
  const [docAwal, setDocAwal] = useState(kloter?.docAwal || 0);
  const [hargaDocPerEkor, setHargaDocPerEkor] = useState(kloter?.hargaDocPerEkor || 0);
  const [hargaDisplayText, setHargaDisplayText] = useState((kloter?.hargaDocPerEkor || 0).toLocaleString('id-ID'));
  const [catatanAwal, setCatatanAwal] = useState(kloter?.catatanAwal || '');

  const handleHargaChange = (e) => {
    const raw = e.target.value.replace(/\./g, '').replace(/[^0-9]/g, '');
    const numeric = Number(raw) || 0;
    setHargaDocPerEkor(numeric);
    setHargaDisplayText(numeric > 0 ? numeric.toLocaleString('id-ID') : '');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      id: kloter.id,
      namaKloter,
      kandang,
      tanggalBeliDoc,
      docAwal: Number(docAwal),
      hargaDocPerEkor: Number(hargaDocPerEkor),
      catatanAwal,
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="modal-header">
        <h3 className="modal-title">Edit Kloter ({kloter?.id})</h3>
        <button type="button" className="modal-close-btn" onClick={onClose}><X size={18} /></button>
      </div>
      <div className="modal-body">
        <div className="form-group">
          <label className="form-label">Nama Kloter (Batch):</label>
          <input
            type="text"
            className="form-input"
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
          <div className="relative flex items-center">
            <span className="absolute left-3 text-xs font-bold text-slate-400 select-none pointer-events-none">Rp</span>
            <input
              type="text"
              inputMode="numeric"
              className="form-input form-input-prefix font-bold tracking-wide"
              value={hargaDisplayText}
              onChange={handleHargaChange}
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Catatan Awal Bibit & Supplier:</label>
          <textarea
            className="form-textarea"
            value={catatanAwal}
            onChange={(e) => setCatatanAwal(e.target.value)}
            required
          />
        </div>
      </div>
      <div className="modal-footer">
        <button type="button" className="btn btn-secondary btn-sm" onClick={onClose}>Batal</button>
        <button type="submit" className="btn btn-primary btn-sm"><CheckCircle2 size={16} /> Simpan Perubahan</button>
      </div>
    </form>
  );
}
