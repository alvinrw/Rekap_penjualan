import React from 'react';
import { ModalTambahKloter } from './ModalTambahKloter';
import { ModalEditKloter } from './ModalEditKloter';
import { ModalInputPengeluaran } from './ModalInputPengeluaran';
import { ModalInputKematian } from './ModalInputKematian';
import { ModalInputPanen } from './ModalInputPanen';
import { ModalInputPenjualan } from './ModalInputPenjualan';

export function ModalManager({
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
  onSubmitEditKloter,
}) {
  if (!activeModal) return null;

  const activeKlotersOnly = kloters.filter((k) => k.status !== 'Selesai');
  const targetKloter = kloters.find((k) => k.id === selectedKloterId) || activeKlotersOnly[0] || kloters[0];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {activeModal === 'tambah_kloter' && (
          <ModalTambahKloter onClose={onClose} onSubmit={onSubmitTambahKloter} />
        )}

        {activeModal === 'edit_kloter' && (
          <ModalEditKloter kloter={targetKloter} onClose={onClose} onSubmit={onSubmitEditKloter} />
        )}

        {activeModal === 'input_pengeluaran' && (
          <ModalInputPengeluaran
            kloters={activeKlotersOnly}
            targetKloterId={targetKloter?.id}
            activeHargaPerOns={activeHargaPerOns}
            onClose={onClose}
            onSubmit={onSubmitPengeluaran}
          />
        )}

        {activeModal === 'input_kematian' && (
          <ModalInputKematian
            kloters={activeKlotersOnly}
            targetKloterId={targetKloter?.id}
            activeHargaPerOns={activeHargaPerOns}
            onClose={onClose}
            onSubmit={onSubmitKematian}
          />
        )}

        {activeModal === 'input_panen' && (
          <ModalInputPanen
            kloters={activeKlotersOnly}
            targetKloterId={targetKloter?.id}
            activeHargaPerOns={activeHargaPerOns}
            onClose={onClose}
            onSubmit={onSubmitPanen}
          />
        )}

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
