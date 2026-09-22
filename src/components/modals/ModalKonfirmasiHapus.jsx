import React from 'react';
import { AlertTriangle, Trash2 } from 'lucide-react';

export function ModalKonfirmasiHapus({
  title = 'Konfirmasi Hapus Data',
  message = 'Apakah Anda yakin ingin menghapus data ini?',
  submessage = 'Tindakan ini tidak dapat dibatalkan dan akan memperbarui kalkulasi otomatis.',
  confirmText = 'Ya, Hapus Data',
  onClose,
  onConfirm,
}) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content max-w-md bg-white rounded-2xl shadow-2xl border border-red-100 overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-red-50 border border-red-100 text-red-600 mx-auto flex items-center justify-center shadow-xs">
            <AlertTriangle size={28} />
          </div>

          <div className="space-y-1.5">
            <h3 className="text-lg font-extrabold text-slate-900 tracking-tight">
              {title}
            </h3>
            <p className="text-xs text-slate-600 font-medium leading-relaxed">
              {message}
            </p>
            {submessage && (
              <p className="text-[11px] font-bold text-red-600 pt-1">
                {submessage}
              </p>
            )}
          </div>

          <div className="flex items-center gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              className="flex-1 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition cursor-pointer"
              onClick={onClose}
            >
              Batal
            </button>
            <button
              type="button"
              className="flex-1 py-2.5 px-4 bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-1.5 cursor-pointer"
              onClick={() => {
                if (onConfirm) onConfirm();
                onClose();
              }}
            >
              <Trash2 size={15} />
              <span>{confirmText}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
