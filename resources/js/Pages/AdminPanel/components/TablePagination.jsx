import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function TablePagination({
    totalItems,
    currentPage,
    pageSize = 10,
    onPageChange,
}) {
    if (!totalItems) return null;

    const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
    const safeCurrentPage = Math.min(Math.max(Number(currentPage) || 1, 1), totalPages);
    const pageStartIndex = ((safeCurrentPage - 1) * pageSize) + 1;
    const pageEndIndex = Math.min(safeCurrentPage * pageSize, totalItems);
    const visiblePageNumbers = (() => {
        if (totalPages <= 5) {
            return Array.from({ length: totalPages }, (_, index) => index + 1);
        }

        const startPage = Math.max(1, Math.min(safeCurrentPage - 2, totalPages - 4));
        return Array.from({ length: 5 }, (_, index) => startPage + index);
    })();

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <p className="text-sm text-slate-500">
                Menampilkan <span className="font-semibold text-slate-700">{pageStartIndex}</span>
                {' - '}
                <span className="font-semibold text-slate-700">{pageEndIndex}</span>
                {' '}dari <span className="font-semibold text-slate-700">{totalItems}</span>.
            </p>
            <div className="flex flex-wrap items-center gap-2">
                <button
                    type="button"
                    onClick={() => onPageChange(Math.max(1, safeCurrentPage - 1))}
                    disabled={safeCurrentPage <= 1}
                    className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    <ChevronLeft size={14} /> Sebelumnya
                </button>
                {visiblePageNumbers.map((pageNumber) => (
                    <button
                        key={pageNumber}
                        type="button"
                        onClick={() => onPageChange(pageNumber)}
                        className={`h-9 min-w-9 rounded-lg border px-3 text-sm font-bold transition-colors ${
                            pageNumber === safeCurrentPage
                                ? 'border-[#C1986E] bg-[#C1986E] text-white'
                                : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                        }`}
                    >
                        {pageNumber}
                    </button>
                ))}
                <button
                    type="button"
                    onClick={() => onPageChange(Math.min(totalPages, safeCurrentPage + 1))}
                    disabled={safeCurrentPage >= totalPages}
                    className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    Berikutnya <ChevronRight size={14} />
                </button>
            </div>
        </div>
    );
}
