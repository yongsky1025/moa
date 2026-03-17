import { pageUi } from '../pages/pageUi';

interface PaginationControlsProps {
  page: number;
  totalPages: number;
  onChangePage: (page: number) => void;
}

const PAGE_WINDOW = 5;

export default function PaginationControls({
  page,
  totalPages,
  onChangePage,
}: PaginationControlsProps) {
  if (totalPages <= 1) {
    return null;
  }

  const start = Math.max(1, page - Math.floor(PAGE_WINDOW / 2));
  const end = Math.min(totalPages, start + PAGE_WINDOW - 1);
  const pages: number[] = [];
  for (let p = start; p <= end; p += 1) {
    pages.push(p);
  }

  return (
    <nav style={pageUi.paginationWrap}>
      <button
        type="button"
        disabled={page <= 1}
        onClick={() => onChangePage(page - 1)}
        style={
          page <= 1 ? pageUi.paginationButtonDisabled : pageUi.paginationButton
        }
      >
        이전
      </button>
      {pages.map((p) => (
        <button
          key={p}
          type="button"
          onClick={() => onChangePage(p)}
          style={p === page ? pageUi.paginationButtonActive : pageUi.paginationButton}
        >
          {p}
        </button>
      ))}
      <button
        type="button"
        disabled={page >= totalPages}
        onClick={() => onChangePage(page + 1)}
        style={
          page >= totalPages ? pageUi.paginationButtonDisabled : pageUi.paginationButton
        }
      >
        다음
      </button>
      <span style={pageUi.paginationInfo}>
        {page} / {totalPages}
      </span>
    </nav>
  );
}
