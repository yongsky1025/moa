import ReactPaginate from 'react-paginate';

interface Props {
  pageCount: number;
  currentPage: number; // 1-based (백엔드 current 그대로)
  onPageChange: (e: { selected: number }) => void;
}

/**
 * ReactPaginate moa 스타일 래퍼
 * forcePage = currentPage - 1  (백엔드 1-based → ReactPaginate 0-based)
 * onPageChange 변환은 Context 훅 내부에서 처리
 */
export default function MoaPaginate({
  pageCount,
  currentPage,
  onPageChange,
}: Props) {
  if (pageCount <= 1) return null;

  return (
    <ReactPaginate
      pageCount={pageCount}
      forcePage={currentPage - 1}
      onPageChange={onPageChange}
      pageRangeDisplayed={5}
      marginPagesDisplayed={1}
      previousLabel={
        <svg
          className="h-4 w-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2.5}
            d="M15 19l-7-7 7-7"
          />
        </svg>
      }
      nextLabel={
        <svg
          className="h-4 w-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2.5}
            d="M9 5l7 7-7 7"
          />
        </svg>
      }
      breakLabel="···"
      containerClassName="flex items-center gap-1"
      pageClassName="block"
      pageLinkClassName="flex items-center justify-center w-9 h-9 rounded-xl text-sm font-medium text-moa-secondary hover:bg-moa-light hover:text-moa-primary transition-colors"
      activeClassName="!block"
      activeLinkClassName="!bg-moa-primary !text-white shadow-sm hover:!bg-moa-hover"
      previousClassName="block"
      previousLinkClassName="flex items-center justify-center w-9 h-9 rounded-xl text-moa-secondary hover:bg-moa-light hover:text-moa-primary transition-colors"
      nextClassName="block"
      nextLinkClassName="flex items-center justify-center w-9 h-9 rounded-xl text-moa-secondary hover:bg-moa-light hover:text-moa-primary transition-colors"
      disabledClassName="opacity-30 pointer-events-none"
      breakClassName="block"
      breakLinkClassName="flex items-center justify-center w-9 h-9 text-moa-subtle"
    />
  );
}
