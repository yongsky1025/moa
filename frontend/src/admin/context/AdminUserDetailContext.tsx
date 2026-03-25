import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import type {
  PageRequestDTO,
  PageResultDTO,
  SanctionResponseDTO,
  UserInfoCircleDTO,
  UserInfoDTO,
  UserInfoPostDTO,
  UserInfoReplyDTO,
} from '../types/adminTypes';
import { fetchAdminUserCircles, fetchAdminUserPosts, fetchAdminUserProfile, fetchAdminUserReplies } from '../api/adminUserApi';
import { fetchUserSanctionHistory } from '../api/adminReportAndSanctionApi';

export type UserHistoryKind = 'post' | 'reply' | 'circle';

interface HistoryState {
  open: boolean;
  kind: UserHistoryKind;
}

interface AdminUserDetailContextValue {
  userId: number;
  profile: UserInfoDTO | null;
  loadingProfile: boolean;
  profileError: string | null;
  refreshProfile: () => void;

  sanctionHistory: SanctionResponseDTO[];
  loadingSanctionHistory: boolean;
  sanctionHistoryError: string | null;

  history: HistoryState;
  openHistory: (kind: UserHistoryKind) => void;
  closeHistory: () => void;
  loadMoreHistory: () => void;

  historyLoading: boolean;
  historyError: string | null;
  historyItems: unknown[];
  historyHasMore: boolean;
  historyTotalCount: number;
  postHistory: PageResultDTO<UserInfoPostDTO> | null;
  replyHistory: PageResultDTO<UserInfoReplyDTO> | null;
  circleHistory: PageResultDTO<UserInfoCircleDTO> | null;
}

const HISTORY_PAGE_SIZE = 10;

const AdminUserDetailContext = createContext<AdminUserDetailContextValue | null>(null);

