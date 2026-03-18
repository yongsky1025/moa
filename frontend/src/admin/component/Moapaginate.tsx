// components/MoaPaginate.tsx
// react-paginate 기반 moa 스타일 공용 페이지네이션
// 유저/모임/게시글/신고 등 어디서나 재사용 가능

import ReactPaginate from 'react-paginate';

interface Props {
  // ★ actualTotalPage 를 pageCount로 받음 (백엔드 totalPage 아님)
  pageCount:    number;
  // ★ 1-based current → forcePage = currentPage - 1 (0-based 변환 내부 처리)
  currentPage:  number;
  onPageChange: (e: { selected: number }) => void;
}

export default function MoaPaginate({ pageCount, currentPage, onPageChange }: Props) {
  if (pageCount <= 1) return null;

  return (
    <ReactPaginate
      // ★ 전체 페이지 수
      pageCount={pageCount}

      // ★ 현재 페이지: 1-based → 0-based 변환
      forcePage={currentPage - 1}

      // ★ 클릭 핸들러: 0-based selected 전달 → Context에서 +1 해서 1-based로 변환
      onPageChange={onPageChange}

      // 페이지 번호 표시 범위
      pageRangeDisplayed={5}
      marginPagesDisplayed={1}

      // 이전/다음 버튼
      previousLabel={
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
        </svg>
      }
      nextLabel={
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
        </svg>
      }
      breakLabel="···"

      // ── Tailwind 클래스 ──────────────────────────────────────────────────────
      containerClassName="flex items-center gap-1"

      // 일반 페이지 번호
      pageClassName="block"
      pageLinkClassName="flex cursor-pointer items-center justify-center w-9 h-9 rounded-xl text-sm font-medium text-moa-secondary hover:bg-moa-light hover:text-moa-primary transition-colors"

      // 현재 페이지 (active)
      activeClassName="!block"
      activeLinkClassName="!bg-moa-primary !text-white shadow-sm hover:!bg-moa-hover cursor-pointer"

      // 이전 버튼
      previousClassName="block"
      previousLinkClassName="flex cursor-pointer items-center justify-center w-9 h-9 rounded-xl text-moa-secondary hover:bg-moa-light hover:text-moa-primary transition-colors"

      // 다음 버튼
      nextClassName="block"
      nextLinkClassName="flex cursor-pointer items-center justify-center w-9 h-9 rounded-xl text-moa-secondary hover:bg-moa-light hover:text-moa-primary transition-colors"

      // 비활성화 (첫/마지막 페이지)
      disabledClassName="opacity-30 pointer-events-none"

      // break (···)
      breakClassName="block"
      breakLinkClassName="flex items-center justify-center w-9 h-9 text-moa-subtle"
    />
  );
}