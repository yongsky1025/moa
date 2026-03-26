import { useEffect, useRef } from 'react';

/**
 * IntersectionObserver 기반 무한 스크롤 훅.
 * sentinel 요소가 뷰포트에 들어오면 onLoadMore를 호출합니다.
 *
 * @param onLoadMore  다음 페이지를 불러오는 콜백
 * @param enabled     true일 때만 감시 (hasMore && !loading 등으로 제어)
 * @param rootMargin  뷰포트 여유값 (기본 200px — 바닥 200px 전에 트리거)
 * @returns           sentinel div에 붙일 ref
 */
export function useInfiniteScroll(
  onLoadMore: () => void,
  enabled: boolean,
  rootMargin = '200px',
) {
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!enabled) return;
    const el = sentinelRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) onLoadMore();
      },
      { rootMargin },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [onLoadMore, enabled, rootMargin]);

  return sentinelRef;
}
