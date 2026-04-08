import { useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Heart } from "lucide-react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import Navbar from "../../common/layout/Navbar";
import Footer from "../../common/layout/Footer";
import CircleDetailBanner from "../../common/components/CircleDetailBanner";
import CircleDetailTabs from "../../common/components/CircleDetailTabs";
import { circleApi } from "../../api/circleApi";
import { circleBoardApi, type CircleBoardResponse } from "../../api/circleBoardApi";
import type { CircleResponse } from "../../circle/types/circle";
import type { PostBookmarkSummary, PostReactionSummary, PostResponse } from "../types/postTypes";
import { useAuthStore } from "../../store/authStore";
import { postApi } from "../api/postApi";
import { getErrorMessage } from "../../common/utils/errorMessage";
import { useDelayedLoading } from "../../common/hooks/useDelayedLoading";
import { BoardDetailSkeleton, ReplyListSkeleton } from "../../common/components/BoardLoadingSkeletons";
import PostDetailArticleCard from "../components/PostDetailArticleCard";
import PostActionMenu from "../components/PostActionMenu";
import CommentBubbleIcon from "../../common/components/CommentBubbleIcon";
import { useReplies } from "../../reply/hooks/useReplies";
import { useReplyForm } from "../../reply/hooks/useReplyForm";
import ReplyForm from "../../reply/components/ReplyForm";
import ReplyList from "../../reply/components/ReplyList";
import CommunityProfileCard, {
  type CommunityProfileQuickView,
} from "../../board/components/CommunityProfileCard";
import CircleBoardRightSidebar from "../../board/components/CircleBoardRightSidebar";
import CircleBoardSidebarMenu from "../../board/components/CircleBoardSidebarMenu";
import { openReportForm } from "../../common/utils/openReportForm";
import "../../reply/styles/replySection.css";
import "../../board/pages/boardCommunity.css";
import "../styles/postDetail.css";

function applyLocalPostReaction(current: PostResponse): PostResponse {
  if (current.myReaction === "LIKE") {
    return { ...current, likeCount: Math.max(0, current.likeCount - 1), myReaction: null };
  }
  return { ...current, likeCount: current.likeCount + 1, myReaction: "LIKE" };
}

function applyLocalReactionSummary(current: PostReactionSummary): PostReactionSummary {
  if (current.myReaction === "LIKE") {
    return { ...current, likeCount: Math.max(0, current.likeCount - 1), myReaction: null };
  }
  return { ...current, likeCount: current.likeCount + 1, myReaction: "LIKE" };
}

function applyLocalBookmarkSummary(current: PostBookmarkSummary): PostBookmarkSummary {
  return { ...current, bookmarked: !current.bookmarked };
}

function parseFocusReplyId(value: unknown): number | null {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    return null;
  }
  return parsed;
}

function extractImageUrls(html: string | undefined): string[] {
  if (!html) return [];
  const urls: string[] = [];
  const regex = /<img[^>]+src=["']([^"']+)["'][^>]*>/gi;
  let match = regex.exec(html);
  while (match) {
    urls.push(match[1]);
    match = regex.exec(html);
  }
  return Array.from(new Set(urls.filter(Boolean)));
}

function stripImageTags(html: string | undefined): string {
  if (!html) return "";
  return html
    .replace(
      /<figure\b[^>]*>\s*(?:<img\b[^>]*>\s*)+(<figcaption\b[^>]*>[\s\S]*?<\/figcaption>)?\s*<\/figure>/gi,
      "$1",
    )
    .replace(/<img\b[^>]*>/gi, "");
}