export function AdminUserDetailProvider({ userId, children }: { userId: number; children: ReactNode }) {
  const [profile, setProfile] = useState<UserInfoDTO | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileReloadToken, setProfileReloadToken] = useState(0);

  const [sanctionHistory, setSanctionHistory] = useState<SanctionResponseDTO[]>([]);
  const [loadingSanctionHistory, setLoadingSanctionHistory] = useState(false);
  const [sanctionHistoryError, setSanctionHistoryError] = useState<string | null>(null);

  const [history, setHistory] = useState<HistoryState>({ open: false, kind: 'post' });
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const [postHistory, setPostHistory] = useState<PageResultDTO<UserInfoPostDTO> | null>(null);
  const [replyHistory, setReplyHistory] = useState<PageResultDTO<UserInfoReplyDTO> | null>(null);
  const [circleHistory, setCircleHistory] = useState<PageResultDTO<UserInfoCircleDTO> | null>(null);

  // 무한스크롤용 누적 리스트
  const [historyItems, setHistoryItems] = useState<unknown[]>([]);
  const [historyHasMore, setHistoryHasMore] = useState(false);
  const [historyTotalCount, setHistoryTotalCount] = useState(0);
  const historyPageRef = useRef(1);

  // ── 프로필 로드 ──
  useEffect(() => {
    let alive = true;
    (async () => {
      setLoadingProfile(true);
      setProfileError(null);
      try {
        const data = (await fetchAdminUserProfile(userId)) as UserInfoDTO;
        if (!alive) return;
        setProfile(data);
      } catch (e: any) {
        if (!alive) return;
        setProfileError(e?.response?.data?.message ?? '유저 프로필을 불러오지 못했습니다.');
      } finally {
        if (alive) setLoadingProfile(false);
      }
    })();
    return () => { alive = false; };
  }, [userId, profileReloadToken]);

  const refreshProfile = useCallback(() => setProfileReloadToken((x) => x + 1), []);

  // ── 제재 이력 로드 (전체 한번) ──
  useEffect(() => {
    let alive = true;
    (async () => {
      setLoadingSanctionHistory(true);
      setSanctionHistoryError(null);
      try {
        const data = (await fetchUserSanctionHistory(userId)) as SanctionResponseDTO[];
        if (!alive) return;
        setSanctionHistory(Array.isArray(data) ? data : []);
      } catch (e: any) {
        if (!alive) return;
        setSanctionHistoryError(e?.response?.data?.message ?? '제재 이력을 불러오지 못했습니다.');
        setSanctionHistory([]);
      } finally {
        if (alive) setLoadingSanctionHistory(false);
      }
    })();
    return () => { alive = false; };
  }, [userId]);

  // ── 히스토리 페이지 로드 (무한스크롤) ──
  const loadHistoryPage = useCallback(async (kind: UserHistoryKind, page: number, append: boolean) => {
    setHistoryLoading(true);
    setHistoryError(null);

    const dto: PageRequestDTO = { page, size: HISTORY_PAGE_SIZE };
    try {
      let result: PageResultDTO<unknown>;
      if (kind === 'post') {
        const data = (await fetchAdminUserPosts(userId, dto)) as PageResultDTO<UserInfoPostDTO>;
        setPostHistory(data);
        result = data as PageResultDTO<unknown>;
      } else if (kind === 'reply') {
        const data = (await fetchAdminUserReplies(userId, dto)) as PageResultDTO<UserInfoReplyDTO>;
        setReplyHistory(data);
        result = data as PageResultDTO<unknown>;
      } else {
        const data = (await fetchAdminUserCircles(userId, dto)) as PageResultDTO<UserInfoCircleDTO>;
        setCircleHistory(data);
        result = data as PageResultDTO<unknown>;
      }

      const newItems = result.dtoList ?? [];
      setHistoryItems((prev) => append ? [...prev, ...newItems] : newItems);
      setHistoryTotalCount(result.totalCount ?? 0);

      const totalPages = Math.ceil((result.totalCount ?? 0) / HISTORY_PAGE_SIZE);
      setHistoryHasMore(page < totalPages);
    } catch (e: any) {
      setHistoryError(e?.response?.data?.message ?? '이력을 불러오지 못했습니다.');
    } finally {
      setHistoryLoading(false);
    }
  }, [userId]);

  // history.open / history.kind 변경 시 첫 페이지 로드
  useEffect(() => {
    if (!history.open) return;
    historyPageRef.current = 1;
    setHistoryItems([]);
    setHistoryHasMore(false);
    setHistoryTotalCount(0);
    loadHistoryPage(history.kind, 1, false);
  }, [history.open, history.kind, loadHistoryPage]);

  const openHistory = useCallback((kind: UserHistoryKind) => {
    setHistory({ open: true, kind });
  }, []);

  const closeHistory = useCallback(() => {
    setHistory((prev) => ({ ...prev, open: false }));
    setHistoryError(null);
    setHistoryItems([]);
  }, []);

  const loadMoreHistory = useCallback(() => {
    if (historyLoading || !historyHasMore) return;
    const nextPage = historyPageRef.current + 1;
    historyPageRef.current = nextPage;
    loadHistoryPage(history.kind, nextPage, true);
  }, [historyLoading, historyHasMore, history.kind, loadHistoryPage]);

  const value = useMemo<AdminUserDetailContextValue>(
    () => ({
      userId,
      profile,
      loadingProfile,
      profileError,
      refreshProfile,

      sanctionHistory,
      loadingSanctionHistory,
      sanctionHistoryError,

      history,
      openHistory,
      closeHistory,
      loadMoreHistory,

      historyLoading,
      historyError,
      historyItems,
      historyHasMore,
      historyTotalCount,
      postHistory,
      replyHistory,
      circleHistory,
    }),
    [
      userId,
      profile,
      loadingProfile,
      profileError,
      refreshProfile,
      sanctionHistory,
      loadingSanctionHistory,
      sanctionHistoryError,
      history,
      openHistory,
      closeHistory,
      loadMoreHistory,
      historyLoading,
      historyError,
      historyItems,
      historyHasMore,
      historyTotalCount,
      postHistory,
      replyHistory,
      circleHistory,
    ],
  );

  return <AdminUserDetailContext.Provider value={value}>{children}</AdminUserDetailContext.Provider>;
}

export function useAdminUserDetail() {
  return useContext(AdminUserDetailContext)!;
}
