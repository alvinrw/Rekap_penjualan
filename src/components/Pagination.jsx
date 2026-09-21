import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export function Pagination({
  currentPage = 1,
  totalItems = 0,
  pageSize = 15,
  onPageChange,
}) {
  const totalPages = Math.ceil(totalItems / pageSize) || 1;

  if (totalItems === 0) return null;

  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  // Generate array of page numbers to show
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      let start = Math.max(1, currentPage - 2);
      let end = Math.min(totalPages, start + maxVisible - 1);

      if (end - start < maxVisible - 1) {
        start = Math.max(1, end - maxVisible + 1);
      }

      for (let i = start; i <= end; i++) pages.push(i);
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 bg-white border-t border-slate-100 rounded-b-2xl text-xs">
      {/* Information text */}
      <div className="text-slate-500 font-medium text-[11px] sm:text-xs text-center sm:text-left">
        Menampilkan <span className="font-extrabold text-slate-800">{startItem}</span> -{' '}
        <span className="font-extrabold text-slate-800">{endItem}</span> dari{' '}
        <span className="font-extrabold text-sky-800">{totalItems}</span> data
      </div>

      {/* Page Navigation Controls */}
      {totalPages > 1 && (
        <div className="flex items-center gap-1">
          {/* Previous Button */}
          <button
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className={`p-1.5 rounded-lg border text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
              currentPage === 1
                ? 'border-slate-200 text-slate-300 bg-slate-50 cursor-not-allowed'
                : 'border-slate-200 text-slate-700 bg-white hover:bg-sky-50 hover:text-sky-700 hover:border-sky-200'
            }`}
            title="Halaman Sebelumnya"
          >
            <ChevronLeft size={16} />
            <span className="hidden sm:inline">Prev</span>
          </button>

          {/* Page Numbers */}
          <div className="flex items-center gap-1">
            {pageNumbers[0] > 1 && (
              <>
                <button
                  onClick={() => onPageChange(1)}
                  className="w-7 h-7 rounded-lg text-xs font-bold text-slate-700 hover:bg-sky-50 hover:text-sky-700 transition cursor-pointer"
                >
                  1
                </button>
                {pageNumbers[0] > 2 && <span className="text-slate-400 px-1">...</span>}
              </>
            )}

            {pageNumbers.map((page) => (
              <button
                key={page}
                onClick={() => onPageChange(page)}
                className={`w-7 h-7 rounded-lg text-xs font-extrabold transition cursor-pointer ${
                  currentPage === page
                    ? 'bg-sky-600 text-white shadow-xs'
                    : 'text-slate-700 bg-white hover:bg-sky-50 hover:text-sky-700'
                }`}
              >
                {page}
              </button>
            ))}

            {pageNumbers[pageNumbers.length - 1] < totalPages && (
              <>
                {pageNumbers[pageNumbers.length - 1] < totalPages - 1 && (
                  <span className="text-slate-400 px-1">...</span>
                )}
                <button
                  onClick={() => onPageChange(totalPages)}
                  className="w-7 h-7 rounded-lg text-xs font-bold text-slate-700 hover:bg-sky-50 hover:text-sky-700 transition cursor-pointer"
                >
                  {totalPages}
                </button>
              </>
            )}
          </div>

          {/* Next Button */}
          <button
            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className={`p-1.5 rounded-lg border text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
              currentPage === totalPages
                ? 'border-slate-200 text-slate-300 bg-slate-50 cursor-not-allowed'
                : 'border-slate-200 text-slate-700 bg-white hover:bg-sky-50 hover:text-sky-700 hover:border-sky-200'
            }`}
            title="Halaman Selanjutnya"
          >
            <span className="hidden sm:inline">Next</span>
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
