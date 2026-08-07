import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PaginationProps {
  page: number;
  totalPages: number;
  total: number;
  limit: number;
  onPageChange: (page: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({ page, totalPages, total, limit, onPageChange }) => {
  if (totalPages <= 1) return null;

  const start = (page - 1) * limit + 1;
  const end   = Math.min(page * limit, total);

  const pages: number[] = [];
  if (totalPages <= 5) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else if (page <= 3) {
    pages.push(1, 2, 3, 4, 5);
  } else if (page >= totalPages - 2) {
    for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i);
  } else {
    for (let i = page - 2; i <= page + 2; i++) pages.push(i);
  }

  const btnBase = 'flex h-8 min-w-[32px] items-center justify-center rounded-md text-sm transition-colors duration-150';

  return (
    <div
      className="flex items-center justify-between px-4 py-3"
      style={{ borderTop: '1px solid var(--border)' }}
    >
      <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
        Menampilkan{' '}
        <span className="font-medium" style={{ color: 'var(--text-body)' }}>{start}–{end}</span>
        {' '}dari{' '}
        <span className="font-medium" style={{ color: 'var(--text-body)' }}>{total}</span>
      </p>

      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className={cn(btnBase, 'px-1.5 hover:bg-slate-100 dark:hover:bg-[var(--bg-secondary)] disabled:cursor-not-allowed disabled:opacity-40')}
          style={{ color: 'var(--text-secondary)' }}
          aria-label="Halaman sebelumnya"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        {pages.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => onPageChange(p)}
            className={cn(
              btnBase,
              'px-2.5',
              page === p
                ? 'bg-primary-600 text-white font-medium'
                : 'hover:bg-slate-100 dark:hover:bg-[var(--bg-secondary)]',
            )}
            style={page !== p ? { color: 'var(--text-body)' } : undefined}
            aria-current={page === p ? 'page' : undefined}
          >
            {p}
          </button>
        ))}

        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className={cn(btnBase, 'px-1.5 hover:bg-slate-100 dark:hover:bg-[var(--bg-secondary)] disabled:cursor-not-allowed disabled:opacity-40')}
          style={{ color: 'var(--text-secondary)' }}
          aria-label="Halaman berikutnya"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};
