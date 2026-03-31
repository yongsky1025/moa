import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Heart } from "lucide-react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import CommentBubbleIcon from "../../common/components/CommentBubbleIcon";
import { useAuthStore } from "../../store/authStore";
import Footer from "../../common/layout/Footer";
import Navbar from "../../common/layout/Navbar";
import BoardSectionHeader from "../../common/components/BoardSectionHeader";
import {
  BoardDetailSkeleton,
  ReplyListSkeleton,
} from "../../common/components/BoardLoadingSkeletons";
import PostDetailArticleCard from "../components/PostDetailArticleCard";
import PostActionMenu from "../components/PostActionMenu";
import { usePostDetail } from "../hooks/usePostDetail";
import { useReplies } from "../../reply/hooks/useReplies";
import { useReplyForm } from "../../reply/hooks/useReplyForm";
import ReplyList from "../../reply/components/ReplyList";
import ReplyForm from "../../reply/components/ReplyForm";
import "../../reply/styles/replySection.css";
import { useDelayedLoading } from "../../common/hooks/useDelayedLoading";
import { postRoutes } from "../routes/postRoutes";
import { postApi } from "../api/postApi";
import type {
  PostBookmarkSummary,
  PostKind,
  PostReactionSummary,
  PostResponse,
} from "../types/postTypes";
import { getErrorMessage } from "../../common/utils/errorMessage";
import CommunityLeftSidebar, {
  type CommunityBoardFilter,
} from "../../board/components/CommunityLeftSidebar";
import CommunityRightSidebar from "../../board/components/CommunityRightSidebar";
import "../../board/pages/boardCommunity.css";
import "../styles/postDetail.css";

function resolveKind(pathname: string): Exclude<PostKind, "circle"> {
  if (pathname.includes("/notice")) return "notice";
  return "free";
}

function applyLocalPostReaction(current: PostResponse): PostResponse {
  if (current.myReaction === "LIKE") {
    return {
      ...current,
      likeCount: Math.max(0, current.likeCount - 1),
      myReaction: null,
    };
  }

  return {
    ...current,
    likeCount: current.likeCount + 1,
    myReaction: "LIKE",
  };
}

function applyLocalReactionSummary(current: PostReactionSummary): PostReactionSummary {
  if (current.myReaction === "LIKE") {
    return {
      ...current,
      likeCount: Math.max(0, current.likeCount - 1),
      myReaction: null,
    };
  }
  return {
    ...current,
    likeCount: current.likeCount + 1,
    myReaction: "LIKE",
  };
}

function applyLocalBookmarkSummary(current: PostBookmarkSummary): PostBookmarkSummary {
  return {
    ...current,
    bookmarked: !current.bookmarked,
  };
}

function parseFocusReplyId(value: unknown): number | null {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    return null;
  }
  return parsed;
}