function extractPlainText(html: string | undefined): string {
  return (html ?? "")
    .replace(/<\/(p|div|li|h[1-6])>/gi, "\n")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function isDeletedPostFetchError(error: unknown): boolean {
  const status = (error as { response?: { status?: number } })?.response?.status;
  const data = (error as { response?: { data?: { message?: string } | string } })?.response?.data;
  const message = typeof data === "string" ? data : data?.message ?? "";
  return status === 404 && message.includes("게시글");
}

export default function CirclePostDetailPage() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const location = useLocation();
  const { circleId, boardId, postId } = useParams<{
    circleId: string;
    boardId: string;
    postId: string;
  }>();
  const cid = Number(circleId);
  const bid = Number(boardId);
  const pid = Number(postId);

  const { isLoggedIn, user } = useAuthStore();
  const isAdmin = user?.userRole === "ADMIN";
  const { create, update, remove, error: replySubmitError } = useReplyForm();
  const [circle, setCircle] = useState<CircleResponse | null>(null);
  const [boards, setBoards] = useState<CircleBoardResponse[]>([]);
  const [post, setPost] = useState<PostResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [sidebarView, setSidebarView] = useState<CommunityProfileQuickView>("home");
  const [reactionError, setReactionError] = useState("");
  const [bookmarkError, setBookmarkError] = useState("");
  const [localPostReaction, setLocalPostReaction] = useState<PostReactionSummary | null>(null);
  const [localBookmarkState, setLocalBookmarkState] = useState<PostBookmarkSummary | null>(null);
  const [isLikeAnimating, setIsLikeAnimating] = useState(false);
  const [autoExpandParentId, setAutoExpandParentId] = useState<number | null>(null);
  const [focusReplyId, setFocusReplyId] = useState<number | null>(null);
  const reactAnimationResetRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reactCommitDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const bookmarkCommitDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingPostLikeParityRef = useRef(0);
  const pendingBookmarkParityRef = useRef(0);
  const hasAppliedInitialFocusRef = useRef(false);
  const memberAccessHandledRef = useRef(false);
  const loginAccessHandledRef = useRef(false);

  useEffect(() => {
    if (!circleId || !boardId || !postId || Number.isNaN(cid) || Number.isNaN(bid) || Number.isNaN(pid)) {
      navigate("/circle", { replace: true });
      return;
    }

    if (!isLoggedIn) {
      if (!loginAccessHandledRef.current) {
        loginAccessHandledRef.current = true;
        window.alert("로그인 후 게시글을 확인할 수 있습니다.");
      }
      sessionStorage.setItem("postLoginRedirect", location.pathname + location.search);
      navigate("/users/login", { replace: true });
      return;
    }

    setLoading(true);
    setErrorMessage("");
    Promise.all([
      circleApi.getCircle(cid),
      circleBoardApi.getBoards(cid),
      circleBoardApi.getBoardPost(cid, bid, pid),
    ])
      .then(([circleRes, boardRes, postRes]) => {
        if (!isAdmin && !circleRes.data.myRole) {
          if (memberAccessHandledRef.current) {
            return;
          }
          memberAccessHandledRef.current = true;
          window.alert("해당 모임 멤버만 게시글을 확인할 수 있습니다. 가입 후 이용해주세요.");
          navigate(`/circle/${cid}`, { replace: true });
          return;
        }
        setCircle(circleRes.data);
        setBoards(boardRes.data);
        setPost(postRes.data);
      })
      .catch((e) => {
        if (isDeletedPostFetchError(e)) {
          navigate("/error/post-deleted", { replace: true });
          return;
        }
        setErrorMessage(getErrorMessage(e));
      })
      .finally(() => setLoading(false));
  }, [bid, boardId, cid, circleId, isAdmin, isLoggedIn, location.pathname, location.search, navigate, pid, postId]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [pid]);

  const {
    tree,
    loading: replyLoading,
    loadingMore: replyLoadingMore,
    error: replyError,
    hasMore: hasMoreReplies,
    totalCount: totalReplyCount,
    refetch,
    refetchAll,
    loadMore,
  } = useReplies({ postId: pid, enabled: Number.isFinite(pid) });

  const showPostLoading = useDelayedLoading(loading, 180);
  const showReplyLoading = useDelayedLoading(replyLoading, 180);
  const locationState = location.state as { from?: string; focusReplyId?: number } | null;
  const stateFrom = locationState?.from;
  const board = useMemo(
    () => boards.find((item) => item.boardId === bid) ?? null,
    [bid, boards],
  );
  const cameFromActivity = typeof stateFrom === "string" && stateFrom.includes(`/circle/${cid}/activity`);
  const isActivityContext = board?.circleBoardKind === "ACTIVITY" || cameFromActivity;
  const boardFromPath = isActivityContext ? `/circle/${cid}/activity` : `/circle/${cid}/board?board=${bid}`;
  const initialFocusReplyId = parseFocusReplyId(locationState?.focusReplyId);
  const resolvedBackPath = typeof stateFrom === "string" && stateFrom.length > 0 ? stateFrom : boardFromPath;
  const activityAlbumImages = useMemo(
    () => (isActivityContext ? extractImageUrls(post?.content) : []),
    [isActivityContext, post?.content],
  );
  const postContentHtml = useMemo(
    () => (isActivityContext ? stripImageTags(post?.content) : post?.content ?? ""),
    [isActivityContext, post?.content],
  );
  const activitySummaryText = useMemo(
    () => (isActivityContext ? extractPlainText(post?.content) : ""),
    [isActivityContext, post?.content],
  );
  const liked = (localPostReaction?.myReaction ?? post?.myReaction) === "LIKE";
  const displayReplyCount = post?.replyCount ?? totalReplyCount;
  const isOwner = !!post && !!user && post.authorPublicId === user.publicId;
  const isCircleLeader = circle?.myRole === "LEADER";
  const canDeletePost = isOwner || isCircleLeader;
  const canUseCircleReport = isAdmin || !!circle?.myRole;

  const bookmarkQuery = useQuery<PostBookmarkSummary>({
    queryKey: ["postBookmark", pid],
    enabled: isLoggedIn && Number.isFinite(pid),
    queryFn: async () => (await postApi.getMyPostBookmark(pid)).data,
    staleTime: 20_000,
  });
  const isBookmarked = localBookmarkState?.bookmarked ?? bookmarkQuery.data?.bookmarked ?? false;

  const refreshReplies = async (loadAll: boolean, keepScroll = true) => {
    const currentScrollY = keepScroll ? window.scrollY : 0;
    if (loadAll) {
      await refetchAll();
    } else {
      await refetch();
    }
    if (keepScroll) {
      requestAnimationFrame(() => window.scrollTo({ top: currentScrollY, behavior: "auto" }));
    }
  };

  useEffect(() => {
    setAutoExpandParentId(null);
    pendingPostLikeParityRef.current = 0;
    pendingBookmarkParityRef.current = 0;
  }, [post?.postId]);

  useEffect(() => {
    if (!post) {
      setLocalPostReaction(null);
      return;
    }
    if (pendingPostLikeParityRef.current % 2 === 1 || reactMutation.isPending) {
      return;
    }
    setLocalPostReaction({ likeCount: post.likeCount, myReaction: post.myReaction });
  }, [post?.postId, post?.likeCount, post?.myReaction]);

  useEffect(() => {
    if (!bookmarkQuery.data) {
      setLocalBookmarkState(null);
      return;
    }
    if (pendingBookmarkParityRef.current % 2 === 1 || bookmarkMutation.isPending) {
      return;
    }
    setLocalBookmarkState({ bookmarked: bookmarkQuery.data.bookmarked });
  }, [bookmarkQuery.data?.bookmarked]);

  useEffect(() => {
    return () => {
      if (reactAnimationResetRef.current) clearTimeout(reactAnimationResetRef.current);
      if (reactCommitDebounceRef.current) clearTimeout(reactCommitDebounceRef.current);
      if (bookmarkCommitDebounceRef.current) clearTimeout(bookmarkCommitDebounceRef.current);
    };
  }, []);

  const reactMutation = useMutation<PostReactionSummary, Error>({
    mutationFn: async () => (await postApi.reactToPost(pid)).data,
    onSuccess: () => setReactionError(""),
    onError: (error) => {
      setLocalPostReaction((current) => (current ? applyLocalReactionSummary(current) : current));
      setPost((current) => (current ? applyLocalPostReaction(current) : current));
      setReactionError(getErrorMessage(error));
    },
    onSettled: () => {
      if (pendingPostLikeParityRef.current % 2 === 1) schedulePostLikeCommit();
    },
  });

  const bookmarkMutation = useMutation<PostBookmarkSummary, Error>({
    mutationFn: async () => (await postApi.togglePostBookmark(pid)).data,
    onSuccess: () => setBookmarkError(""),
    onError: (error) => {
      setLocalBookmarkState((current) => (current ? applyLocalBookmarkSummary(current) : current));
      queryClient.setQueryData<PostBookmarkSummary>(
        ["postBookmark", pid],
        (current) => (current ? applyLocalBookmarkSummary(current) : current),
      );
      setBookmarkError(getErrorMessage(error));
    },
    onSettled: () => {
      if (pendingBookmarkParityRef.current % 2 === 1) scheduleBookmarkCommit();
    },
  });

  const schedulePostLikeCommit = () => {
    if (reactCommitDebounceRef.current) clearTimeout(reactCommitDebounceRef.current);
    reactCommitDebounceRef.current = setTimeout(() => {
      if (pendingPostLikeParityRef.current % 2 === 0) return;
      if (reactMutation.isPending) {
        schedulePostLikeCommit();
        return;
      }
      pendingPostLikeParityRef.current = 0;
      reactMutation.mutate();
    }, 200);
  };

  const scheduleBookmarkCommit = () => {
    if (bookmarkCommitDebounceRef.current) clearTimeout(bookmarkCommitDebounceRef.current);
    bookmarkCommitDebounceRef.current = setTimeout(() => {
      if (pendingBookmarkParityRef.current % 2 === 0) return;
      if (bookmarkMutation.isPending) {
        scheduleBookmarkCommit();
        return;
      }
      pendingBookmarkParityRef.current = 0;
      bookmarkMutation.mutate();
    }, 200);
  };

  const react = () => {
    if (!post) return;
    if (!isLoggedIn) {
      window.alert("로그인 후 좋아요를 누를 수 있습니다.");
      navigate("/users/login");
      return;
    }
    setIsLikeAnimating(false);
    requestAnimationFrame(() => setIsLikeAnimating(true));
    if (reactAnimationResetRef.current) clearTimeout(reactAnimationResetRef.current);
    reactAnimationResetRef.current = setTimeout(() => setIsLikeAnimating(false), 500);
    setReactionError("");
    setLocalPostReaction((current) => (current ? applyLocalReactionSummary(current) : current));
    setPost((current) => (current ? applyLocalPostReaction(current) : current));
    pendingPostLikeParityRef.current = (pendingPostLikeParityRef.current + 1) % 2;
    schedulePostLikeCommit();
  };

  const toggleBookmark = () => {
    if (!isLoggedIn) {
      window.alert("로그인 후 북마크를 사용할 수 있습니다.");
      navigate("/users/login");
      return;
    }
    setBookmarkError("");
    setLocalBookmarkState((current) =>
      current ? applyLocalBookmarkSummary(current) : { bookmarked: true },
    );
    queryClient.setQueryData<PostBookmarkSummary>(
      ["postBookmark", pid],
      (current) => (current ? applyLocalBookmarkSummary(current) : { bookmarked: true }),
    );
    pendingBookmarkParityRef.current = (pendingBookmarkParityRef.current + 1) % 2;
    scheduleBookmarkCommit();
  };

  const handleOpenPostReport = () => {
    if (!isLoggedIn) {
      sessionStorage.setItem("postLoginRedirect", location.pathname + location.search);
      window.alert("로그인 후 신고할 수 있습니다.");
      navigate("/users/login");
      return;
    }
    if (!canUseCircleReport) {
      window.alert("모임 가입 후 신고할 수 있습니다.");
      navigate(`/circle/${cid}`);
      return;
    }
    openReportForm("POST", pid);
  };

  const handleDeletePost = async () => {
    if (!post) return;
    if (!isLoggedIn) {
      window.alert("로그인 후 게시글을 삭제할 수 있습니다.");
      navigate("/users/login");
      return;
    }
    if (!canDeletePost) {
      window.alert("게시글 삭제 권한이 없습니다.");
      return;
    }
    if (!window.confirm("게시글을 삭제하시겠습니까?")) {
      return;
    }
    try {
      await circleBoardApi.deletePost(cid, bid, pid);
      window.alert("게시글이 삭제되었습니다.");
      navigate(resolvedBackPath, { replace: true });
    } catch (e) {
      window.alert(getErrorMessage(e));
    }
  };

  const handleSidebarBoardSelect = (board: "all" | number) => {
    if (isActivityContext) {
      navigate(`/circle/${cid}/activity`);
      return;
    }
    const params = new URLSearchParams();
    if (board !== "all") {
      params.set("board", String(board));
    }
    navigate(`/circle/${cid}/board${params.toString() ? `?${params.toString()}` : ""}`);
  };

  useEffect(() => {
    if (!initialFocusReplyId || hasAppliedInitialFocusRef.current) {
      return;
    }
    hasAppliedInitialFocusRef.current = true;
    setFocusReplyId(initialFocusReplyId);
    void refreshReplies(true, false);
  }, [initialFocusReplyId]);

  useEffect(() => {
    if (!focusReplyId) {
      return;
    }
    const target = document.querySelector(`[data-reply-id="${focusReplyId}"]`);
    if (!target) {
      return;
    }
    (target as HTMLElement).scrollIntoView({ behavior: "smooth", block: "center" });
    setFocusReplyId(null);
  }, [focusReplyId, tree]);

  const handleSidebarViewSelect = (nextView: CommunityProfileQuickView) => {
    setSidebarView(nextView);
    const params = new URLSearchParams();
    if (nextView !== "home") {
      params.set("view", nextView);
    }
    if (isActivityContext) {
      navigate(`/circle/${cid}/activity${params.toString() ? `?${params.toString()}` : ""}`);
      return;
    }
    navigate(`/circle/${cid}/board${params.toString() ? `?${params.toString()}` : ""}`);
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f7f7f8" }}>
      <Navbar />
      <main style={{ maxWidth: 1200, margin: "0 auto", padding: "24px 16px" }}>
        {!loading && circle && <CircleDetailBanner circle={circle} />}
        <CircleDetailTabs circleId={cid} activeTab={isActivityContext ? "activity" : "board"} />

        <section className="board-community-layout">
          <aside className="community-left-sidebar" style={{ display: "grid", gap: 12 }}>
            <CommunityProfileCard
              selectedView={sidebarView}
              onSelectView={handleSidebarViewSelect}
              writeHref={isActivityContext
                ? `/circle/${cid}/board/${bid}/posts/create?from=activity`
                : `/circle/${cid}/board/${bid}/posts/create`}
            />
            {!isActivityContext && (
              <CircleBoardSidebarMenu
                boards={boards}
                selectedBoard={bid}
                onSelectBoard={handleSidebarBoardSelect}
                isActive
              />
            )}
          </aside>

          <section>
            {showPostLoading && <BoardDetailSkeleton />}
            {errorMessage && <p style={{ color: "#dc2626" }}>{errorMessage}</p>}
            {bookmarkError && <p style={{ color: "#dc2626" }}>{bookmarkError}</p>}

            {post && (
              <>
                <PostDetailArticleCard
                  post={post}
                  contentHtml={postContentHtml}
                  activitySummaryText={activitySummaryText}
                  albumImages={activityAlbumImages}
                  hideTitle={isActivityContext}
                  titleTop={
                    <Link
                      to={resolvedBackPath}
                      aria-label="목록으로 돌아가기"
                      className="post-detail-back-link"
                    >
                      ← 목록으로
                    </Link>
                  }
                  headerAction={
                    <PostActionMenu
                      canEdit={isOwner}
                      canDelete={canDeletePost}
                      canReport={!isOwner}
                      bookmarked={isBookmarked}
                      onToggleBookmark={toggleBookmark}
                      onDelete={() => void handleDeletePost()}
                      onEdit={() =>
                        navigate(`/circle/${cid}/board/${bid}/posts/${pid}/edit`, {
                          state: { from: resolvedBackPath },
                        })
                      }
                      onReport={handleOpenPostReport}
                    />
                    }
                  actionSection={
                    <div className="post-detail-engagement">
                      <button
                        className={`post-detail-like-button ${liked ? "on" : ""} ${
                          isLikeAnimating ? "moa-reaction-pulse" : ""
                        } ${!isLoggedIn ? "disabled" : ""}`}
                        type="button"
                        onClick={() => void react()}
                        aria-pressed={liked}
                        aria-label={liked ? "좋아요 취소" : "좋아요"}
                      >
                        <Heart
                          size={20}
                          strokeWidth={2}
                          fill={liked ? "currentColor" : "none"}
                          aria-hidden="true"
                        />
                        <span className="post-detail-like-count">
                          {localPostReaction?.likeCount ?? post.likeCount}
                        </span>
                      </button>
                      <span className="post-detail-reply-count">
                        <CommentBubbleIcon size={20} strokeWidth={1.8} />
                        <span className="post-detail-reply-value">{displayReplyCount}</span>
                      </span>
                      {reactionError && <p className="post-detail-reaction-error">{reactionError}</p>}
                    </div>
                  }
                />

                <section className="reply-section">
                  <h3 className="reply-section-title">
                    <CommentBubbleIcon size={20} strokeWidth={1.8} color="#111827" />
                    댓글 {displayReplyCount}개
                  </h3>
                  <p className="reply-section-subtitle">의견을 남기고 대화를 이어가 보세요.</p>
                  <ReplyForm
                    postId={pid}
                    variant="panel"
                    currentUserName={user?.nickname}
                    onRequireLogin={() => navigate("/users/login")}
                    onSubmitReply={(content) => create({ postId: pid, content })}
                    canWrite={isLoggedIn}
                    onSuccess={(createdReplyId) => {
                      if (createdReplyId) setFocusReplyId(createdReplyId);
                      void refreshReplies(true, false);
                    }}
                  />
                  {replySubmitError && <p style={{ color: "#dc2626" }}>{replySubmitError}</p>}
                  {showReplyLoading && <ReplyListSkeleton count={4} />}
                  {replyError && <p style={{ color: "#dc2626" }}>{replyError}</p>}
                  {!replyLoading && !replyError && (
                    <ReplyList
                      postId={pid}
                      tree={tree}
                      hasMore={hasMoreReplies}
                      loadingMore={replyLoadingMore}
                      onLoadMore={loadMore}
                      currentUserPublicId={user?.publicId}
                      currentUserName={user?.nickname}
                      isAdmin={!!isAdmin}
                      canWrite={isLoggedIn}
                      canDeleteAsAdmin
                      onUpdate={(replyId, content) =>
                        update({ postId: pid, replyId, content }).then(() => refreshReplies(false))
                      }
                      onDelete={(replyId) =>
                        remove({ postId: pid, replyId }).then(() => refreshReplies(false))
                      }
                      onCreateChild={(content, targetReplyId, expandParentId) =>
                        create({ postId: pid, content, parentId: targetReplyId }).then(
                          async (createdReplyId) => {
                            setAutoExpandParentId(expandParentId);
                            setFocusReplyId(createdReplyId);
                            await refreshReplies(true, false);
                          },
                        )
                      }
                      autoExpandParentId={autoExpandParentId}
                      focusReplyId={focusReplyId}
                      onFocusReplyHandled={() => setFocusReplyId(null)}
                      onRequireLogin={() => navigate("/users/login")}
                    />
                  )}
                </section>
              </>
            )}
            {!showPostLoading && !post && !errorMessage && (
              <p style={{ color: "#6b7280" }}>게시글을 찾을 수 없습니다.</p>
            )}
          </section>

          <CircleBoardRightSidebar circleId={cid} boards={boards} />
        </section>
      </main>
      <Footer />
    </div>
  );
}
