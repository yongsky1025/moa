import { useState, useEffect, useCallback } from "react";

/**
 * 화면 높이 기반으로 테이블에 표시할 row 수를 계산하는 훅.
 * 스크롤 없이 페이지에 맞는 개수만 표시하기 위해 사용.
 *
 * @param rowHeight   테이블 한 행의 높이 (px, 기본 48)
 * @param offsetHeight 헤더+필터+테이블헤더+페이지네이션+여백 등 고정 영역 높이 (px, 기본 340)
 * @param minRows     최소 행 수 (기본 5)
 * @param maxRows     최대 행 수 (기본 30)
 */
export function usePageSize(
  rowHeight = 48,
  offsetHeight = 340,
  minRows = 5,
  maxRows = 30,
): number {
  const calculate = useCallback(() => {
    const available = window.innerHeight - offsetHeight;
    const rows = Math.floor(available / rowHeight);
    return Math.max(minRows, Math.min(maxRows, rows));
  }, [rowHeight, offsetHeight, minRows, maxRows]);

  const [pageSize, setPageSize] = useState(calculate);

  useEffect(() => {
    const handleResize = () => setPageSize(calculate());
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [calculate]);

  return pageSize;
}
