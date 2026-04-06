import { Heart, Settings, Trash2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { circleApi } from "../../api/circleApi";
import { circleBoardApi, type CircleBoardResponse } from "../../api/circleBoardApi";
import { postApi } from "../api/postApi";
import type { CircleResponse } from "../../circle/types/circle";
import CircleDetailBanner from "../../common/components/CircleDetailBanner";
import CircleDetailTabs from "../../common/components/CircleDetailTabs";
import Footer from "../../common/layout/Footer";
import Navbar from "../../common/layout/Navbar";
import "../../board/pages/boardCommunity.css";
import "../styles/postDetail.css";
import BoardPendingPanel from "../../board/components/BoardPendingPanel";
import CommunityProfileCard, {
  type CommunityProfileQuickView,
} from "../../board/components/CommunityProfileCard";
import CircleActivityComposer from "../../common/components/CircleActivityComposer";
import type { CommunityMyReply, PostResponse } from "../types/postTypes";
import { useAuthStore } from "../../store/authStore";
import { getErrorMessage } from "../../common/utils/errorMessage";
import CommunityActivityFeedCard from "../components/CommunityActivityFeedCard";
import PostActionMenu from "../components/PostActionMenu";
import { useInfiniteScroll } from "../../admin/hooks/useInfiniteScroll";
import { openReportForm } from "../../common/utils/openReportForm";

const toDateLabel = (value: string) => {
  const d = new Date(value);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}.${m}.${day}`;
};

const extractImageUrls = (html: string | undefined) => {
  if (!html) return [] as string[];
  const urls: string[] = [];
  const regex = /<img[^>]+src=["']([^"']+)["'][^>]*>/gi;
  let match = regex.exec(html);
  while (match) {
    urls.push(match[1]);
    match = regex.exec(html);
  }
  return urls;
};

const extractPlainText = (html: string | undefined) =>
  (html ?? "")
    .replace(/<\/(p|div|li|h[1-6])>/gi, "\n")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

const avatarColor = (name: string) => {
  const seed = Array.from(name).reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  const palette = ["#5F8F7B", "#3D5F52", "#6B7280", "#E3886D", "#4E7C69"];
  return palette[seed % palette.length];
};

const applyLocalReactionState = (current: { liked: boolean; likeCount: number }) => {
  const nextLiked = !current.liked;
  return {
    liked: nextLiked,
    likeCount: Math.max(0, current.likeCount + (nextLiked ? 1 : -1)),
  };
};

const applyLocalBookmarkState = (current: { bookmarked: boolean }) => ({
  bookmarked: !current.bookmarked,
});

const REACTION_COMMIT_DEBOUNCE_MS = 300;
const ACTIVITY_INITIAL_VISIBLE_COUNT = 10;
const ACTIVITY_LOAD_MORE_COUNT = 10;

const isSamePostItems = (
  prev: Array<{ post: PostResponse; imageUrls: string[] }>,
  next: Array<{ post: PostResponse; imageUrls: string[] }>,
) => {
  if (prev.length !== next.length) return false;
  for (let i = 0; i < prev.length; i += 1) {
    const a = prev[i];
    const b = next[i];
    if (
      a.post.postId !== b.post.postId ||
      a.post.updateDate !== b.post.updateDate ||
      a.post.likeCount !== b.post.likeCount ||
      a.post.replyCount !== b.post.replyCount ||
      a.post.viewCount !== b.post.viewCount
    ) {
      return false;
    }
  }
  return true;
};

const isSameReplyItems = (prev: CommunityMyReply[], next: CommunityMyReply[]) => {
  if (prev.length !== next.length) return false;
  for (let i = 0; i < prev.length; i += 1) {
    const a = prev[i];
    const b = next[i];
    if (
      a.replyId !== b.replyId ||
      a.postId !== b.postId ||
      a.createDate !== b.createDate ||
      a.content !== b.content ||
      a.likeCount !== b.likeCount
    ) {
      return false;
    }
  }
  return true;
};

export default function CircleActivityTabPage() {
  const { circleId } = useParams<{ circleId: string }>();
  const cid = Number(circleId);
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { isLoggedIn, user } = useAuthStore();
  const isAdmin = user?.userRole === "ADMIN";

  const [circle, setCircle] = useState<CircleResponse | null>(null);
  const [boards, setBoards] = useState<CircleBoardResponse[]>([]);
  const [postItems, setPostItems] = useState<Array<{ post: PostResponse; imageUrls: string[] }>>([]);
  const [replyItems, setReplyItems] = useState<CommunityMyReply[]>([]);
  const [selectedView, setSelectedView] = useState<CommunityProfileQuickView>("home");
  const [loading, setLoading] = useState(true);
  const [listLoading, setListLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [isApplyingDeletes, setIsApplyingDeletes] = useState(false);
  const [stagedPostDeletes, setStagedPostDeletes] = useState<Record<number, PostResponse>>({});
  const [reactionByPostId, setReactionByPostId] = useState<
    Record<number, { liked: boolean; likeCount: number; error?: string }>
  >({});
  const [likeAnimatingByPostId, setLikeAnimatingByPostId] = useState<Record<number, boolean>>({});
  const [bookmarkByPostId, setBookmarkByPostId] = useState<
    Record<number, { bookmarked: boolean }>
  >({});
  const [visiblePostCount, setVisiblePostCount] = useState(ACTIVITY_INITIAL_VISIBLE_COUNT);
  const [visibleReplyCount, setVisibleReplyCount] = useState(ACTIVITY_INITIAL_VISIBLE_COUNT);
  const likeAnimationResetRef = useRef<Record<number, ReturnType<typeof setTimeout>>>({});
  const reactionCommitDebounceRef = useRef<Record<number, ReturnType<typeof setTimeout>>>({});
  const bookmarkCommitDebounceRef = useRef<Record<number, ReturnType<typeof setTimeout>>>({});
  const reactionInFlightRef = useRef<Record<number, boolean>>({});
  const bookmarkInFlightRef = useRef<Record<number, boolean>>({});
  const reactionDesiredRef = useRef<Record<number, boolean>>({});
  const bookmarkDesiredRef = useRef<Record<number, boolean>>({});
  const reactionSyncedRef = useRef<Record<number, { liked: boolean; likeCount: number }>>({});
  const bookmarkSyncedRef = useRef<Record<number, boolean>>({});

  const loadActivityPage = useCallback(async () => {
    if (!circleId || Number.isNaN(cid)) {
      navigate("/circle", { replace: true });
      return;
    }

    setLoading(true);
    setErrorMessage("");
    try {
      const [circleRes, boardRes] = await Promise.all([
        circleApi.getCircle(cid),
        circleBoardApi.getBoards(cid),
      ]);
      setCircle(circleRes.data);
      setBoards(boardRes.data);
    } catch (e) {
      setErrorMessage(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }, [cid, circleId, navigate]);

  const activityBoard = useMemo(
    () => boards.find((board) => board.circleBoardKind === "ACTIVITY") ?? null,
    [boards],
  );
  const activityBoardId = activityBoard?.boardId ?? null;
  const defaultWritableBoardId = useMemo(
    () => boards.find((board) => board.circleBoardKind !== "ACTIVITY")?.boardId ?? null,
    [boards],
  );
  const isCircleLeader = circle?.myRole === "LEADER";
  const canManageActivityEdit = isCircleLeader || isAdmin;

  useEffect(() => {
    void loadActivityPage();
  }, [loadActivityPage]);

  useEffect(() => {
    const viewParam = searchParams.get("view");
    if (viewParam === "myPosts" || viewParam === "myReplies" || viewParam === "scrap") {
      setSelectedView(viewParam);
      return;
    }
    setSelectedView("home");
  }, [searchParams]);

  const refreshCurrentView = useCallback(async (options?: { showLoading?: boolean }) => {
    const showLoading = options?.showLoading ?? true;
    if (!circleId || Number.isNaN(cid) || !activityBoardId) {
      setPostItems([]);
      setReplyItems([]);
      return;
    }
    if ((selectedView === "myPosts" || selectedView === "myReplies" || selectedView === "scrap") && !isLoggedIn) {
      setPostItems([]);
      setReplyItems([]);
      return;
    }

    if (showLoading) {
      setListLoading(true);
    }
    setErrorMessage("");
    try {
      if (selectedView === "myReplies") {
        const res = await circleBoardApi.getMyRepliedPosts(cid, { boardId: activityBoardId });
        const nextReplies = res.data.filter((reply) => (reply.boardId ?? 0) > 0);
        setReplyItems((prev) => (isSameReplyItems(prev, nextReplies) ? prev : nextReplies));
        setPostItems((prev) => (prev.length === 0 ? prev : []));
        return;
      }

      const res =
        selectedView === "myPosts"
          ? await circleBoardApi.getMyPosts(cid, { boardId: activityBoardId })
          : selectedView === "scrap"
            ? await circleBoardApi.getMyBookmarkedPosts(cid, { boardId: activityBoardId })
            : await circleBoardApi.getBoardPosts(cid, activityBoardId);

      const nextPosts = res.data
        .map((post) => ({ post, imageUrls: extractImageUrls(post.content) }))
        .sort((a, b) => new Date(b.post.createDate).getTime() - new Date(a.post.createDate).getTime());
      setReplyItems((prev) => (prev.length === 0 ? prev : []));
      setPostItems((prev) => (isSamePostItems(prev, nextPosts) ? prev : nextPosts));
    } catch (e) {
      setErrorMessage(getErrorMessage(e));
      setPostItems((prev) => (prev.length === 0 ? prev : []));
      setReplyItems((prev) => (prev.length === 0 ? prev : []));
    } finally {
      if (showLoading) {
        setListLoading(false);
      }
    }
  }, [activityBoardId, cid, circleId, isLoggedIn, selectedView]);

  useEffect(() => {
    if (!loading) {
      void refreshCurrentView();
    }
  }, [loading, refreshCurrentView]);

  useEffect(() => {
    if (!canManageActivityEdit && editMode) {
      setEditMode(false);
      setStagedPostDeletes({});
    }
  }, [canManageActivityEdit, editMode]);

  useEffect(() => {
    if (selectedView === "myReplies" && editMode) {
      setEditMode(false);
      setStagedPostDeletes({});
    }
  }, [editMode, selectedView]);

  useEffect(() => {
    return () => {
      Object.values(likeAnimationResetRef.current).forEach((timerId) => clearTimeout(timerId));
      Object.values(reactionCommitDebounceRef.current).forEach((timerId) => clearTimeout(timerId));
      Object.values(bookmarkCommitDebounceRef.current).forEach((timerId) => clearTimeout(timerId));
    };
  }, []);

  const boardMap = useMemo(
    () => new Map<number, CircleBoardResponse>(boards.map((board) => [board.boardId, board])),
    [boards],
  );

  const filteredPosts = useMemo(() => {
    if (selectedView === "myReplies") {
      return [];
    }
    return postItems;
  }, [postItems, selectedView]);

  const visiblePosts = useMemo(
    () => filteredPosts.slice(0, visiblePostCount),
    [filteredPosts, visiblePostCount],
  );
  const visibleReplies = useMemo(
    () => replyItems.slice(0, visibleReplyCount),
    [replyItems, visibleReplyCount],
  );
  const hasMorePosts = visiblePostCount < filteredPosts.length;
  const hasMoreReplies = visibleReplyCount < replyItems.length;

  const loadMorePosts = useCallback(() => {
    setVisiblePostCount((prev) => Math.min(prev + ACTIVITY_LOAD_MORE_COUNT, filteredPosts.length));
  }, [filteredPosts.length]);
  const loadMoreReplies = useCallback(() => {
    setVisibleReplyCount((prev) => Math.min(prev + ACTIVITY_LOAD_MORE_COUNT, replyItems.length));
  }, [replyItems.length]);

  const postSentinelRef = useInfiniteScroll(
    loadMorePosts,
    !listLoading && selectedView !== "myReplies" && hasMorePosts,
    "260px",
  );
  const replySentinelRef = useInfiniteScroll(
    loadMoreReplies,
    !listLoading && selectedView === "myReplies" && hasMoreReplies,
    "260px",
  );

  useEffect(() => {
    setVisiblePostCount(ACTIVITY_INITIAL_VISIBLE_COUNT);
    setVisibleReplyCount(ACTIVITY_INITIAL_VISIBLE_COUNT);
  }, [selectedView]);

  useEffect(() => {
    setVisiblePostCount(ACTIVITY_INITIAL_VISIBLE_COUNT);
  }, [filteredPosts]);

  useEffect(() => {
    setVisibleReplyCount(ACTIVITY_INITIAL_VISIBLE_COUNT);
  }, [replyItems]);

  const emptyText = useMemo(() => {
    if ((selectedView === "myPosts" || selectedView === "myReplies" || selectedView === "scrap") && !isLoggedIn) {
      return "로그인 후 목록을 확인할 수 있습니다.";
    }
    if (!activityBoardId) {
      return "모임 활동 게시판이 없습니다.";
    }
    if (selectedView === "myReplies") {
      return "작성한 모임 활동 댓글이 없습니다.";
    }
    if (selectedView === "scrap") {
      return "스크랩한 모임 활동 게시글이 없습니다.";
    }
    if (selectedView === "myPosts") {
      return "작성한 모임 활동이 없습니다.";
    }
    return "모임 활동 게시글이 없습니다.";
  }, [activityBoardId, isLoggedIn, selectedView]);

  const boardFromPath = useMemo(
    () => `/circle/${cid}/activity`,
    [cid],
  );
  const writeHref = useMemo(
    () =>
      defaultWritableBoardId
        ? `/circle/${cid}/board/${defaultWritableBoardId}/posts/create?from=activity`
        : `/circle/${cid}/activity`,
    [cid, defaultWritableBoardId],
  );

  const pendingPostDeleteCount = Object.keys(stagedPostDeletes).length;
  const hasPendingDeletes = pendingPostDeleteCount > 0;

  const resetDeleteDraft = () => {
    setStagedPostDeletes({});
  };

  const toggleEditMode = () => {
    if (!canManageActivityEdit || isApplyingDeletes || selectedView === "myReplies") {
      return;
    }
    if (editMode && hasPendingDeletes) {
      if (!window.confirm("저장되지 않은 삭제 대상을 되돌리고 수정모드를 종료할까요?")) {
        return;
      }
      resetDeleteDraft();
    }
    setEditMode((prev) => !prev);
  };

  const handleStageDeletePost = (post: PostResponse) => {
    if (!canManageActivityEdit || !editMode || selectedView === "myReplies") {
      return;
    }
    setStagedPostDeletes((prev) => {
      const next = { ...prev };
      if (next[post.postId]) {
        delete next[post.postId];
      } else {
        next[post.postId] = post;
      }
      return next;
    });
  };

  const applyDeletes = async () => {
    if (!canManageActivityEdit || !editMode || isApplyingDeletes || pendingPostDeleteCount === 0) {
      return;
    }
    if (!window.confirm("선택한 모임 활동 게시글을 삭제하시겠습니까?")) {
      return;
    }

    setIsApplyingDeletes(true);
    try {
      await Promise.all(
        Object.values(stagedPostDeletes).map((post) =>
          circleBoardApi.deletePost(cid, post.boardId, post.postId),
        ),
      );
      setEditMode(false);
      resetDeleteDraft();
      await refreshCurrentView();
      window.alert("삭제가 적용되었습니다.");
    } catch (e) {
      window.alert(getErrorMessage(e));
    } finally {
      setIsApplyingDeletes(false);
    }
  };

  const handleDeleteOwnPost = async (post: PostResponse) => {
    if (!isLoggedIn) {
      window.alert("로그인 후 게시글을 삭제할 수 있습니다.");
      navigate("/users/login");
      return;
    }
    const isOwner = user?.publicId != null && user.publicId === post.authorPublicId;
    if (!isOwner) {
      return;
    }
    if (!window.confirm("게시글을 삭제하시겠습니까?")) {
      return;
    }
    try {
      await circleBoardApi.deletePost(cid, post.boardId, post.postId);
      setStagedPostDeletes((prev) => {
        if (!prev[post.postId]) {
          return prev;
        }
        const next = { ...prev };
        delete next[post.postId];
        return next;
      });
      await refreshCurrentView();
    } catch (e) {
      window.alert(getErrorMessage(e));
    }
  };

  const handleSelectView = (nextView: CommunityProfileQuickView) => {
    const viewParam = searchParams.get("view");
    const currentView: CommunityProfileQuickView =
      viewParam === "myPosts" || viewParam === "myReplies" || viewParam === "scrap"
        ? viewParam
        : "home";

    if (nextView === currentView) {
      setStagedPostDeletes({});
      if (!loading) {
        void refreshCurrentView({ showLoading: false });
      }
      requestAnimationFrame(() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
      return;
    }

    setListLoading(true);
    setPostItems([]);
    setReplyItems([]);
    setSelectedView(nextView);
    setStagedPostDeletes({});
    setSearchParams(
      (prev) => {
        const params = new URLSearchParams(prev);
        if (nextView === "home") {
          params.delete("view");
        } else {
          params.set("view", nextView);
        }
        return params;
      },
      { replace: true },
    );
    requestAnimationFrame(() => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  };

  const scheduleReactionCommit = (postId: number) => {
    const prevTimer = reactionCommitDebounceRef.current[postId];
    if (prevTimer) {
      clearTimeout(prevTimer);
    }
    reactionCommitDebounceRef.current[postId] = setTimeout(() => {
      flushReactionIntent(postId);
    }, REACTION_COMMIT_DEBOUNCE_MS);
  };

  const scheduleBookmarkCommit = (postId: number) => {
    const prevTimer = bookmarkCommitDebounceRef.current[postId];
    if (prevTimer) {
      clearTimeout(prevTimer);
    }
    bookmarkCommitDebounceRef.current[postId] = setTimeout(() => {
      flushBookmarkIntent(postId);
    }, REACTION_COMMIT_DEBOUNCE_MS);
  };

  const flushReactionIntent = (postId: number) => {
    if (reactionInFlightRef.current[postId]) {
      return;
    }
    const desired = reactionDesiredRef.current[postId];
    const synced = reactionSyncedRef.current[postId];
    if (desired == null || synced == null || desired === synced.liked) {
      return;
    }
    reactionInFlightRef.current[postId] = true;
    void postApi.reactToPost(postId)
      .then(() => {
        const current = reactionSyncedRef.current[postId] ?? synced;
        const nextLiked = !current.liked;
        const nextLikeCount = Math.max(0, current.likeCount + (nextLiked ? 1 : -1));
        reactionSyncedRef.current[postId] = { liked: nextLiked, likeCount: nextLikeCount };
        setReactionByPostId((prev) => ({
          ...prev,
          [postId]: { liked: nextLiked, likeCount: nextLikeCount, error: undefined },
        }));
      })
      .catch((e) => {
        const current = reactionSyncedRef.current[postId] ?? synced;
        reactionDesiredRef.current[postId] = current.liked;
        setReactionByPostId((prev) => ({
          ...prev,
          [postId]: { liked: current.liked, likeCount: current.likeCount, error: getErrorMessage(e) },
        }));
      })
      .finally(() => {
        reactionInFlightRef.current[postId] = false;
        scheduleReactionCommit(postId);
      });
  };

  const flushBookmarkIntent = (postId: number) => {
    if (bookmarkInFlightRef.current[postId]) {
      return;
    }
    const desired = bookmarkDesiredRef.current[postId];
    const synced = bookmarkSyncedRef.current[postId];
    if (desired == null || synced == null || desired === synced) {
      return;
    }
    bookmarkInFlightRef.current[postId] = true;
    void postApi.togglePostBookmark(postId)
      .then(() => {
        const next = !(bookmarkSyncedRef.current[postId] ?? synced);
        bookmarkSyncedRef.current[postId] = next;
        setBookmarkByPostId((prev) => ({
          ...prev,
          [postId]: { bookmarked: next },
        }));
      })
      .catch(() => {
        const current = bookmarkSyncedRef.current[postId] ?? synced;
        bookmarkDesiredRef.current[postId] = current;
        setBookmarkByPostId((prev) => ({
          ...prev,
          [postId]: { bookmarked: current },
        }));
      })
      .finally(() => {
        bookmarkInFlightRef.current[postId] = false;
        scheduleBookmarkCommit(postId);
      });
  };

  const handleToggleReaction = (post: PostResponse) => {
    if (!isLoggedIn) {
      window.alert("로그인 후 좋아요를 누를 수 있습니다.");
      navigate("/users/login");
      return;
    }
    setLikeAnimatingByPostId((prev) => ({ ...prev, [post.postId]: false }));
    requestAnimationFrame(() => {
      setLikeAnimatingByPostId((prev) => ({ ...prev, [post.postId]: true }));
    });
    const prevTimer = likeAnimationResetRef.current[post.postId];
    if (prevTimer) {
      clearTimeout(prevTimer);
    }
    likeAnimationResetRef.current[post.postId] = setTimeout(() => {
      setLikeAnimatingByPostId((prev) => ({ ...prev, [post.postId]: false }));
    }, 500);

    setReactionByPostId((prev) => {
      const synced = reactionSyncedRef.current[post.postId] ?? {
        liked: post.myReaction === "LIKE",
        likeCount: post.likeCount,
      };
      reactionSyncedRef.current[post.postId] = synced;
      const current = prev[post.postId] ?? synced;
      const next = applyLocalReactionState(current);
      reactionDesiredRef.current[post.postId] = next.liked;
      return {
        ...prev,
        [post.postId]: { ...next, error: undefined },
      };
    });
    scheduleReactionCommit(post.postId);
  };

  const handleToggleBookmark = (post: PostResponse) => {
    if (!isLoggedIn) {
      window.alert("로그인 후 북마크를 사용할 수 있습니다.");
      navigate("/users/login");
      return;
    }
    setBookmarkByPostId((prev) => {
      const synced = bookmarkSyncedRef.current[post.postId] ?? (prev[post.postId]?.bookmarked ?? false);
      bookmarkSyncedRef.current[post.postId] = synced;
      const current = prev[post.postId] ?? { bookmarked: synced };
      const next = applyLocalBookmarkState(current);
      bookmarkDesiredRef.current[post.postId] = next.bookmarked;
      return {
        ...prev,
        [post.postId]: next,
      };
    });
    scheduleBookmarkCommit(post.postId);
  };

  return (
    <div className="board-community-page" style={{ minHeight: "100vh", backgroundColor: "#f7f7f8" }}>
      <Navbar />
      <main style={{ maxWidth: 1200, margin: "0 auto", padding: "24px 16px 60px" }}>
        {!loading && circle && <CircleDetailBanner circle={circle} />}
        <CircleDetailTabs circleId={cid} activeTab="activity" />

        {loading && <p style={{ margin: 0, color: "#6b7280" }}>모임 활동을 불러오는 중...</p>}
        {!loading && errorMessage && <p style={{ margin: 0, color: "#dc2626" }}>{errorMessage}</p>}

        {!loading && !errorMessage && (
          <>
            <div className="community-sticky-gap" aria-hidden="true" />
            <section className="board-community-layout">
              <aside className="community-left-sidebar" style={{ display: "grid", gap: 12 }}>
                <CommunityProfileCard
                  selectedView={selectedView}
                  onSelectView={handleSelectView}
                  writeHref={writeHref}
                  writeLabel="전체 활동"
                  onWriteClick={() => handleSelectView("home")}
                  replaceWithPending={canManageActivityEdit && editMode}
                  pendingContent={
                    canManageActivityEdit && editMode ? (
                      <BoardPendingPanel
                        postPinnedCount={0}
                        postDeletedCount={pendingPostDeleteCount}
                        boardCreateCount={0}
                        boardRenameCount={0}
                        boardDeleteCount={0}
                        onReset={resetDeleteDraft}
                        onApply={() => void applyDeletes()}
                        resetDisabled={isApplyingDeletes || !hasPendingDeletes}
                        applyDisabled={isApplyingDeletes}
                        embedded
                      />
                    ) : undefined
                  }
                  bottomAction={
                    canManageActivityEdit && selectedView !== "myReplies" ? (
                      <button
                        type="button"
                        onClick={toggleEditMode}
                        className={`community-side-edit-toggle ${editMode ? "active" : ""}`}
                        aria-label="모임 활동 편집모드 전환"
                        title="모임 활동 편집"
                      >
                        <Settings size={16} strokeWidth={2} aria-hidden="true" />
                        <span>편집모드</span>
                      </button>
                    ) : undefined
                  }
                />
              </aside>

              <section className="community-center-column">
                {activityBoardId && (
                  <CircleActivityComposer
                    circleId={cid}
                    circleName={circle?.name}
                    boards={boards}
                    selectedBoard={activityBoardId}
                    onCreated={() => {
                      const viewParam = searchParams.get("view");
                      const currentView: CommunityProfileQuickView =
                        viewParam === "myPosts" || viewParam === "myReplies" || viewParam === "scrap"
                          ? viewParam
                          : "home";

                      if (currentView === "home") {
                        void refreshCurrentView({ showLoading: false });
                        return;
                      }
                      handleSelectView("home");
                    }}
                  />
                )}
                {listLoading ? (
                  <p style={{ margin: 0, color: "#6b7280" }}>목록을 불러오는 중...</p>
                ) : selectedView === "myReplies" ? (
                  replyItems.length === 0 ? (
                    <p style={{ margin: 0, color: "#6b7280" }}>{emptyText}</p>
                  ) : (
                    <>
                      <ul className="community-post-list">
                        {visibleReplies.map((item) => (
                          <li key={`reply-${item.replyId}`}>
                            <Link
                              to={`/circle/${cid}/board/${item.boardId}/posts/${item.postId}`}
                              state={{ from: boardFromPath, focusReplyId: item.replyId }}
                              className="community-post-item-link"
                            >
                              <div className="community-post-item-body">
                                <p className="community-post-item-title">
                                  <span className="community-post-item-title-text">{item.content}</span>
                                  <span className="community-post-item-board">
                                    · {boardMap.get(item.boardId ?? 0)?.name ?? "게시판"}
                                  </span>
                                </p>
                                <p className="community-post-item-meta">
                                  <span>원문: {item.postTitle}</span>
                                  <span className="community-post-item-stat">
                                    <Heart size={14} />
                                    {item.likeCount}
                                  </span>
                                  <span>{toDateLabel(item.createDate)}</span>
                                </p>
                              </div>
                            </Link>
                          </li>
                        ))}
                      </ul>
                      {hasMoreReplies && <div ref={replySentinelRef} className="h-6" />}
                      {!hasMoreReplies && replyItems.length > 0 && (
                        <p style={{ margin: "8px 0 0", textAlign: "center", color: "#9ca3af", fontSize: 12 }}>
                          모든 댓글을 불러왔습니다.
                        </p>
                      )}
                    </>
                  )
                ) : filteredPosts.length === 0 ? (
                  <p style={{ margin: 0, color: "#6b7280" }}>{emptyText}</p>
                ) : (
                  <>
                    <ul className="community-post-list">
                      {visiblePosts.map(({ post, imageUrls }) => {
                        const stagedDeleted = !!stagedPostDeletes[post.postId];
                        const summary = extractPlainText(post.content);
                        const previewImages = imageUrls.length > 0
                          ? Array.from(new Set(imageUrls.filter((url): url is string => !!url)))
                          : post.thumbnailUrl
                            ? [post.thumbnailUrl]
                            : [];
                        const reactionState = reactionByPostId[post.postId] ?? {
                          liked: post.myReaction === "LIKE",
                          likeCount: post.likeCount,
                          error: undefined,
                        };
                        const bookmarkState = bookmarkByPostId[post.postId] ?? {
                          bookmarked: false,
                        };
                        const isOwner = user?.publicId != null && user.publicId === post.authorPublicId;
                        const canEdit = isOwner && cid > 0;
                        const canDeleteOwn = isOwner;
                        const canReport = isLoggedIn && !isOwner;
                        return (
                          <li
                            key={post.postId}
                            className="community-activity-feed-item"
                            style={stagedDeleted ? { opacity: 0.55 } : undefined}
                          >
                            <CommunityActivityFeedCard
                              post={post}
                              circleName={circle?.name ?? "모임"}
                              postHref={`/circle/${cid}/board/${post.boardId}/posts/${post.postId}`}
                              fromState={{ from: boardFromPath }}
                              createDateLabel={toDateLabel(post.createDate)}
                              disableNavigation={editMode}
                              previewImages={previewImages}
                              summary={summary}
                              liked={reactionState.liked}
                              likeCount={reactionState.likeCount}
                              isLikeAnimating={!!likeAnimatingByPostId[post.postId]}
                              reactionError={reactionState.error}
                              isLoggedIn={isLoggedIn}
                              avatarColor={avatarColor(post.authorName)}
                              onToggleReaction={() => void handleToggleReaction(post)}
                              headerAction={
                                  <PostActionMenu
                                    canEdit={canEdit}
                                    canDelete={canDeleteOwn}
                                    canReport={canReport}
                                    bookmarked={bookmarkState.bookmarked}
                                    onToggleBookmark={() => void handleToggleBookmark(post)}
                                    onDelete={() => void handleDeleteOwnPost(post)}
                                    onEdit={() =>
                                      navigate(`/circle/${cid}/board/${post.boardId}/posts/${post.postId}/edit`, {
                                        state: { from: boardFromPath },
                                      })
                                    }
                                    onReport={() => openReportForm("POST", post.postId)}
                                  />
                                }
                              metaAction={
                                canManageActivityEdit && editMode ? (
                                  <button
                                    type="button"
                                    aria-label="게시글 삭제"
                                    className={`community-post-admin-action-button danger ${
                                      stagedPostDeletes[post.postId] ? "active" : ""
                                    }`}
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      handleStageDeletePost(post);
                                    }}
                                  >
                                    <Trash2 size={14} strokeWidth={2} />
                                    <span>삭제</span>
                                  </button>
                                ) : undefined
                              }
                            />
                          </li>
                        );
                      })}
                    </ul>
                    {hasMorePosts && <div ref={postSentinelRef} className="h-6" />}
                    {!hasMorePosts && filteredPosts.length > 0 && (
                      <p style={{ margin: "8px 0 0", textAlign: "center", color: "#9ca3af", fontSize: 12 }}>
                        모든 게시글을 불러왔습니다.
                      </p>
                    )}
                  </>
                )}
              </section>

              <aside className="community-right-sidebar" aria-hidden="true" />

            </section>
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}
