import { ChevronRight, ChevronLeft } from "lucide-react";

interface EventsPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function EventsPagination({
  currentPage,
  totalPages,
  onPageChange,
}: EventsPaginationProps) {
  if (totalPages <= 1) return null;

  // Build page number array with ellipsis logic
  function getPages(): (number | "…")[] {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const pages: (number | "…")[] = [1];
    if (currentPage > 3) pages.push("…");
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
      pages.push(i);
    }
    if (currentPage < totalPages - 2) pages.push("…");
    pages.push(totalPages);
    return pages;
  }

  return (
    <div className="flex justify-center mt-12">
      <nav className="flex items-center gap-2">
        {/* Prev */}
        <button
          type="button"
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="flex justify-center items-center bg-white/15 hover:bg-white/25 border border-white/20 disabled:opacity-30 disabled:cursor-not-allowed rounded-full w-10 h-10 text-white transition-colors cursor-pointer"
        >
          <ChevronRight size={18} />
        </button>

        {/* Page numbers */}
        {getPages().map((n, i) =>
          n === "…" ? (
            <span key={`ellipsis-${i}`} className="text-white/40 w-8 text-center text-[18px]">…</span>
          ) : (
            <button
              key={n}
              type="button"
              onClick={() => onPageChange(n)}
              className={`flex justify-center items-center rounded-full w-10 h-10 text-[17px] font-bold transition-all cursor-pointer border ${
                n === currentPage
                  ? "bg-glace-yellow text-[#1e6a7f] border-glace-yellow shadow-[0_4px_14px_rgba(244,228,81,0.4)] scale-110"
                  : "bg-white/10 text-white border-white/15 hover:bg-white/20 hover:border-white/30"
              }`}
            >
              {n}
            </button>
          )
        )}

        {/* Next */}
        <button
          type="button"
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className="flex justify-center items-center bg-white/15 hover:bg-white/25 border border-white/20 disabled:opacity-30 disabled:cursor-not-allowed rounded-full w-10 h-10 text-white transition-colors cursor-pointer"
        >
          <ChevronLeft size={18} />
        </button>
      </nav>
    </div>
  );
}
