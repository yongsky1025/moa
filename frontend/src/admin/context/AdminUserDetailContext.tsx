import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { PageRequestDTO, PageResultDTO, UserInfoCircleDTO, UserInfoDTO, UserInfoPostDTO, UserInfoReplyDTO } from '../types/adminTypes';
import { fetchAdminUserCircles, fetchAdminUserPosts, fetchAdminUserProfile, fetchAdminUserReplies } from '../api/adminUserApi';

export type UserHistoryKind = 'post' | 'reply' | 'circle';

interface HistoryState {
  open: boolean;
  kind: UserHistoryKind;
  page: number; // 1-based
  size: number;
}

interface AdminUserDetailContextValue {
  userId: number;
  profile: UserInfoDTO | null;
  loadingProfile: boolean;
  profileError: string | null;
  refreshProfile: () => void;

  history: HistoryState;
  openHistory: (kind: UserHistoryKind) => void;
  closeHistory: () => void;
  setHistoryPage: (selected: number) => void; // 0-based selected

  historyLoading: boolean;
  historyError: string | null;
  postHistory: PageResultDTO<UserInfoPostDTO> | null;
  replyHistory: PageResultDTO<UserInfoReplyDTO> | null;
  circleHistory: PageResultDTO<UserInfoCircleDTO> | null;
}

const AdminUserDetailContext = createContext<AdminUserDetailContextValue | null>(null);

export function AdminUserDetailProvider({ userId, children }: { userId: number; children: ReactNode }) {
  const [profile, setProfile] = useState<UserInfoDTO | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileReloadToken, setProfileReloadToken] = useState(0);

  const [history, setHistory] = useState<HistoryState>({
    open: false,
    kind: 'post',
    page: 1,
    size: 10,
  });
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const [postHistory, setPostHistory] = useState<PageResultDTO<UserInfoPostDTO> | null>(null);
  const [replyHistory, setReplyHistory] = useState<PageResultDTO<UserInfoReplyDTO> | null>(null);
  const [circleHistory, setCircleHistory] = useState<PageResultDTO<UserInfoCircleDTO> | null>(null);

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
    return () => {
      alive = false;
    };
  }, [userId, profileReloadToken]);

  const refreshProfile = useCallback(() => setProfileReloadToken((x) => x + 1), []);

  useEffect(() => {
    if (!history.open) return;

    let alive = true;
    (async () => {
      setHistoryLoading(true);
      setHistoryError(null);

      const dto: PageRequestDTO = { page: history.page, size: history.size };
      try {
        if (history.kind === 'post') {
          const data = (await fetchAdminUserPosts(userId, dto)) as PageResultDTO<UserInfoPostDTO>;
          if (!alive) return;
          setPostHistory(data);
        } else if (history.kind === 'reply') {
          const data = (await fetchAdminUserReplies(userId, dto)) as PageResultDTO<UserInfoReplyDTO>;
          if (!alive) return;
          setReplyHistory(data);
        } else {
          const data = (await fetchAdminUserCircles(userId, dto)) as PageResultDTO<UserInfoCircleDTO>;
          if (!alive) return;
          setCircleHistory(data);
        }
      } catch (e: any) {
        if (!alive) return;
        setHistoryError(e?.response?.data?.message ?? '이력을 불러오지 못했습니다.');
      } finally {
        if (alive) setHistoryLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [history.open, history.kind, history.page, history.size, userId]);

  const openHistory = useCallback((kind: UserHistoryKind) => {
    setHistory((prev) => ({ ...prev, open: true, kind, page: 1 }));
  }, []);
  const closeHistory = useCallback(() => {
    setHistory((prev) => ({ ...prev, open: false }));
    setHistoryError(null);
  }, []);
  const setHistoryPage = useCallback((selected: number) => {
    setHistory((prev) => ({ ...prev, page: selected + 1 }));
  }, []);

  const value = useMemo<AdminUserDetailContextValue>(
    () => ({
      userId,
      profile,
      loadingProfile,
      profileError,
      refreshProfile,

      history,
      openHistory,
      closeHistory,
      setHistoryPage,

      historyLoading,
      historyError,
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
      history,
      openHistory,
      closeHistory,
      setHistoryPage,
      historyLoading,
      historyError,
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

