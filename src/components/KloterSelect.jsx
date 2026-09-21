import React, { useState, useEffect, useRef } from 'react';
import { Search, ChevronDown, Check, X, Layers, Filter } from 'lucide-react';

export function KloterSelect({
  kloters = [],
  selectedKloterId = 'semua',
  onSelectKloter,
  includeSemua = true,
  placeholder = 'Pilih atau Cari Kloter...',
  className = '',
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('semua');
  const dropdownRef = useRef(null);

  // Close when clicking outside
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    window.addEventListener('click', handleOutsideClick);
    return () => window.removeEventListener('click', handleOutsideClick);
  }, []);

  // Find currently selected kloter object
  const selectedKloter = kloters.find((k) => k.id === selectedKloterId);

  // Filter kloters based on search query & status filter
  const filteredKloters = kloters.filter((k) => {
    const matchStatus = statusFilter === 'semua' || k.status.toLowerCase() === statusFilter;
    const matchQuery =
      k.namaKloter.toLowerCase().includes(searchQuery.toLowerCase()) ||
      k.kandang.toLowerCase().includes(searchQuery.toLowerCase()) ||
      k.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchStatus && matchQuery;
  });

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Aktif':
        return 'bg-sky-100 text-sky-800 border-sky-200';
      case 'Panen':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Penjualan':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    }
  };

  return (
    <div className={`relative block text-left ${className}`} ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className="w-full px-3.5 py-2.5 bg-sky-50/90 hover:bg-sky-100 text-slate-800 rounded-xl border border-sky-200 text-xs font-bold transition flex items-center justify-between gap-2 cursor-pointer shadow-2xs"
      >
        <div className="flex items-center gap-2 truncate">
          <Layers size={15} className="text-sky-600 shrink-0" />
          <span className="truncate">
            {selectedKloterId === 'semua'
              ? `Semua Kloter (${kloters.length} Kloter)`
              : selectedKloter
              ? `${selectedKloter.namaKloter} (${selectedKloter.status})`
              : placeholder}
          </span>
        </div>
        <ChevronDown size={14} className="text-sky-600 shrink-0" />
      </button>

      {/* Floating Searchable Panel */}
      {isOpen && (
        <div
          className="absolute left-0 mt-1.5 w-full min-w-[280px] sm:min-w-[320px] bg-white rounded-2xl shadow-2xl border border-slate-200 p-3 z-50 text-xs space-y-2.5 animate-in fade-in zoom-in-95 duration-150"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Search Field */}
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              autoFocus
              className="w-full pl-9 pr-8 py-2 bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 font-medium text-xs"
              placeholder="Cari dari 1.000+ kloter..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Filter Status Pills */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 text-[10px]">
            {['semua', 'aktif', 'panen', 'penjualan', 'selesai'].map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                className={`px-2.5 py-1 rounded-lg font-extrabold capitalize shrink-0 transition ${
                  statusFilter === st
                    ? 'bg-sky-600 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          {/* Results Info */}
          <div className="flex items-center justify-between px-1 text-[10px] text-slate-400 font-bold border-b pb-1">
            <span>HASIL PENCARIAN ({filteredKloters.length})</span>
            <span>Maks tinggi panel 260px</span>
          </div>

          {/* Scrollable List Container (Fixed Height so it never overflows screen!) */}
          <div className="max-h-60 overflow-y-auto space-y-1 pr-1 scrollbar-thin">
            {includeSemua && statusFilter === 'semua' && !searchQuery && (
              <button
                type="button"
                onClick={() => {
                  onSelectKloter('semua');
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition text-left cursor-pointer ${
                  selectedKloterId === 'semua'
                    ? 'bg-sky-50 text-sky-900 font-extrabold border border-sky-200'
                    : 'hover:bg-slate-50 text-slate-700 font-medium'
                }`}
              >
                <span>📊 Semua Kloter ({kloters.length} Kloter)</span>
                {selectedKloterId === 'semua' && <Check size={14} className="text-sky-600" />}
              </button>
            )}

            {filteredKloters.map((k) => {
              const isSelected = k.id === selectedKloterId;
              return (
                <button
                  key={k.id}
                  type="button"
                  onClick={() => {
                    onSelectKloter(k.id);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between p-2.5 rounded-xl transition text-left cursor-pointer border ${
                    isSelected
                      ? 'bg-sky-50 border-sky-300 text-sky-950 font-extrabold'
                      : 'bg-white border-transparent hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="min-w-0 pr-2">
                    <div className="font-bold text-xs text-slate-900 truncate">{k.namaKloter}</div>
                    <div className="text-[10px] text-slate-400 font-mono truncate">
                      {k.id} &bull; {k.kandang}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold border ${getStatusBadgeClass(k.status)}`}>
                      {k.status}
                    </span>
                    {isSelected && <Check size={14} className="text-sky-600" />}
                  </div>
                </button>
              );
            })}

            {filteredKloters.length === 0 && (
              <div className="py-6 text-center text-slate-400 text-xs">
                Tidak ditemukan kloter cocok dengan &quot;{searchQuery}&quot;.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