export default function PostDetailPage() {
  const queryClient = useQueryClient();
  const { postId } = useParams<{ postId: string }>();
  const postIdNumber = Number(postId);
  const location = useLocation();
  const navigate = useNavigate();
  const kind = resolveKind(location.pathname);

  const { data, loading, error } = usePostDetail({
    kind,
    postId: postIdNumber,
  });
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
  } = useReplies({ postId: postIdNumber });
  const { create, update, remove, error: replySubmitError } = useReplyForm();
  const { isLoggedIn, user } = useAuthStore();
  const isAdmin = user?.userRole === "ADMIN";
  const isOwner = !!data && !!user && data.authorPublicId === user.publicId;
  const canEdit = kind === "notice" ? isAdmin : isOwner;
  const canCreateReply = isLoggedIn;
  const [sidebarView, setSidebarView] = useState<"home" | "myPosts" | "myReplies" | "scrap">("home");
  const [sidebarBoard, setSidebarBoard] = useState<CommunityBoardFilter>("all");
  const [reactionError, setReactionError] = useState("");
  const [bookmarkError, setBookmarkError] = useState("");
  const [localPostReaction, setLocalPostReaction] = useState<PostReactionSummary | null>(null);
  const [localBookmarkState, setLocalBookmarkState] = useState<PostBookmarkSummary | null>(null);
  const [isLikeAnimating, setIsLikeAnimating] = useState(false);
  const [autoExpandParentId, setAutoExpandParentId] = useState<number | null>(
    null,
  );
  const [focusReplyId, setFocusReplyId] = useState<number | null>(null);
  const reactAnimationResetRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reactCommitDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const bookmarkCommitDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingPostLikeParityRef = useRef(0);
  const pendingBookmarkParityRef = useRef(0);
  const hasAppliedInitialFocusRef = useRef(false);
  const showPostLoading = useDelayedLoading(loading, 180);
  const showReplyLoading = useDelayedLoading(replyLoading, 180);
  const liked = (localPostReaction?.myReaction ?? data?.myReaction) === "LIKE";
  const bookmarkQuery = useQuery<PostBookmarkSummary>({
    queryKey: ["postBookmark", postIdNumber],
    enabled: isLoggedIn && Number.isFinite(postIdNumber),
    queryFn: async () => (await postApi.getMyPostBookmark(postIdNumber)).data,
    staleTime: 20_000,
  });
  const isBookmarked = localBookmarkState?.bookmarked ?? bookmarkQuery.data?.bookmarked ?? false;
  const displayReplyCount = data?.replyCount ?? totalReplyCount;

  const refreshReplies = async (loadAll: boolean, keepScroll = true) => {
    const currentScrollY = keepScroll ? window.scrollY : 0;
    if (loadAll) {
      await refetchAll();
    } else {
      await refetch();
    }
    if (keepScroll) {
      requestAnimationFrame(() => {
        window.scrollTo({ top: currentScrollY, behavior: "auto" });
      });
    }
  };

  useEffect(() => {
    setAutoExpandParentId(null);
    pendingPostLikeParityRef.current = 0;
    pendingBookmarkParityRef.current = 0;
  }, [data?.postId]);

  useEffect(() => {
    if (!data) {
      setLocalPostReaction(null);
      return;
    }
    if (pendingPostLikeParityRef.current % 2 === 1 || reactMutation.isPending) {
      return;
    }
    setLocalPostReaction({
      likeCount: data.likeCount,
      myReaction: data.myReaction,
    });
  }, [data?.postId, data?.likeCount, data?.myReaction]);

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
      if (reactAnimationResetRef.current) {
        clearTimeout(reactAnimationResetRef.current);
      }
      if (reactCommitDebounceRef.current) {
        clearTimeout(reactCommitDebounceRef.current);
      }
      if (bookmarkCommitDebounceRef.current) {
        clearTimeout(bookmarkCommitDebounceRef.current);
      }
    };
  }, []);

  const reactMutation = useMutation<PostReactionSummary, Error>({
    mutationFn: async () => (await postApi.reactToPost(postIdNumber)).data,
    onSuccess: () => {
      setReactionError("");
    },
    onError: (error) => {
      setLocalPostReaction((current) =>
        current ? applyLocalReactionSummary(current) : current,
      );
      const postDetailKey = ["postDetail", kind, postIdNumber] as const;
      queryClient.setQueryData<PostResponse>(postDetailKey, (current) =>
        current ? applyLocalPostReaction(current) : current,
      );
      setReactionError(getErrorMessage(error));
    },
    onSettled: () => {
      if (pendingPostLikeParityRef.current % 2 === 1) {
        schedulePostLikeCommit();
      }
    },
  });

  const schedulePostLikeCommit = () => {
    if (reactCommitDebounceRef.current) {
      clearTimeout(reactCommitDebounceRef.current);
    }
    reactCommitDebounceRef.current = setTimeout(() => {
      if (pendingPostLikeParityRef.current % 2 === 0) {
        return;
      }
      if (reactMutation.isPending) {
        schedulePostLikeCommit();
        return;
      }
      pendingPostLikeParityRef.current = 0;
      reactMutation.mutate();
    }, 200);
  };

  const bookmarkMutation = useMutation<PostBookmarkSummary, Error>({
    mutationFn: async () => (await postApi.togglePostBookmark(postIdNumber)).data,
    onSuccess: () => {
      setBookmarkError("");
    },
    onError: (error) => {
      setLocalBookmarkState((current) =>
        current ? applyLocalBookmarkSummary(current) : current,
      );
      queryClient.setQueryData<PostBookmarkSummary>(
        ["postBookmark", postIdNumber],
        (current) => (current ? applyLocalBookmarkSummary(current) : current),
      );
      setBookmarkError(getErrorMessage(error));
    },
    onSettled: () => {
      if (pendingBookmarkParityRef.current % 2 === 1) {
        scheduleBookmarkCommit();
      }
      void Promise.all([
        queryClient.invalidateQueries({ queryKey: ["communityPosts"] }),
        queryClient.invalidateQueries({ queryKey: ["circleBoardPosts"] }),
        queryClient.invalidateQueries({ queryKey: ["communitySidebar"] }),
      ]);
    },
  });

  const scheduleBookmarkCommit = () => {
    if (bookmarkCommitDebounceRef.current) {
      clearTimeout(bookmarkCommitDebounceRef.current);
    }
    bookmarkCommitDebounceRef.current = setTimeout(() => {
      if (pendingBookmarkParityRef.current % 2 === 0) {
        return;
      }
      if (bookmarkMutation.isPending) {
        scheduleBookmarkCommit();
        return;
      }
      pendingBookmarkParityRef.current = 0;
      bookmarkMutation.mutate();
    }, 200);
  };

  const pinMutation = useMutation<boolean, Error, void, { prev?: PostResponse }>({
    mutationFn: async () => (await postApi.toggleNoticePin(postIdNumber)).data,
    onMutate: async () => {
      const postDetailKey = ["postDetail", kind, postIdNumber] as const;
      await queryClient.cancelQueries({ queryKey: postDetailKey });
      const prev = queryClient.getQueryData<PostResponse>(postDetailKey);
      queryClient.setQueryData<PostResponse>(postDetailKey, (current) => {
        if (!current) {
          return current;
        }
        const nextPinned = !(current.pinned ?? false);
        return {
          ...current,
          pinned: nextPinned,
          pinnedAt: nextPinned ? new Date().toISOString() : null,
        };
      });
      return { prev };
    },
    onError: (error, _vars, context) => {
      const postDetailKey = ["postDetail", kind, postIdNumber] as const;
      if (context?.prev) {
        queryClient.setQueryData(postDetailKey, context.prev);
      }
      window.alert(getErrorMessage(error));
    },
    onSettled: () => {
      void Promise.all([
        queryClient.invalidateQueries({ queryKey: ["postDetail", kind, postIdNumber] }),
        queryClient.invalidateQueries({ queryKey: ["communityPosts"] }),
      ]);
    },
  });

  const backPath =
    kind === "notice" ? postRoutes.noticeBase : postRoutes.freeBase;
  const locationState = location.state as { from?: string; focusReplyId?: number } | null;
  const stateFrom = locationState?.from;
  const initialFocusReplyId = parseFocusReplyId(locationState?.focusReplyId);
  const resolvedBackPath =
    typeof stateFrom === "string" && stateFrom.length > 0 ? stateFrom : backPath;
  const boardTitle = kind === "notice" ? "공지게시판" : "자유게시판";
  const editPath =
    kind === "notice"
      ? postRoutes.noticeEdit(postIdNumber)
      : postRoutes.freeEdit(postIdNumber);

  const react = () => {
    if (!data) return;
    if (!isLoggedIn) {
      window.alert("로그인 후 좋아요를 누를 수 있습니다.");
      navigate("/users/login");
      return;
    }

    setIsLikeAnimating(false);
    requestAnimationFrame(() => setIsLikeAnimating(true));
    if (reactAnimationResetRef.current) {
      clearTimeout(reactAnimationResetRef.current);
    }
    reactAnimationResetRef.current = setTimeout(() => {
      setIsLikeAnimating(false);
    }, 500);
    const postDetailKey = ["postDetail", kind, postIdNumber] as const;
    setReactionError("");
    setLocalPostReaction((current) =>
      current ? applyLocalReactionSummary(current) : current,
    );
    queryClient.setQueryData<PostResponse>(postDetailKey, (current) =>
      current ? applyLocalPostReaction(current) : current,
    );
    pendingPostLikeParityRef.current = (pendingPostLikeParityRef.current + 1) % 2;
    schedulePostLikeCommit();
  };

  const removePost = async () => {
    if (!data) return;
    if (!window.confirm("게시글을 삭제하시겠습니까?")) return;
    try {
      if (kind === "notice") {
        await postApi.deleteNoticePost(data.postId);
      } else {
        await postApi.deleteFreePost(data.postId);
      }
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["communityPosts"] }),
        queryClient.invalidateQueries({ queryKey: ["communitySidebar"] }),
      ]);
      window.alert("게시글이 삭제되었습니다.");
      navigate(backPath);
    } catch (e) {
      window.alert(getErrorMessage(e));
    }
  };

  const handleSidebarBoardSelect = (board: CommunityBoardFilter) => {
    setSidebarBoard(board);
    const query = board === "all" ? "" : `?board=${board}`;
    navigate(`/board${query}`);
  };

  const handleSidebarViewSelect = (
    nextView: "home" | "myPosts" | "myReplies" | "scrap",
  ) => {
    setSidebarView(nextView);
    const params = new URLSearchParams();
    if (nextView !== "home") {
      params.set("view", nextView);
    }
    if (nextView !== "scrap" && sidebarBoard !== "all") {
      params.set("board", String(sidebarBoard));
    }
    navigate(`/board${params.toString() ? `?${params.toString()}` : ""}`);
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
      ["postBookmark", postIdNumber],
      (current) => (current ? applyLocalBookmarkSummary(current) : { bookmarked: true }),
    );
    pendingBookmarkParityRef.current = (pendingBookmarkParityRef.current + 1) % 2;
    scheduleBookmarkCommit();
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

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f7f7f8" }}>
      <Navbar />
      <BoardSectionHeader
        title={boardTitle}
      />
      <main style={{ maxWidth: 1200, margin: "0 auto", padding: "24px 16px" }}>
        <section className="board-community-layout">
          <CommunityLeftSidebar
            selectedView={sidebarView}
            onSelectView={handleSidebarViewSelect}
            selectedBoard={sidebarBoard}
            onSelectBoard={handleSidebarBoardSelect}
          />
          <section>
            {showPostLoading && <BoardDetailSkeleton />}
            {error && <p style={{ color: "#dc2626" }}>{error}</p>}
            {bookmarkError && <p style={{ color: "#dc2626" }}>{bookmarkError}</p>}

            {data && (
              <>
                <PostDetailArticleCard
                  post={data}
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
                      canEdit={canEdit}
                      canDelete={canEdit}
                      canReport={isLoggedIn && !canEdit}
                      canPin={kind === "notice" && isAdmin}
                      pinned={!!data.pinned}
                      bookmarked={isBookmarked}
                      onTogglePin={() => pinMutation.mutate()}
                      onToggleBookmark={toggleBookmark}
                      onEdit={() => navigate(editPath)}
                      onDelete={() => void removePost()}
                      onReport={() => window.alert("신고 기능은 준비 중입니다.")}
                    />
                  }
                  actionSection={
                    <div className="post-detail-engagement">
                      {kind !== "notice" && (
                        <button
                          className={`post-detail-like-button ${liked ? "on" : ""} ${
                            isLikeAnimating ? "pulse" : ""
                          } ${
                            !isLoggedIn ? "disabled" : ""
                          }`}
                          type="button"
                          onClick={() => void react()}
                          aria-pressed={liked}
                          aria-label={liked ? "좋아요 취소" : "좋아요"}
                        >
                          <Heart
                            size={20}
                            strokeWidth={2}
                            fill={
                              liked
                                ? "currentColor"
                                : "none"
                            }
                            aria-hidden="true"
                          />
                          <span className="post-detail-like-count">
                            {localPostReaction?.likeCount ?? data.likeCount}
                          </span>
                        </button>
                      )}
                      <span className="post-detail-reply-count">
                        <CommentBubbleIcon size={20} strokeWidth={1.8} />
                        <span className="post-detail-reply-value">{displayReplyCount}</span>
                      </span>
                      {reactionError && (
                        <p className="post-detail-reaction-error">
                          {reactionError}
                        </p>
                      )}
                    </div>
                  }
                />

                <section className="reply-section">
                  <h3 className="reply-section-title">
                <CommentBubbleIcon size={20} strokeWidth={1.8} color="#111827" />
                댓글 {displayReplyCount}개
                  </h3>
                  <p className="reply-section-subtitle">
                    의견을 남기고 대화를 이어가 보세요.
                  </p>
                  <ReplyForm
                    postId={postIdNumber}
                    variant="panel"
                    currentUserName={user?.nickname}
                    onRequireLogin={() => navigate("/users/login")}
                    onSubmitReply={(content) =>
                      create({ postId: postIdNumber, content })
                    }
                    canWrite={isLoggedIn}
                    onSuccess={(createdReplyId) => {
                      if (createdReplyId) {
                        setFocusReplyId(createdReplyId);
                      }
                      void refreshReplies(true, false);
                    }}
                  />
                  {replySubmitError && (
                    <p style={{ color: "#dc2626" }}>{replySubmitError}</p>
                  )}
                  {showReplyLoading && <ReplyListSkeleton count={4} />}
                  {replyError && <p style={{ color: "#dc2626" }}>{replyError}</p>}
                  {!replyLoading && !replyError && (
                    <ReplyList
                      postId={postIdNumber}
                      tree={tree}
                      hasMore={hasMoreReplies}
                      loadingMore={replyLoadingMore}
                      onLoadMore={loadMore}
                      currentUserPublicId={user?.publicId}
                      currentUserName={user?.nickname}
                      isAdmin={!!isAdmin}
                      canWrite={canCreateReply}
                      canDeleteAsAdmin
                      onUpdate={(replyId, content) =>
                        update({ postId: postIdNumber, replyId, content }).then(
                          () => refreshReplies(false),
                        )
                      }
                      onDelete={(replyId) =>
                        remove({ postId: postIdNumber, replyId }).then(() =>
                          refreshReplies(false),
                        )
                      }
                      onCreateChild={(content, targetReplyId, expandParentId) =>
                        create({
                          postId: postIdNumber,
                          content,
                          parentId: targetReplyId,
                        }).then(async (createdReplyId) => {
                          setAutoExpandParentId(expandParentId);
                          setFocusReplyId(createdReplyId);
                          await refreshReplies(true, false);
                        })
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
          </section>
          <CommunityRightSidebar />
        </section>
      </main>
      <Footer />
    </div>
  );
}


