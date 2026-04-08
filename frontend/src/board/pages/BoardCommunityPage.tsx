import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Heart, Pin, RefreshCcw, Settings, Trash2 } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Navbar from "../../common/layout/Navbar";
import Footer from "../../common/layout/Footer";
import BoardSectionHeader from "../../common/components/BoardSectionHeader";
import { postRoutes } from "../../post/routes/postRoutes";
import CommunityLeftSidebar, {
  type CommunityBoardFilter,
  type CommunityView,
} from "../components/CommunityLeftSidebar";
import CommunityRightSidebar from "../components/CommunityRightSidebar";
import CommunityPinnedPreviewList from "../components/CommunityPinnedPreviewList";
import CommunityBoardToolbar from "../components/CommunityBoardToolbar";
import CommunityListState from "../components/CommunityListState";
import GlobalPinnedPreviewSection from "../components/GlobalPinnedPreviewSection";
import BoardPendingPanel from "../components/BoardPendingPanel";
import BoardPostList from "../components/BoardPostList";
import BoardEditableTitle from "../components/BoardEditableTitle";
import CommunityPostListSkeleton from "../components/CommunityPostListSkeleton";
import {
  ActivityFeedListSkeleton,
  BoardMenuSkeleton,
} from "../components/BoardSectionSkeletons";
import CommunityProfileCard, {
  type CommunityProfileQuickView,
} from "../components/CommunityProfileCard";
import MoaPaginate from "../../admin/component/Moapaginate";
import "./boardCommunity.css";
import "../../post/styles/postDetail.css";
import { postApi } from "../../post/api/postApi";
import { globalBoardApi } from "../../api/globalBoardApi";
import { circleBoardApi } from "../../api/circleBoardApi";
import type {
  CommunityMyReply,
  PostResponse,
  PostSearchHit,
  PostSearchTarget,
} from "../../post/types/postTypes";
import {
  NOTICE_CATEGORY_BADGE_PALETTE,
  NOTICE_CATEGORY_LABEL,
  type NoticeCategory,
} from "../../post/constants/noticeCategory";
import CommunityActivityFeedCard from "../../post/components/CommunityActivityFeedCard";
import PostActionMenu from "../../post/components/PostActionMenu";
import { useAuthStore } from "../../store/authStore";
import { getErrorMessage } from "../../common/utils/errorMessage";
import type { BoardResponse } from "../types/boardTypes";
import { openReportForm } from "../../common/utils/openReportForm";
import { useDelayedLoading } from "../../common/hooks/useDelayedLoading";
import { useInfiniteScroll } from "../../admin/hooks/useInfiniteScroll";

interface CommunityPostItem {
  postId: number;
  boardName: "공지사항" | "자유게시판";
  boardLabel: string;
  title: string;
  noticeCategory?: NoticeCategory | null;
  authorName: string;
  likeCount: number;
  viewCount: number;
  replyCount: number;
  pinned?: boolean;
  pinnedAt?: string | null;
  createDate: string;
  href: string;
}

interface CommunityReplyItem {
  replyId: number;
  boardName: "공지사항" | "자유게시판";
  boardLabel: string;
  postTitle: string;
  content: string;
  likeCount: number;
  createDate: string;
  href: string;
}

type CommunityTopTab = "board" | "activity";

const toDateLabel = (value: string) => {
  const d = new Date(value);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}.${m}.${day}`;
};

const COMMUNITY_POST_TITLE_MAX_CHARS = 42;
const COMMUNITY_PAGE_SIZE = 15;
const ACTIVITY_INITIAL_VISIBLE_COUNT = 10;
const ACTIVITY_LOAD_MORE_COUNT = 10;
const ACTIVITY_SCROLL_TRIGGER_PX = 240;
const REACTION_COMMIT_DEBOUNCE_MS = 300;

const truncateByCharCount = (value: string, maxChars: number) => {
  const chars = Array.from(value ?? "");
  if (chars.length <= maxChars) {
    return value;
  }
  return `${chars.slice(0, maxChars).join("")}...`;
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

const isCircleMemberOnlyError = (error: unknown) => {
  const status = (error as { response?: { status?: number } })?.response?.status;
  const data = (error as { response?: { data?: { message?: string } | string } })?.response?.data;
  const message = typeof data === "string" ? data : data?.message ?? "";
  return status === 403 && (message.includes("[CIRCLE]") || message.includes("멤버만"));
};

const compareCommunityPosts = (a: CommunityPostItem, b: CommunityPostItem) => {
  const pinnedDiff = Number(!!b.pinned) - Number(!!a.pinned);
  if (pinnedDiff !== 0) {
    return pinnedDiff;
  }
  const pinnedAtDiff =
    new Date(b.pinnedAt ?? "").getTime() - new Date(a.pinnedAt ?? "").getTime();
  if (pinnedAtDiff !== 0) {
    return pinnedAtDiff;
  }
  return new Date(b.createDate).getTime() - new Date(a.createDate).getTime();
};

const parseCommunityBoardFilter = (value: string | null): CommunityBoardFilter => {
  if (value === "all" || value === "notice" || value === "free") {
    return value;
  }
  const asNumber = Number(value);
  if (Number.isInteger(asNumber) && asNumber > 0) {
    return asNumber;
  }
  return "all";
};

const parsePageNumber = (value: string | null) => {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1) {
    return 1;
  }
  return parsed;
};

export default function BoardCommunityPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { isLoggedIn, user } = useAuthStore();
  const isAdmin = user?.userRole === "ADMIN";
  const [view, setView] = useState<CommunityView>("home");
  const [activityView, setActivityView] = useState<CommunityProfileQuickView>("home");
  const [activityReactionByPostId, setActivityReactionByPostId] = useState<
    Record<number, { liked: boolean; likeCount: number; error?: string }>
  >({});
  const [activityLikeAnimatingByPostId, setActivityLikeAnimatingByPostId] = useState<Record<number, boolean>>({});
  const [activityBookmarkByPostId, setActivityBookmarkByPostId] = useState<
    Record<number, { bookmarked: boolean }>
  >({});
  const [activityEditMode, setActivityEditMode] = useState(false);
  const [activityStagedDeletes, setActivityStagedDeletes] = useState<Record<number, PostResponse>>({});
  const [isApplyingActivityEdits, setIsApplyingActivityEdits] = useState(false);
  const [topTab, setTopTab] = useState<CommunityTopTab>("board");
  const [forceTopTabSkeleton, setForceTopTabSkeleton] = useState(true);
  const [boardFilter, setBoardFilter] = useState<CommunityBoardFilter>("all");
  const [searchParams, setSearchParams] = useSearchParams();
  const [keyword, setKeyword] = useState("");
  const [debouncedKeyword, setDebouncedKeyword] = useState("");
  const [searchType, setSearchType] = useState<"all" | "title" | "content">("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [visibleActivityPostCount, setVisibleActivityPostCount] = useState(ACTIVITY_INITIAL_VISIBLE_COUNT);
  const [visibleActivityReplyCount, setVisibleActivityReplyCount] = useState(ACTIVITY_INITIAL_VISIBLE_COUNT);
  const [editMode, setEditMode] = useState(false);
  const [pinAnimatingPostId, setPinAnimatingPostId] = useState<number | null>(null);
  const [localPinOverrides, setLocalPinOverrides] = useState<
    Record<number, { pinned: boolean; pinnedAt: string | null }>
  >({});
  const [serverPinSnapshot, setServerPinSnapshot] = useState<
    Record<number, { pinned: boolean; pinnedAt: string | null }>
  >({});
  const [pinDraftPosts, setPinDraftPosts] = useState<
    Record<
      number,
      Pick<
        CommunityPostItem,
        "postId" | "boardName" | "title" | "noticeCategory" | "authorName" | "createDate" | "href"
      >
    >
  >({});
  const [stagedDeletes, setStagedDeletes] = useState<Record<number, CommunityPostItem>>({});
  const [isApplyingEdits, setIsApplyingEdits] = useState(false);
  const [isInlineBoardTitleEditing, setIsInlineBoardTitleEditing] = useState(false);
  const [inlineBoardTitleDraft, setInlineBoardTitleDraft] = useState("");
  const [boardNameDrafts, setBoardNameDrafts] = useState<Record<"NOTICE" | "FREE", string>>({
    NOTICE: "공지사항",
    FREE: "자유게시판",
  });
  const [boardStagedDeletes, setBoardStagedDeletes] = useState<Record<"NOTICE" | "FREE", boolean>>({
    NOTICE: false,
    FREE: false,
  });
  const [boardStagedCreates, setBoardStagedCreates] = useState<Record<"NOTICE" | "FREE", boolean>>({
    NOTICE: false,
    FREE: false,
  });
  const [boardStagedCustomCreates, setBoardStagedCustomCreates] = useState<string[]>([]);
  const [isReindexing, setIsReindexing] = useState(false);
  const pinAnimationResetRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const activityLikeAnimationResetRef = useRef<Record<number, ReturnType<typeof setTimeout>>>({});
  const activityReactionCommitDebounceRef = useRef<Record<number, ReturnType<typeof setTimeout>>>({});
  const activityBookmarkCommitDebounceRef = useRef<Record<number, ReturnType<typeof setTimeout>>>({});
  const activityReactionInFlightRef = useRef<Record<number, boolean>>({});
  const activityBookmarkInFlightRef = useRef<Record<number, boolean>>({});
  const activityReactionDesiredRef = useRef<Record<number, boolean>>({});
  const activityBookmarkDesiredRef = useRef<Record<number, boolean>>({});
  const activityReactionSyncedRef = useRef<Record<number, { liked: boolean; likeCount: number }>>({});
  const activityBookmarkSyncedRef = useRef<Record<number, boolean>>({});

  useEffect(() => {
    setBoardFilter(parseCommunityBoardFilter(searchParams.get("board")));
  }, [searchParams]);

  useEffect(() => {
    const tab = searchParams.get("tab");
    setTopTab(tab === "activity" ? "activity" : "board");
  }, [searchParams]);

  useEffect(() => {
    if (topTab === "activity") {
      return;
    }
    setActivityEditMode(false);
    setActivityStagedDeletes({});
  }, [topTab]);

  useEffect(() => {
    if (activityView !== "myReplies") {
      return;
    }
    setActivityEditMode(false);
    setActivityStagedDeletes({});
  }, [activityView]);

  useEffect(() => {
    const viewParam = searchParams.get("view");
    if (viewParam === "scrap" || viewParam === "myPosts" || viewParam === "myReplies") {
      setView(viewParam);
      return;
    }
    setView("home");
  }, [searchParams]);

  useEffect(() => {
    const timerId = setTimeout(() => {
      setDebouncedKeyword(keyword.trim());
    }, 300);
    return () => {
      clearTimeout(timerId);
    };
  }, [keyword]);

  useEffect(() => {
    const urlPage = parsePageNumber(searchParams.get("page"));
    if (urlPage !== currentPage) {
      setCurrentPage(urlPage);
    }
  }, [currentPage, searchParams]);

  const { data: globalBoards = [], isPending: globalBoardsPending } = useQuery<BoardResponse[]>({
    queryKey: ["globalBoards"],
    queryFn: async () => (await globalBoardApi.getBoards()).data,
  });
  const delayedGlobalBoardMenuSkeleton = useDelayedLoading(globalBoardsPending, 0, 300);

  const globalBoardNameById = useMemo(
    () => new Map<number, string>(globalBoards.map((board) => [board.boardId, board.name])),
    [globalBoards],
  );

  const resolveBoardLabel = (boardType: "NOTICE" | "FREE" | "CIRCLE" | undefined, boardId?: number) => {
    if (boardId && globalBoardNameById.has(boardId)) {
      return globalBoardNameById.get(boardId) ?? "게시판";
    }
    if (boardType === "NOTICE") {
      return "공지사항";
    }
    if (boardType === "FREE") {
      return "자유게시판";
    }
    return "게시판";
  };

  const canFetchCommunityPosts =
    topTab === "board" &&
    !((view === "scrap" || view === "myPosts" || view === "myReplies") && !isLoggedIn);

  const effectiveKeyword = debouncedKeyword.length === 1 ? "" : debouncedKeyword;

  const communityQueryKey = ["communityPosts", view, boardFilter, effectiveKeyword, searchType, isLoggedIn] as const;

  const { data: posts = [], isPending, isFetching, isError } = useQuery<Array<CommunityPostItem | CommunityReplyItem>>({
    queryKey: communityQueryKey,
    enabled: canFetchCommunityPosts,
    refetchOnWindowFocus: false,
    queryFn: async () => {
      const targetMap: Record<"all" | "title" | "content", PostSearchTarget> = {
        all: "ALL",
        title: "TITLE",
        content: "CONTENT",
      };
      const mapFromPost = (post: PostResponse, boardName: "공지사항" | "자유게시판", boardLabel: string) => ({
        postId: post.postId,
        boardName,
        boardLabel,
        title: post.title,
        noticeCategory: post.noticeCategory ?? null,
        authorName: post.authorName,
        likeCount: post.likeCount,
        viewCount: post.viewCount,
        replyCount: post.replyCount,
        pinned: post.pinned ?? false,
        pinnedAt: post.pinnedAt ?? null,
        createDate: post.createDate,
        href: boardName === "공지사항" ? postRoutes.noticeDetail(post.postId) : postRoutes.freeDetail(post.postId),
      });

      const boardParam: "all" | "notice" | "free" = view === "scrap"
        ? "all"
        : boardFilter === "notice" || boardFilter === "free"
          ? boardFilter
          : "all";
      const boardIdParam = typeof boardFilter === "number" ? boardFilter : undefined;

      if (view === "scrap" || view === "myPosts" || view === "myReplies") {
        if (!isLoggedIn) {
          return [];
        }
        const personalParams = {
          board: boardParam,
          boardId: boardIdParam,
          q: effectiveKeyword || undefined,
          target: targetMap[searchType],
        };
        if (view === "myReplies") {
          const data = (await postApi.getMyCommunityRepliedPosts(personalParams)).data;
          return data
            .map((reply: CommunityMyReply) => {
              const boardName = reply.boardType === "NOTICE" ? "공지사항" as const : "자유게시판" as const;
              const boardLabel = reply.boardName || resolveBoardLabel(reply.boardType, reply.boardId);
              return {
                replyId: reply.replyId,
                boardName,
                boardLabel,
                postTitle: reply.postTitle,
                content: reply.content,
                likeCount: reply.likeCount,
                createDate: reply.createDate,
                href: reply.boardType === "NOTICE"
                  ? postRoutes.noticeDetail(reply.postId)
                  : postRoutes.freeDetail(reply.postId),
              };
            })
            .sort((a, b) => new Date(b.createDate).getTime() - new Date(a.createDate).getTime());
        }
        const data =
          view === "scrap"
            ? (await postApi.getMyCommunityBookmarkedPosts(personalParams)).data
            : view === "myPosts"
              ? (await postApi.getMyCommunityPosts(personalParams)).data
              : [];
        return data
          .filter((post: PostResponse) => post.boardType === "NOTICE" || post.boardType === "FREE")
          .map((post: PostResponse) => {
            const boardName = boardFilter === "notice"
              ? "공지사항"
              : boardFilter === "free"
                ? "자유게시판"
                : post.boardType === "NOTICE"
                  ? "공지사항"
                  : "자유게시판";
            const boardLabel = resolveBoardLabel(post.boardType, post.boardId);
            return mapFromPost(post, boardName, boardLabel);
          })
          .sort(compareCommunityPosts);
      }

      if (!effectiveKeyword) {
        const { data } =
          boardIdParam !== undefined
            ? await postApi.getCommunityPostsByBoardId(boardIdParam)
            : await postApi.getCommunityPosts(boardParam);
        return data
          .filter((post: PostResponse) => post.boardType === "NOTICE" || post.boardType === "FREE")
          .map((post: PostResponse) => {
            const boardName = boardFilter === "notice"
              ? "공지사항"
              : boardFilter === "free"
                ? "자유게시판"
                : post.boardType === "NOTICE"
                  ? "공지사항"
                  : "자유게시판";
            const boardLabel = resolveBoardLabel(post.boardType, post.boardId);
            return mapFromPost(post, boardName, boardLabel);
          })
          .sort(compareCommunityPosts);
      }

      const boardType = boardFilter === "notice"
        ? "NOTICE"
        : boardFilter === "free"
          ? "FREE"
          : undefined;

      const { data } = await postApi.searchPosts({
        q: effectiveKeyword,
        target: targetMap[searchType],
        boardType,
        boardId: boardIdParam,
        page: 1,
        size: 100,
      });

      return data.hits
        .filter((hit: PostSearchHit) => hit.boardType === "NOTICE" || hit.boardType === "FREE")
        .map((hit: PostSearchHit) => ({
          postId: hit.postId,
          boardName: hit.boardType === "NOTICE" ? "공지사항" as const : "자유게시판" as const,
          boardLabel: resolveBoardLabel(hit.boardType, hit.boardId),
          title: hit.title,
          authorName: hit.authorName,
          likeCount: hit.likeCount,
          viewCount: hit.viewCount,
          replyCount: hit.replyCount,
          pinned: false,
          pinnedAt: null,
          createDate: hit.createDate,
          href: hit.boardType === "NOTICE"
            ? postRoutes.noticeDetail(hit.postId)
            : postRoutes.freeDetail(hit.postId),
        }))
        .sort((a, b) => new Date(b.createDate).getTime() - new Date(a.createDate).getTime());
    },
  });

  const {
    data: activityPosts = [],
    isPending: activityPending,
    isFetching: activityFetching,
    isError: activityError,
  } = useQuery<PostResponse[]>({
    queryKey: ["communityActivitiesFeed"],
    enabled: topTab === "activity" && activityView === "home",
    refetchOnWindowFocus: false,
    staleTime: 60_000,
    queryFn: async () => (await postApi.getCommunityActivities({ size: 120 })).data,
  });

  const {
    data: myActivityPosts = [],
    isPending: myActivityPostsPending,
    isFetching: myActivityPostsFetching,
    isError: myActivityPostsError,
  } = useQuery<PostResponse[]>({
    queryKey: ["communityActivitiesFeed", "myPosts"],
    enabled: topTab === "activity" && activityView === "myPosts" && isLoggedIn,
    refetchOnWindowFocus: false,
    staleTime: 60_000,
    queryFn: async () => (await postApi.getMyCommunityActivityPosts()).data,
  });

  const {
    data: myActivityReplies = [],
    isPending: myActivityRepliesPending,
    isFetching: myActivityRepliesFetching,
    isError: myActivityRepliesError,
  } = useQuery<CommunityMyReply[]>({
    queryKey: ["communityActivitiesFeed", "myReplies"],
    enabled: topTab === "activity" && activityView === "myReplies" && isLoggedIn,
    refetchOnWindowFocus: false,
    staleTime: 60_000,
    queryFn: async () => (await postApi.getMyCommunityActivityReplies()).data,
  });

  const {
    data: myActivityBookmarks = [],
    isPending: myActivityBookmarksPending,
    isFetching: myActivityBookmarksFetching,
    isError: myActivityBookmarksError,
  } = useQuery<PostResponse[]>({
    queryKey: ["communityActivitiesFeed", "bookmarks"],
    enabled: topTab === "activity" && activityView === "scrap" && isLoggedIn,
    refetchOnWindowFocus: false,
    staleTime: 60_000,
    queryFn: async () => (await postApi.getMyCommunityActivityBookmarkedPosts()).data,
  });

  const activityPostItems = useMemo(() => {
    if (activityView === "myPosts") {
      return myActivityPosts;
    }
    if (activityView === "scrap") {
      return myActivityBookmarks;
    }
    if (activityView === "home") {
      return activityPosts;
    }
    return [];
  }, [activityPosts, activityView, myActivityBookmarks, myActivityPosts]);

  const activityReplyItems = useMemo(
    () => (activityView === "myReplies" ? myActivityReplies : []),
    [activityView, myActivityReplies],
  );

  const activityLoading = useMemo(() => {
    if (!isLoggedIn && activityView !== "home") {
      return false;
    }
    if (activityView === "myPosts") {
      return myActivityPostsPending || myActivityPostsFetching;
    }
    if (activityView === "myReplies") {
      return myActivityRepliesPending || myActivityRepliesFetching;
    }
    if (activityView === "scrap") {
      return myActivityBookmarksPending || myActivityBookmarksFetching;
    }
    return activityPending || activityFetching;
  }, [
    activityFetching,
    activityPending,
    activityView,
    isLoggedIn,
    myActivityBookmarksFetching,
    myActivityBookmarksPending,
    myActivityPostsFetching,
    myActivityPostsPending,
    myActivityRepliesFetching,
    myActivityRepliesPending,
  ]);

  const activityErrorMessage = useMemo(() => {
    if (!isLoggedIn && activityView !== "home") {
      return "";
    }
    if (activityView === "myPosts") {
      return myActivityPostsError ? "내 모임 활동 게시글을 불러오지 못했습니다." : "";
    }
    if (activityView === "myReplies") {
      return myActivityRepliesError ? "내 모임 활동 댓글을 불러오지 못했습니다." : "";
    }
    if (activityView === "scrap") {
      return myActivityBookmarksError ? "스크랩한 모임 활동 게시글을 불러오지 못했습니다." : "";
    }
    return activityError ? "모임 활동 피드를 불러오지 못했습니다." : "";
  }, [
    activityError,
    activityView,
    isLoggedIn,
    myActivityBookmarksError,
    myActivityPostsError,
    myActivityRepliesError,
  ]);

  const activityEmptyText = useMemo(() => {
    if ((activityView === "myPosts" || activityView === "myReplies" || activityView === "scrap") && !isLoggedIn) {
      return "로그인 후 목록을 확인할 수 있습니다.";
    }
    if (activityView === "myPosts") {
      return "작성한 모임 활동이 없습니다.";
    }
    if (activityView === "myReplies") {
      return "작성한 모임 활동 댓글이 없습니다.";
    }
    if (activityView === "scrap") {
      return "스크랩한 모임 활동 게시글이 없습니다.";
    }
    return "공개된 모임 활동이 없습니다.";
  }, [activityView, isLoggedIn]);

  const activityPendingDeleteCount = Object.keys(activityStagedDeletes).length;
  const visibleActivityPostItems = useMemo(
    () => activityPostItems.slice(0, visibleActivityPostCount),
    [activityPostItems, visibleActivityPostCount],
  );
  const visibleActivityReplyItems = useMemo(
    () => activityReplyItems.slice(0, visibleActivityReplyCount),
    [activityReplyItems, visibleActivityReplyCount],
  );
  const hasMoreActivityPosts = visibleActivityPostCount < activityPostItems.length;
  const hasMoreActivityReplies = visibleActivityReplyCount < activityReplyItems.length;

  const loadMoreActivityPosts = useCallback(() => {
    setVisibleActivityPostCount((prev) => Math.min(prev + ACTIVITY_LOAD_MORE_COUNT, activityPostItems.length));
  }, [activityPostItems.length]);

  const loadMoreActivityReplies = useCallback(() => {
    setVisibleActivityReplyCount((prev) => Math.min(prev + ACTIVITY_LOAD_MORE_COUNT, activityReplyItems.length));
  }, [activityReplyItems.length]);

  useEffect(() => {
    setVisibleActivityPostCount(ACTIVITY_INITIAL_VISIBLE_COUNT);
    setVisibleActivityReplyCount(ACTIVITY_INITIAL_VISIBLE_COUNT);
  }, [activityView]);

  useEffect(() => {
    setVisibleActivityPostCount(ACTIVITY_INITIAL_VISIBLE_COUNT);
  }, [activityPostItems]);

  useEffect(() => {
    setVisibleActivityReplyCount(ACTIVITY_INITIAL_VISIBLE_COUNT);
  }, [activityReplyItems]);

  const resetActivityEditState = () => {
    setActivityStagedDeletes({});
  };

  const toggleActivityEditMode = () => {
    if (!isAdmin || isApplyingActivityEdits) {
      return;
    }
    if (activityEditMode && activityPendingDeleteCount > 0) {
      if (!window.confirm("저장되지 않은 삭제 대상을 되돌리고 수정모드를 종료할까요?")) {
        return;
      }
      resetActivityEditState();
    }
    setActivityEditMode((prev) => !prev);
  };

  const handleStageDeleteActivityPost = (post: PostResponse) => {
    if (!isAdmin || !activityEditMode) {
      return;
    }
    setActivityStagedDeletes((prev) => {
      const next = { ...prev };
      if (next[post.postId]) {
        delete next[post.postId];
      } else {
        next[post.postId] = post;
      }
      return next;
    });
  };

  const applyActivityEditChanges = async () => {
    if (!isAdmin || !activityEditMode || isApplyingActivityEdits || activityPendingDeleteCount === 0) {
      return;
    }
    if (!window.confirm("선택한 모임 활동 게시글을 삭제하시겠습니까?")) {
      return;
    }
    setIsApplyingActivityEdits(true);
    try {
      await Promise.all(
        Object.values(activityStagedDeletes).map((post) => {
          if (post.circleId != null && post.boardId != null) {
            return circleBoardApi.deletePost(post.circleId, post.boardId, post.postId);
          }
          if (post.boardType === "NOTICE") {
            return postApi.deleteNoticePost(post.postId);
          }
          return postApi.deleteFreePost(post.postId);
        }),
      );
      resetActivityEditState();
      setActivityEditMode(false);
      await queryClient.invalidateQueries({ queryKey: ["communityActivitiesFeed"] });
      window.alert("삭제가 적용되었습니다.");
    } catch (error) {
      window.alert(getErrorMessage(error));
    } finally {
      setIsApplyingActivityEdits(false);
    }
  };

  const handleDeleteOwnActivityPost = async (post: PostResponse) => {
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
      if (post.circleId != null && post.boardId != null) {
        await circleBoardApi.deletePost(post.circleId, post.boardId, post.postId);
      } else if (post.boardType === "NOTICE") {
        await postApi.deleteNoticePost(post.postId);
      } else {
        await postApi.deleteFreePost(post.postId);
      }

      setActivityStagedDeletes((prev) => {
        if (!prev[post.postId]) {
          return prev;
        }
        const next = { ...prev };
        delete next[post.postId];
        return next;
      });
      await queryClient.invalidateQueries({ queryKey: ["communityActivitiesFeed"] });
    } catch (error) {
      window.alert(getErrorMessage(error));
    }
  };

  const scheduleActivityReactionCommit = (postId: number) => {
    const prevTimer = activityReactionCommitDebounceRef.current[postId];
    if (prevTimer) {
      clearTimeout(prevTimer);
    }
    activityReactionCommitDebounceRef.current[postId] = setTimeout(() => {
      flushActivityReactionIntent(postId);
    }, REACTION_COMMIT_DEBOUNCE_MS);
  };

  const scheduleActivityBookmarkCommit = (postId: number) => {
    const prevTimer = activityBookmarkCommitDebounceRef.current[postId];
    if (prevTimer) {
      clearTimeout(prevTimer);
    }
    activityBookmarkCommitDebounceRef.current[postId] = setTimeout(() => {
      flushActivityBookmarkIntent(postId);
    }, REACTION_COMMIT_DEBOUNCE_MS);
  };

  const flushActivityReactionIntent = (postId: number) => {
    if (activityReactionInFlightRef.current[postId]) {
      return;
    }
    const desired = activityReactionDesiredRef.current[postId];
    const synced = activityReactionSyncedRef.current[postId];
    if (desired == null || synced == null || desired === synced.liked) {
      return;
    }
    activityReactionInFlightRef.current[postId] = true;
    void postApi.reactToPost(postId)
      .then(() => {
        const current = activityReactionSyncedRef.current[postId] ?? synced;
        const nextLiked = !current.liked;
        const nextLikeCount = Math.max(0, current.likeCount + (nextLiked ? 1 : -1));
        activityReactionSyncedRef.current[postId] = { liked: nextLiked, likeCount: nextLikeCount };
        setActivityReactionByPostId((prev) => ({
          ...prev,
          [postId]: { liked: nextLiked, likeCount: nextLikeCount, error: undefined },
        }));
      })
      .catch((e) => {
        const current = activityReactionSyncedRef.current[postId] ?? synced;
        activityReactionDesiredRef.current[postId] = current.liked;
        if (isCircleMemberOnlyError(e)) {
          handleActivityMemberOnlyAccess(postId);
        }
        setActivityReactionByPostId((prev) => ({
          ...prev,
          [postId]: {
            liked: current.liked,
            likeCount: current.likeCount,
            error: isCircleMemberOnlyError(e) ? undefined : getErrorMessage(e),
          },
        }));
      })
      .finally(() => {
        activityReactionInFlightRef.current[postId] = false;
        scheduleActivityReactionCommit(postId);
      });
  };

  const flushActivityBookmarkIntent = (postId: number) => {
    if (activityBookmarkInFlightRef.current[postId]) {
      return;
    }
    const desired = activityBookmarkDesiredRef.current[postId];
    const synced = activityBookmarkSyncedRef.current[postId];
    if (desired == null || synced == null || desired === synced) {
      return;
    }
    activityBookmarkInFlightRef.current[postId] = true;
    void postApi.togglePostBookmark(postId)
      .then(() => {
        const next = !(activityBookmarkSyncedRef.current[postId] ?? synced);
        activityBookmarkSyncedRef.current[postId] = next;
        setActivityBookmarkByPostId((prev) => ({
          ...prev,
          [postId]: { bookmarked: next },
        }));
      })
      .catch((e) => {
        const current = activityBookmarkSyncedRef.current[postId] ?? synced;
        activityBookmarkDesiredRef.current[postId] = current;
        if (isCircleMemberOnlyError(e)) {
          handleActivityMemberOnlyAccess(postId);
        }
        setActivityBookmarkByPostId((prev) => ({
          ...prev,
          [postId]: { bookmarked: current },
        }));
      })
      .finally(() => {
        activityBookmarkInFlightRef.current[postId] = false;
        scheduleActivityBookmarkCommit(postId);
      });
  };

  const handleToggleActivityReaction = (post: PostResponse) => {
    if (!isLoggedIn) {
      window.alert("로그인 후 좋아요를 누를 수 있습니다.");
      sessionStorage.setItem("postLoginRedirect", "/board?tab=activity");
      navigate("/users/login");
      return;
    }
    setActivityLikeAnimatingByPostId((prev) => ({ ...prev, [post.postId]: false }));
    requestAnimationFrame(() => {
      setActivityLikeAnimatingByPostId((prev) => ({ ...prev, [post.postId]: true }));
    });
    const prevTimer = activityLikeAnimationResetRef.current[post.postId];
    if (prevTimer) {
      clearTimeout(prevTimer);
    }
    activityLikeAnimationResetRef.current[post.postId] = setTimeout(() => {
      setActivityLikeAnimatingByPostId((prev) => ({ ...prev, [post.postId]: false }));
    }, 500);

    setActivityReactionByPostId((prev) => {
      const synced = activityReactionSyncedRef.current[post.postId] ?? {
        liked: post.myReaction === "LIKE",
        likeCount: post.likeCount,
      };
      activityReactionSyncedRef.current[post.postId] = synced;
      const current = prev[post.postId] ?? synced;
      const next = applyLocalReactionState(current);
      activityReactionDesiredRef.current[post.postId] = next.liked;
      return {
        ...prev,
        [post.postId]: { ...next, error: undefined },
      };
    });
    scheduleActivityReactionCommit(post.postId);
  };

  const handleToggleActivityBookmark = (post: PostResponse) => {
    if (!isLoggedIn) {
      window.alert("로그인 후 북마크를 사용할 수 있습니다.");
      sessionStorage.setItem("postLoginRedirect", "/board?tab=activity");
      navigate("/users/login");
      return;
    }
    setActivityBookmarkByPostId((prev) => {
      const synced = activityBookmarkSyncedRef.current[post.postId] ?? (prev[post.postId]?.bookmarked ?? false);
      activityBookmarkSyncedRef.current[post.postId] = synced;
      const current = prev[post.postId] ?? { bookmarked: synced };
      const next = applyLocalBookmarkState(current);
      activityBookmarkDesiredRef.current[post.postId] = next.bookmarked;
      return {
        ...prev,
        [post.postId]: next,
      };
    });
    scheduleActivityBookmarkCommit(post.postId);
  };

  const loading = canFetchCommunityPosts && (isPending || isFetching);
  const loadError = canFetchCommunityPosts && isError ? "게시글을 불러오지 못했습니다." : "";
  const delayedGlobalBoardListSkeleton = useDelayedLoading(loading, 0, 300);
  const delayedActivityListSkeleton = useDelayedLoading(activityLoading, 0, 300);
  const showBoardLayoutSkeleton =
    topTab === "board" && (forceTopTabSkeleton || delayedGlobalBoardMenuSkeleton);
  const showActivityLayoutSkeleton =
    topTab === "activity" && (forceTopTabSkeleton || delayedActivityListSkeleton);
  useEffect(() => {
    const shouldHandle =
      topTab === "activity" &&
      !activityLoading &&
      !delayedActivityListSkeleton &&
      (activityView === "myReplies" ? hasMoreActivityReplies : hasMoreActivityPosts);
    if (!shouldHandle) {
      return;
    }

    const maybeLoadMore = () => {
      const scrollTop = window.scrollY ?? document.documentElement.scrollTop ?? 0;
      const viewportBottom = scrollTop + window.innerHeight;
      const pageBottom = document.documentElement.scrollHeight;
      const isNearBottom = pageBottom - viewportBottom <= ACTIVITY_SCROLL_TRIGGER_PX;
      if (!isNearBottom) {
        return;
      }
      if (activityView === "myReplies") {
        loadMoreActivityReplies();
      } else {
        loadMoreActivityPosts();
      }
    };

    const onScroll = () => {
      maybeLoadMore();
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    maybeLoadMore();
    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, [
    activityLoading,
    activityView,
    delayedActivityListSkeleton,
    hasMoreActivityPosts,
    hasMoreActivityReplies,
    loadMoreActivityPosts,
    loadMoreActivityReplies,
    topTab,
  ]);
  const activityPostSentinelRef = useInfiniteScroll(
    loadMoreActivityPosts,
    topTab === "activity" &&
      !delayedActivityListSkeleton &&
      !activityLoading &&
      activityView !== "myReplies" &&
      hasMoreActivityPosts,
    "260px",
  );
  const activityReplySentinelRef = useInfiniteScroll(
    loadMoreActivityReplies,
    topTab === "activity" &&
      !delayedActivityListSkeleton &&
      !activityLoading &&
      activityView === "myReplies" &&
      hasMoreActivityReplies,
    "260px",
  );
  const showGlobalBoardMenuSkeleton = topTab === "board" && (showBoardLayoutSkeleton || delayedGlobalBoardMenuSkeleton);
  const showGlobalBoardListSkeleton = topTab === "board" && (showBoardLayoutSkeleton || delayedGlobalBoardListSkeleton);
  const activityCircleIdByPostId = useMemo(() => {
    const map: Record<number, number> = {};
    activityPostItems.forEach((post) => {
      if (typeof post.circleId === "number" && post.circleId > 0) {
        map[post.postId] = post.circleId;
      }
    });
    return map;
  }, [activityPostItems]);

  const handleActivityMemberOnlyAccess = (postId: number) => {
    const circleId = activityCircleIdByPostId[postId];
    window.alert("모임 가입 후 이용할 수 있습니다.");
    if (circleId) {
      navigate(`/circle/${circleId}`);
    }
  };

  useEffect(() => {
    setForceTopTabSkeleton(true);
    const timerId = window.setTimeout(() => {
      setForceTopTabSkeleton(false);
    }, 300);
    return () => {
      window.clearTimeout(timerId);
    };
  }, [topTab]);

  const serverPinByPostId = useMemo(() => {
    const map: Record<number, { pinned: boolean; pinnedAt: string | null }> = {};
    posts.forEach((item) => {
      if ("replyId" in item) {
        return;
      }
      map[item.postId] = {
        pinned: item.pinned ?? false,
        pinnedAt: item.pinnedAt ?? null,
      };
    });
    return map;
  }, [posts]);

  useEffect(() => {
    if (!editMode) {
      return;
    }
    const noticePosts = posts.filter(
      (item): item is CommunityPostItem => !("replyId" in item) && item.boardName === "공지사항",
    );
    if (noticePosts.length === 0) {
      return;
    }

    setLocalPinOverrides((prev) => {
      let changed = false;
      const next = { ...prev };
      noticePosts.forEach((item) => {
        if (!next[item.postId]) {
          changed = true;
          next[item.postId] = {
            pinned: item.pinned ?? false,
            pinnedAt: item.pinnedAt ?? null,
          };
        }
      });
      return changed ? next : prev;
    });

    setServerPinSnapshot((prev) => {
      let changed = false;
      const next = { ...prev };
      noticePosts.forEach((item) => {
        if (!next[item.postId]) {
          changed = true;
          next[item.postId] = {
            pinned: item.pinned ?? false,
            pinnedAt: item.pinnedAt ?? null,
          };
        }
      });
      return changed ? next : prev;
    });

    setPinDraftPosts((prev) => {
      let changed = false;
      const next = { ...prev };
      noticePosts.forEach((item) => {
        const current = next[item.postId];
        if (
          !current ||
          current.title !== item.title ||
          current.noticeCategory !== (item.noticeCategory ?? null) ||
          current.authorName !== item.authorName ||
          current.createDate !== item.createDate ||
          current.href !== item.href
        ) {
          changed = true;
          next[item.postId] = {
            postId: item.postId,
            boardName: item.boardName,
            title: item.title,
            noticeCategory: item.noticeCategory ?? null,
            authorName: item.authorName,
            createDate: item.createDate,
            href: item.href,
          };
        }
      });
      return changed ? next : prev;
    });
  }, [editMode, posts]);

  useEffect(() => {
    return () => {
      if (pinAnimationResetRef.current) {
        clearTimeout(pinAnimationResetRef.current);
      }
      Object.values(activityLikeAnimationResetRef.current).forEach((timerId) => clearTimeout(timerId));
      Object.values(activityReactionCommitDebounceRef.current).forEach((timerId) => clearTimeout(timerId));
      Object.values(activityBookmarkCommitDebounceRef.current).forEach((timerId) => clearTimeout(timerId));
    };
  }, []);

  const handleTogglePin = (postId: number) => {
    if (!isAdmin) {
      return;
    }
    setPinAnimatingPostId(postId);
    if (pinAnimationResetRef.current) {
      clearTimeout(pinAnimationResetRef.current);
    }
    pinAnimationResetRef.current = setTimeout(() => {
      setPinAnimatingPostId(null);
    }, 500);
    const sourcePost = posts.find(
      (item): item is CommunityPostItem =>
        !("replyId" in item) && item.postId === postId && item.boardName === "공지사항",
    );
    if (sourcePost) {
      setPinDraftPosts((prev) => ({
        ...prev,
        [postId]: {
          postId: sourcePost.postId,
          boardName: sourcePost.boardName,
          title: sourcePost.title,
          noticeCategory: sourcePost.noticeCategory ?? null,
          authorName: sourcePost.authorName,
          createDate: sourcePost.createDate,
          href: sourcePost.href,
        },
      }));
    }
    setLocalPinOverrides((prev) => {
      const currentPinned =
        prev[postId]?.pinned ??
        (serverPinSnapshot[postId]?.pinned ?? (serverPinByPostId[postId]?.pinned ?? false));
      const nextPinned = !currentPinned;
      return {
        ...prev,
        [postId]: {
          pinned: nextPinned,
          pinnedAt: nextPinned ? new Date().toISOString() : null,
        },
      };
    });
  };

  const handleDeletePost = (post: CommunityPostItem) => {
    if (!isAdmin || !editMode) {
      return;
    }
    setStagedDeletes((prev) => {
      const next = { ...prev };
      if (next[post.postId]) {
        delete next[post.postId];
        return next;
      }
      next[post.postId] = post;
      return next;
    });
  };

  const handleCancelStagedDelete = (postId: number) => {
    if (!isAdmin || !editMode) {
      return;
    }
    setStagedDeletes((prev) => {
      if (!prev[postId]) {
        return prev;
      }
      const next = { ...prev };
      delete next[postId];
      return next;
    });
  };

  const pendingPinDelta = useMemo(() => {
    const allPostIds = new Set<number>([
      ...Object.keys(serverPinSnapshot).map((key) => Number(key)),
      ...Object.keys(localPinOverrides).map((key) => Number(key)),
    ]);

    let delta = 0;
    allPostIds.forEach((postId) => {
      if (stagedDeletes[postId]) {
        return;
      }
      const serverPinned = serverPinSnapshot[postId]?.pinned ?? false;
      const draftPinned = localPinOverrides[postId]?.pinned ?? serverPinned;
      delta += Number(draftPinned) - Number(serverPinned);
    });
    return delta;
  }, [localPinOverrides, serverPinSnapshot, stagedDeletes]);
  const pendingDeleteCount = useMemo(
    () => Object.keys(stagedDeletes).length,
    [stagedDeletes],
  );
  const basePinnedCount = useMemo(
    () =>
      Object.values(serverPinSnapshot).filter((snapshot) => snapshot.pinned).length,
    [serverPinSnapshot],
  );
  const pinChangedCount = useMemo(
    () =>
      Object.entries(localPinOverrides).filter(([postId, draft]) => {
        const server = serverPinSnapshot[Number(postId)];
        if (!server) return false;
        return (server.pinned ?? false) !== (draft.pinned ?? false);
      }).length,
    [localPinOverrides, serverPinSnapshot],
  );
  const initialNoticeBoardName =
    globalBoards.find((item) => item.boardType === "NOTICE")?.name ?? "공지사항";
  const initialFreeBoardName =
    globalBoards.find((item) => item.boardType === "FREE")?.name ?? "자유게시판";

  const boardRenameChangeCount = useMemo(() => {
    let count = 0;
    if (
      initialNoticeBoardName.trim() !==
      (boardNameDrafts.NOTICE.trim() || "공지사항")
    ) {
      count += 1;
    }
    if (
      initialFreeBoardName.trim() !==
      (boardNameDrafts.FREE.trim() || "자유게시판")
    ) {
      count += 1;
    }
    return count;
  }, [boardNameDrafts.FREE, boardNameDrafts.NOTICE, initialFreeBoardName, initialNoticeBoardName]);
  const noticeBoardRenamed =
    initialNoticeBoardName.trim() !== (boardNameDrafts.NOTICE.trim() || "공지사항");
  const freeBoardRenamed =
    initialFreeBoardName.trim() !== (boardNameDrafts.FREE.trim() || "자유게시판");

  const boardCreateCount =
    Number(boardStagedCreates.NOTICE) +
    Number(boardStagedCreates.FREE) +
    boardStagedCustomCreates.length;
  const boardDeleteCount = Number(boardStagedDeletes.NOTICE) + Number(boardStagedDeletes.FREE);
  const boardPendingChangeCount = boardRenameChangeCount + boardCreateCount + boardDeleteCount;

  const hasPendingEditChanges =
    pinChangedCount > 0 || pendingDeleteCount > 0 || boardPendingChangeCount > 0;

  const clearEditState = () => {
    setLocalPinOverrides({});
    setServerPinSnapshot({});
    setPinDraftPosts({});
    setStagedDeletes({});
    setBoardStagedDeletes({ NOTICE: false, FREE: false });
    setBoardStagedCreates({ NOTICE: false, FREE: false });
    setBoardStagedCustomCreates([]);
    setBoardNameDrafts({
      NOTICE: noticeBoard?.name ?? "공지사항",
      FREE: freeBoard?.name ?? "자유게시판",
    });
  };

  const resetToEditInitialState = () => {
    setLocalPinOverrides((prev) => {
      const next = { ...prev };
      Object.entries(serverPinSnapshot).forEach(([postId, server]) => {
        next[Number(postId)] = {
          pinned: server.pinned ?? false,
          pinnedAt: server.pinnedAt ?? null,
        };
      });
      return next;
    });
    setStagedDeletes({});
    setBoardStagedDeletes({ NOTICE: false, FREE: false });
    setBoardStagedCreates({ NOTICE: false, FREE: false });
    setBoardStagedCustomCreates([]);
    setBoardNameDrafts({
      NOTICE: noticeBoard?.name ?? "공지사항",
      FREE: freeBoard?.name ?? "자유게시판",
    });
  };

  const toggleEditMode = () => {
    if (editMode && hasPendingEditChanges) {
      if (!window.confirm("저장되지 않은 변경사항을 되돌리고 수정모드를 종료할까요?")) {
        return;
      }
      clearEditState();
    }
    if (!editMode) {
      const initialPinnedState: Record<number, { pinned: boolean; pinnedAt: string | null }> = {};
      const initialServerSnapshot: Record<number, { pinned: boolean; pinnedAt: string | null }> = {};
      const initialDraftPosts: Record<
        number,
        Pick<
          CommunityPostItem,
          "postId" | "boardName" | "title" | "noticeCategory" | "authorName" | "createDate" | "href"
        >
      > = {};
      posts.forEach((item) => {
        if ("replyId" in item || item.boardName !== "공지사항") {
          return;
        }
        initialPinnedState[item.postId] = {
          pinned: item.pinned ?? false,
          pinnedAt: item.pinnedAt ?? null,
        };
        initialServerSnapshot[item.postId] = {
          pinned: item.pinned ?? false,
          pinnedAt: item.pinnedAt ?? null,
        };
        initialDraftPosts[item.postId] = {
          postId: item.postId,
          boardName: item.boardName,
          title: item.title,
          noticeCategory: item.noticeCategory ?? null,
          authorName: item.authorName,
          createDate: item.createDate,
          href: item.href,
        };
      });
      setLocalPinOverrides(initialPinnedState);
      setServerPinSnapshot(initialServerSnapshot);
      setPinDraftPosts(initialDraftPosts);
      setStagedDeletes({});
      setEditMode(true);
      return;
    }
    setEditMode(false);
  };

  const applyEditChanges = async () => {
    if (!isAdmin || !editMode || isApplyingEdits) {
      return;
    }
    const deleteIds = new Set(Object.keys(stagedDeletes).map((key) => Number(key)));
    const pinPostIds = Object.entries(localPinOverrides)
      .map(([postId, draft]) => ({ postId: Number(postId), draft }))
      .filter(({ postId }) => !deleteIds.has(postId))
      .filter(({ postId, draft }) => {
        const server = serverPinSnapshot[postId];
        if (!server) return false;
        return (server.pinned ?? false) !== (draft.pinned ?? false);
      })
      .map(({ postId }) => postId);

    const deleteTargets = Object.values(stagedDeletes);
    const boardDeleteTargets: number[] = [
      ...(boardStagedDeletes.NOTICE && noticeBoard ? [noticeBoard.boardId] : []),
      ...(boardStagedDeletes.FREE && freeBoard ? [freeBoard.boardId] : []),
    ];
    const boardCreateTargets: Array<{ boardType: "NOTICE" | "FREE"; name: string }> = [
      ...(boardStagedCreates.NOTICE
        ? [{ boardType: "NOTICE" as const, name: boardNameDrafts.NOTICE.trim() || "공지사항" }]
        : []),
      ...(boardStagedCreates.FREE
        ? [{ boardType: "FREE" as const, name: boardNameDrafts.FREE.trim() || "자유게시판" }]
        : []),
    ];
    const customBoardCreateTargets = boardStagedCustomCreates
      .map((name) => name.trim())
      .filter((name) => !!name);
    const boardRenameTargets: Array<{ boardId: number; name: string }> = [
      ...(!boardStagedDeletes.NOTICE &&
      noticeBoard &&
      noticeBoardRenamed
        ? [{ boardId: noticeBoard.boardId, name: boardNameDrafts.NOTICE.trim() || "공지사항" }]
        : []),
      ...(!boardStagedDeletes.FREE &&
      freeBoard &&
      freeBoardRenamed
        ? [{ boardId: freeBoard.boardId, name: boardNameDrafts.FREE.trim() || "자유게시판" }]
        : []),
    ];

    if (
      pinPostIds.length === 0 &&
      deleteTargets.length === 0 &&
      boardDeleteTargets.length === 0 &&
      boardCreateTargets.length === 0 &&
      customBoardCreateTargets.length === 0 &&
      boardRenameTargets.length === 0
    ) {
      clearEditState();
      setEditMode(false);
      return;
    }
    if (!window.confirm("변경사항을 적용하시겠습니까?")) {
      return;
    }

    setIsApplyingEdits(true);
    try {
      const pinRequests = pinPostIds.map((postId) =>
        postApi.toggleNoticePin(postId),
      );
      const deleteRequests = deleteTargets.map((post) =>
        post.boardName === "공지사항"
          ? postApi.deleteNoticePost(post.postId)
          : postApi.deleteFreePost(post.postId),
      );
      const boardDeleteRequests = boardDeleteTargets.map((boardId) =>
        globalBoardApi.deleteBoard(boardId),
      );
      const boardCreateRequests = boardCreateTargets.map((target) =>
        globalBoardApi.createBoard({
          boardType: target.boardType,
          name: target.name,
        }),
      );
      const customBoardCreateRequests = customBoardCreateTargets.map((name) =>
        globalBoardApi.createScopedBoard({
          scope: "GLOBAL",
          name,
        }),
      );
      const boardRenameRequests = boardRenameTargets.map((target) =>
        globalBoardApi.updateBoardName(target.boardId, target.name),
      );
      await Promise.all([
        ...pinRequests,
        ...deleteRequests,
        ...boardDeleteRequests,
        ...boardCreateRequests,
        ...customBoardCreateRequests,
        ...boardRenameRequests,
      ]);

      clearEditState();
      setEditMode(false);

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: communityQueryKey }),
        queryClient.invalidateQueries({ queryKey: ["globalBoards"] }),
        queryClient.invalidateQueries({ queryKey: ["communitySidebar"] }),
        queryClient.invalidateQueries({ queryKey: ["communityPinnedGlobalTop"] }),
      ]);
      window.alert("변경사항이 적용되었습니다.");
    } catch (error) {
      window.alert(getErrorMessage(error));
    } finally {
      setIsApplyingEdits(false);
    }
  };

  const handleReindexPostSearch = async () => {
    if (!isAdmin || isReindexing) {
      return;
    }

    const input = window.prompt("재색인 배치 크기(1~2000)", "500");
    if (input === null) {
      return;
    }
    const batchSize = Number(input);
    if (!Number.isInteger(batchSize) || batchSize < 1 || batchSize > 2000) {
      window.alert("배치 크기는 1~2000 사이 정수여야 합니다.");
      return;
    }

    const confirmed = window.confirm(`게시글 검색 인덱스를 재생성할까요? (batchSize=${batchSize})`);
    if (!confirmed) {
      return;
    }

    setIsReindexing(true);
    try {
      const { data } = await postApi.reindexPostSearch(batchSize);
      window.alert(`재색인 완료: ${data.indexedCount}건 (batchSize=${data.batchSize})`);
    } catch (error) {
      window.alert(getErrorMessage(error));
    } finally {
      setIsReindexing(false);
    }
  };

  const noticeBoard = useMemo(
    () => globalBoards.find((item) => item.boardType === "NOTICE") ?? null,
    [globalBoards],
  );
  const freeBoard = useMemo(
    () => globalBoards.find((item) => item.boardType === "FREE") ?? null,
    [globalBoards],
  );
  const extraGlobalBoards = useMemo(
    () =>
      globalBoards
        .filter((item) => item.boardId !== noticeBoard?.boardId && item.boardId !== freeBoard?.boardId)
        .map((item) => ({ boardId: item.boardId, label: item.name })),
    [freeBoard?.boardId, globalBoards, noticeBoard?.boardId],
  );

  useEffect(() => {
    setBoardNameDrafts({
      NOTICE: noticeBoard?.name ?? "공지사항",
      FREE: freeBoard?.name ?? "자유게시판",
    });
    setBoardStagedDeletes({ NOTICE: false, FREE: false });
    setBoardStagedCreates({ NOTICE: false, FREE: false });
    setBoardStagedCustomCreates([]);
  }, [freeBoard?.name, noticeBoard?.name]);

  const effectiveHasNoticeBoard = (!!noticeBoard && !boardStagedDeletes.NOTICE) || boardStagedCreates.NOTICE;
  const effectiveHasFreeBoard = (!!freeBoard && !boardStagedDeletes.FREE) || boardStagedCreates.FREE;
  const effectiveNoticeBoardLabel = boardNameDrafts.NOTICE.trim() || "공지사항";
  const effectiveFreeBoardLabel = boardNameDrafts.FREE.trim() || "자유게시판";
  const noticeBoardLabel = effectiveNoticeBoardLabel;
  const freeBoardLabel = effectiveFreeBoardLabel;
  useEffect(() => {
    if (boardFilter === "notice" && !effectiveHasNoticeBoard) {
      setBoardFilter("all");
      navigate("/board", { replace: true });
      return;
    }
    if (boardFilter === "free" && !effectiveHasFreeBoard) {
      setBoardFilter("all");
      navigate("/board", { replace: true });
      return;
    }
    if (typeof boardFilter === "number") {
      const exists = globalBoards.some((board) => board.boardId === boardFilter);
      if (!exists) {
        setBoardFilter("all");
        navigate("/board", { replace: true });
      }
    }
  }, [boardFilter, effectiveHasFreeBoard, effectiveHasNoticeBoard, globalBoards, navigate]);

  const boardTitle = useMemo(() => {
    if (view === "scrap") return "스크랩";
    if (view === "myPosts") return "내가 쓴 글";
    if (view === "myReplies") return "내가 쓴 댓글";
    if (typeof boardFilter === "number") {
      return globalBoardNameById.get(boardFilter) ?? "게시판";
    }
    if (boardFilter === "notice") return noticeBoardLabel;
    if (boardFilter === "free") return freeBoardLabel;
    return "전체 게시판";
  }, [boardFilter, freeBoardLabel, globalBoardNameById, noticeBoardLabel, view]);

  const isRestrictedGlobalBoard = boardFilter === "notice" || boardFilter === "free";
  const canEditBoardTitleInline =
    isAdmin &&
    editMode &&
    view === "home" &&
    (boardFilter === "notice" || boardFilter === "free") &&
    !isRestrictedGlobalBoard;

  const toBoardDisplayName = (boardName: string) =>
    boardName === "공지사항"
      ? effectiveNoticeBoardLabel
      : boardName === "자유게시판"
        ? effectiveFreeBoardLabel
        : boardName;

  const handleSidebarBoardSelect = (board: CommunityBoardFilter) => {
    const query = board === "all" ? "" : `?board=${String(board)}`;
    navigate(`/board${query}`);
  };

  const handleTopTabChange = (nextTab: CommunityTopTab) => {
    if (nextTab === "activity" && activityView !== "home") {
      setActivityView("home");
    }
    setSearchParams((prev) => {
      const params = new URLSearchParams(prev);
      if (nextTab === "activity") {
        params.set("tab", "activity");
        params.delete("view");
        params.delete("board");
        params.delete("page");
        params.delete("q");
        params.delete("type");
      } else {
        params.delete("tab");
      }
      return params;
    });
    requestAnimationFrame(() => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  };

  const handleSidebarViewSelect = (nextView: CommunityView) => {
    if (nextView === "home") {
      setView("home");
      return;
    }
    const params = new URLSearchParams();
    params.set("view", nextView);
    if (nextView !== "scrap" && boardFilter !== "all") {
      params.set("board", String(boardFilter));
    }
    navigate(`/board?${params.toString()}`);
  };

  const handleActivityViewSelect = (nextView: CommunityProfileQuickView) => {
    setActivityView(nextView);
    requestAnimationFrame(() => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  };

  const getSelectedGlobalBoardType = (): "NOTICE" | "FREE" | null => {
    if (boardFilter === "notice") return "NOTICE";
    if (boardFilter === "free") return "FREE";
    return null;
  };

  useEffect(() => {
    if (boardFilter === "all") {
      setIsInlineBoardTitleEditing(false);
      setInlineBoardTitleDraft("");
      return;
    }
    const selectedType = getSelectedGlobalBoardType();
    if (!selectedType) {
      setInlineBoardTitleDraft("");
      return;
    }
    setInlineBoardTitleDraft(
      selectedType === "NOTICE" ? effectiveNoticeBoardLabel : effectiveFreeBoardLabel,
    );
  }, [boardFilter, effectiveFreeBoardLabel, effectiveNoticeBoardLabel]);

  const openInlineRenameGlobalBoard = () => {
    if (!isAdmin || !editMode || isApplyingEdits || isRestrictedGlobalBoard) {
      return;
    }
    const selectedType = getSelectedGlobalBoardType();
    if (!selectedType) return;
    const exists =
      selectedType === "NOTICE" ? effectiveHasNoticeBoard : effectiveHasFreeBoard;
    if (!exists) return;
    setInlineBoardTitleDraft(
      selectedType === "NOTICE" ? effectiveNoticeBoardLabel : effectiveFreeBoardLabel,
    );
    setIsInlineBoardTitleEditing(true);
  };

  const handleAddGlobalBoardDraft = (name: string) => {
    if (!isAdmin || !editMode) {
      return;
    }
    const trimmedName = name.trim();
    if (!trimmedName) {
      return;
    }
    if (!effectiveHasNoticeBoard) {
      setBoardStagedCreates((prev) => ({ ...prev, NOTICE: noticeBoard ? false : true }));
      setBoardStagedDeletes((prev) => ({ ...prev, NOTICE: false }));
      setBoardNameDrafts((prev) => ({
        ...prev,
        NOTICE: trimmedName,
      }));
      return;
    }
    if (!effectiveHasFreeBoard) {
      setBoardStagedCreates((prev) => ({ ...prev, FREE: freeBoard ? false : true }));
      setBoardStagedDeletes((prev) => ({ ...prev, FREE: false }));
      setBoardNameDrafts((prev) => ({
        ...prev,
        FREE: trimmedName,
      }));
      return;
    }

    setBoardStagedCustomCreates((prev) => [...prev, trimmedName]);
  };

  const handleRenameGlobalBoard = async () => {
    if (!isAdmin || !editMode || isApplyingEdits || isRestrictedGlobalBoard) {
      return;
    }
    const selectedType = getSelectedGlobalBoardType();
    if (!selectedType) return;
    const trimmed = inlineBoardTitleDraft.trim();
    if (!trimmed) {
      setIsInlineBoardTitleEditing(false);
      return;
    }
    setBoardNameDrafts((prev) => ({
      ...prev,
      [selectedType]: trimmed,
    }));
    setIsInlineBoardTitleEditing(false);
  };

  const handleDeleteGlobalBoard = async () => {
    if (!isAdmin || !editMode || isApplyingEdits || isRestrictedGlobalBoard) {
      return;
    }
    const selectedType = getSelectedGlobalBoardType();
    if (!selectedType) return;
    if (!window.confirm("정말 삭제하시겠습니까?")) {
      return;
    }
    if (boardStagedCreates[selectedType]) {
      setBoardStagedCreates((prev) => ({ ...prev, [selectedType]: false }));
      if (boardFilter !== "all") {
        handleSidebarBoardSelect("all");
      }
      return;
    }
    setBoardStagedDeletes((prev) => ({ ...prev, [selectedType]: true }));
    if (boardFilter !== "all") {
      handleSidebarBoardSelect("all");
    }
  };

  const emptyText = useMemo(() => {
    if (effectiveKeyword) {
      return "검색 결과가 없습니다.";
    }
    if ((view === "scrap" || view === "myPosts" || view === "myReplies") && !isLoggedIn) {
      return "로그인 후 목록을 확인할 수 있습니다.";
    }
    if (view === "scrap") {
      return "스크랩한 게시글이 없습니다.";
    }
    if (view === "myPosts") {
      return "작성한 게시글이 없습니다.";
    }
    if (view === "myReplies") {
      return "작성한 댓글이 없습니다.";
    }
    return "아직 작성된 게시글이 없습니다.";
  }, [effectiveKeyword, isLoggedIn, view]);

  const emptyDescription = useMemo(() => {
    if (effectiveKeyword) {
      return "다른 검색어로 다시 시도해보세요.";
    }
    if (view === "home") {
      return "첫 게시글을 작성해 커뮤니티를 시작해보세요.";
    }
    return undefined;
  }, [effectiveKeyword, view]);

  const communityWriteHref = useMemo(() => {
    if (boardFilter === "notice") {
      return isAdmin
        ? `${postRoutes.createBase}?board=notice&fromBoard=notice`
        : `${postRoutes.createBase}?selectBoard=true&fromBoard=notice`;
    }
    if (boardFilter !== "all" && boardFilter !== "free") {
      return `${postRoutes.createBase}?board=free&fromBoard=${boardFilter}`;
    }
    return `${postRoutes.createBase}?board=free&fromBoard=${boardFilter}`;
  }, [boardFilter, isAdmin]);

  const showEmptyWriteAction =
    view === "home" &&
    !effectiveKeyword &&
    isLoggedIn &&
    !editMode;

  const boardFromPath = useMemo(
    () => `/board${boardFilter === "all" ? "" : `?board=${boardFilter}`}`,
    [boardFilter],
  );

  const communityReplyItems = useMemo(
    () => posts.filter((item): item is CommunityReplyItem => "replyId" in item),
    [posts],
  );
  const communityPostItems = useMemo(
    () => posts.filter((item): item is CommunityPostItem => !("replyId" in item)),
    [posts],
  );
  const totalItemCount = view === "myReplies" ? communityReplyItems.length : communityPostItems.length;
  const totalPages = Math.max(1, Math.ceil(totalItemCount / COMMUNITY_PAGE_SIZE));

  const pagedCommunityPostItems = useMemo(() => {
    const start = (currentPage - 1) * COMMUNITY_PAGE_SIZE;
    return communityPostItems.slice(start, start + COMMUNITY_PAGE_SIZE);
  }, [communityPostItems, currentPage]);

  const pagedCommunityReplyItems = useMemo(() => {
    const start = (currentPage - 1) * COMMUNITY_PAGE_SIZE;
    return communityReplyItems.slice(start, start + COMMUNITY_PAGE_SIZE);
  }, [communityReplyItems, currentPage]);

  const goToPage = (nextPage: number) => {
    const safeNextPage = Math.max(1, nextPage);
    setSearchParams(
      (prev) => {
        const params = new URLSearchParams(prev);
        if (safeNextPage <= 1) {
          params.delete("page");
        } else {
          params.set("page", String(safeNextPage));
        }
        return params;
      },
      { replace: true },
    );
  };

  useEffect(() => {
    if (currentPage > totalPages) {
      goToPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const formatPendingCount = (value: number) => Math.abs(value);

  const pinnedPreviewItems = useMemo(
    () =>
      Object.values(pinDraftPosts)
        .filter((item) => item.boardName === "공지사항")
        .filter((item) => !stagedDeletes[item.postId])
        .map((item) => {
          const override = localPinOverrides[item.postId];
          const server = serverPinSnapshot[item.postId];
          const effectivePinned = override?.pinned ?? (server?.pinned ?? false);
          const effectivePinnedAt =
            override?.pinnedAt ?? server?.pinnedAt ?? item.createDate;
          return {
            id: item.postId,
            title: item.title,
            noticeCategory: item.noticeCategory ?? null,
            authorName: item.authorName,
            createDateLabel: toDateLabel(item.createDate),
            href: item.href,
            effectivePinned,
            effectivePinnedAt,
          };
        })
        .filter((item) => item.effectivePinned)
        .sort(
          (a, b) =>
            new Date(b.effectivePinnedAt ?? "").getTime() - new Date(a.effectivePinnedAt ?? "").getTime(),
        )
        .map(({ id, title, noticeCategory, authorName, createDateLabel, href }) => ({
          id,
          title,
          noticeCategory,
          authorName,
          createDateLabel,
          href,
          status: "pinned" as const,
        })),
    [localPinOverrides, pinDraftPosts, serverPinSnapshot, stagedDeletes],
  );

  const deletedPreviewItems = useMemo(
    () =>
      Object.values(stagedDeletes)
        .sort((a, b) => new Date(b.createDate).getTime() - new Date(a.createDate).getTime())
        .map((item) => ({
          id: item.postId,
          title: item.title,
          noticeCategory: item.noticeCategory ?? null,
          authorName: item.authorName,
          createDateLabel: toDateLabel(item.createDate),
          href: item.href,
          status: "deleted" as const,
        })),
    [stagedDeletes],
  );

  const topPreviewItems = useMemo(
    () => [...pinnedPreviewItems, ...deletedPreviewItems],
    [deletedPreviewItems, pinnedPreviewItems],
  );

  return (
    <div
      className={`board-community-page ${isAdmin && editMode ? "is-edit-focus" : ""}`}
      style={{ minHeight: "100vh", backgroundColor: "#f7f7f8" }}
    >
      <Navbar />
      <BoardSectionHeader
        title="커뮤니티"
      />

      <main style={{ maxWidth: 1200, margin: "0 auto", padding: "24px 16px", minHeight: "calc(100vh - 220px)" }}>
        <section
          aria-label="커뮤니티 상단 탭"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "0 4px",
            borderBottom: "1px solid #e5e7eb",
            marginBottom: 20,
          }}
        >
          {[{ key: "board", label: "게시판" }, { key: "activity", label: "모임 활동" }].map((tab) => {
            const active = topTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => handleTopTabChange(tab.key as CommunityTopTab)}
                aria-current={active ? "page" : undefined}
                style={{
                  border: "none",
                  borderBottom: active ? "2px solid #5f8f7b" : "2px solid transparent",
                  background: "transparent",
                  color: active ? "#2f4f42" : "#6b7280",
                  fontSize: 15,
                  fontWeight: active ? 800 : 600,
                  cursor: "pointer",
                  padding: "12px 14px 11px",
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </section>

        {topTab === "activity" ? (
          <>
            <div className="community-sticky-gap" aria-hidden="true" />
            <section className="board-community-layout">
              {showActivityLayoutSkeleton ? (
                <>
                  <aside className="community-left-sidebar" style={{ display: "grid", gap: 12 }}>
                    <section
                      style={{
                        border: "1px solid #e5e7eb",
                        borderRadius: 14,
                        backgroundColor: "#fff",
                        padding: 16,
                        display: "grid",
                        gap: 12,
                      }}
                      aria-hidden="true"
                    >
                      <span className="community-skeleton-block community-activity-skeleton-headline" />
                      <div className="community-sidebar-skeleton-list">
                        <span className="community-skeleton-block community-sidebar-skeleton-line" />
                        <span className="community-skeleton-block community-sidebar-skeleton-line" />
                        <span className="community-skeleton-block community-sidebar-skeleton-line" />
                        <span className="community-skeleton-block community-sidebar-skeleton-line" />
                      </div>
                      <span className="community-skeleton-block" style={{ width: "100%", height: 42, borderRadius: 10 }} />
                    </section>
                  </aside>
                  <section className="community-center-column">
                    <ActivityFeedListSkeleton count={3} />
                  </section>
                  <aside className="community-right-sidebar" aria-hidden="true" />
                </>
              ) : (
                <>
                  <aside className="community-left-sidebar" style={{ display: "grid", gap: 12 }}>
                    <CommunityProfileCard
                      selectedView={activityView}
                      onSelectView={handleActivityViewSelect}
                      writeHref="/circle/my"
                      writeLabel="전체 활동"
                      onWriteClick={() => handleActivityViewSelect("home")}
                      replaceWithPending={isAdmin && activityEditMode}
                      pendingContent={
                        isAdmin && activityEditMode ? (
                          <BoardPendingPanel
                            postPinnedCount={0}
                            postDeletedCount={activityPendingDeleteCount}
                            boardCreateCount={0}
                            boardRenameCount={0}
                            boardDeleteCount={0}
                            onReset={resetActivityEditState}
                            onApply={() => void applyActivityEditChanges()}
                            resetDisabled={isApplyingActivityEdits || activityPendingDeleteCount === 0}
                            applyDisabled={isApplyingActivityEdits}
                            embedded
                          />
                        ) : undefined
                      }
                      bottomAction={
                        isAdmin && activityView !== "myReplies" ? (
                          <button
                            type="button"
                            onClick={toggleActivityEditMode}
                            className={`community-side-edit-toggle ${activityEditMode ? "active" : ""}`}
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
                    <CommunityListState
                      loading={delayedActivityListSkeleton}
                      loadingContent={<ActivityFeedListSkeleton count={3} />}
                      errorMessage={activityErrorMessage}
                      isEmpty={activityView === "myReplies" ? activityReplyItems.length === 0 : activityPostItems.length === 0}
                      emptyText={activityEmptyText}
                    >
                {activityView === "myReplies" ? (
                  <ul className="community-post-list">
                    {visibleActivityReplyItems.map((item) => (
                      <li key={`activity-reply-${item.replyId}`}>
                        <Link
                          to={
                            item.circleId != null && item.boardId != null
                              ? `/circle/${item.circleId}/board/${item.boardId}/posts/${item.postId}`
                              : "/circle"
                          }
                          state={{ from: "/board?tab=activity", focusReplyId: item.replyId }}
                          className="community-post-item-link"
                        >
                          <div className="community-post-item-body">
                            <p className="community-post-item-title">
                              <span className="community-post-item-title-text">{item.content}</span>
                              <span className="community-post-item-board">
                                · {item.boardName ?? "모임 활동"}
                              </span>
                            </p>
                            <p className="community-post-item-meta">
                              <span>원문: {truncateByCharCount(item.postTitle, COMMUNITY_POST_TITLE_MAX_CHARS)}</span>
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
                ) : (
                  <ul className="community-post-list">
                    {visibleActivityPostItems.map((post) => {
                      const circleName = post.circleName?.trim() || "모임";
                      const href =
                        post.circleId != null
                          ? `/circle/${post.circleId}/board/${post.boardId}/posts/${post.postId}`
                          : "/circle";
                      const contentImages = extractImageUrls(post.content);
                      const previewImages = post.thumbnailUrl
                        ? [post.thumbnailUrl]
                        : contentImages.length > 0
                          ? Array.from(new Set(contentImages.filter((url): url is string => !!url)))
                          : [];
                      const summary = extractPlainText(post.content);
                      const reactionState = activityReactionByPostId[post.postId] ?? {
                        liked: post.myReaction === "LIKE",
                        likeCount: post.likeCount,
                        error: undefined,
                      };
                      const bookmarkState = activityBookmarkByPostId[post.postId] ?? {
                        bookmarked: false,
                      };
                      const isOwner = user?.publicId != null && user.publicId === post.authorPublicId;
                      const canEdit = isOwner && post.circleId != null;
                      const canDeleteOwn = isOwner;
                      const canReport = isLoggedIn && !isOwner;
                      return (
                        <li
                          key={`activity-${post.postId}`}
                          className="community-activity-feed-item"
                          style={activityStagedDeletes[post.postId] ? { opacity: 0.55 } : undefined}
                        >
                          <CommunityActivityFeedCard
                            post={post}
                            circleName={circleName}
                            circleDetailHref={post.circleId != null ? `/circle/${post.circleId}` : undefined}
                            postHref={href}
                            fromState={{ from: "/board?tab=activity" }}
                            createDateLabel={toDateLabel(post.createDate)}
                            disableNavigation={activityEditMode}
                            previewImages={previewImages}
                            summary={summary}
                            liked={reactionState.liked}
                            likeCount={reactionState.likeCount}
                            isLikeAnimating={!!activityLikeAnimatingByPostId[post.postId]}
                            reactionError={reactionState.error}
                            isLoggedIn={isLoggedIn}
                            avatarColor={avatarColor(post.authorName)}
                            onToggleReaction={() => void handleToggleActivityReaction(post)}
                            headerAction={
                              <PostActionMenu
                                canEdit={canEdit}
                                canDelete={canDeleteOwn}
                                canReport={canReport}
                                bookmarked={bookmarkState.bookmarked}
                                onToggleBookmark={() => void handleToggleActivityBookmark(post)}
                                onDelete={() => void handleDeleteOwnActivityPost(post)}
                                onEdit={() => {
                                  if (post.circleId == null) return;
                                  navigate(`/circle/${post.circleId}/board/${post.boardId}/posts/${post.postId}/edit`, {
                                    state: { from: "/board?tab=activity" },
                                  });
                                }}
                                onReport={() => openReportForm("POST", post.postId)}
                              />
                            }
                            metaAction={
                              isAdmin && activityEditMode ? (
                                <button
                                  type="button"
                                  aria-label="게시글 삭제"
                                  className={`community-post-admin-action-button danger ${
                                    activityStagedDeletes[post.postId] ? "active" : ""
                                  }`}
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handleStageDeleteActivityPost(post);
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
                )}
                    {activityView === "myReplies" ? (
                      hasMoreActivityReplies ? (
                        <div ref={activityReplySentinelRef} className="h-6" />
                      ) : (
                        activityReplyItems.length > 0 && (
                          <p style={{ margin: "8px 0 0", textAlign: "center", color: "#9ca3af", fontSize: 12 }}>
                            모든 댓글을 불러왔습니다.
                          </p>
                        )
                      )
                    ) : hasMoreActivityPosts ? (
                      <div ref={activityPostSentinelRef} className="h-6" />
                    ) : (
                      activityPostItems.length > 0 && (
                        <p style={{ margin: "8px 0 0", textAlign: "center", color: "#9ca3af", fontSize: 12 }}>
                          모든 게시글을 불러왔습니다.
                        </p>
                      )
                    )}
                    </CommunityListState>
                  </section>
                  <aside className="community-right-sidebar" aria-hidden="true" />
                </>
              )}
            </section>
          </>
        ) : (
        <div>
        <div className="community-sticky-gap" aria-hidden="true" />
        <section className={`board-community-layout ${isAdmin && editMode ? "is-edit-focus" : ""}`}>
          {showBoardLayoutSkeleton ? (
            <>
              <aside className="community-left-sidebar" style={{ display: "grid", gap: 12 }}>
                <section
                  style={{
                    border: "1px solid #e5e7eb",
                    borderRadius: 14,
                    backgroundColor: "#fff",
                    padding: 16,
                    display: "grid",
                    gap: 12,
                  }}
                  aria-hidden="true"
                >
                  <span className="community-skeleton-block community-activity-skeleton-headline" />
                  <div className="community-sidebar-skeleton-list">
                    <span className="community-skeleton-block community-sidebar-skeleton-line" />
                    <span className="community-skeleton-block community-sidebar-skeleton-line" />
                    <span className="community-skeleton-block community-sidebar-skeleton-line" />
                    <span className="community-skeleton-block community-sidebar-skeleton-line" />
                  </div>
                </section>
                <BoardMenuSkeleton count={5} />
              </aside>
              <section className="community-center-column">
                <section
                  style={{
                    border: "1px solid #e5e7eb",
                    borderRadius: 12,
                    backgroundColor: "#fff",
                    padding: 14,
                    display: "grid",
                    gap: 10,
                  }}
                  aria-hidden="true"
                >
                  <span className="community-skeleton-block community-activity-skeleton-headline" />
                  <span className="community-skeleton-block community-sidebar-skeleton-line" />
                </section>
                <CommunityPostListSkeleton count={6} showBoardName={boardFilter === "all"} />
              </section>
              <aside className="community-right-sidebar" aria-hidden="true">
                <section
                  style={{
                    border: "1px solid #e5e7eb",
                    borderRadius: 14,
                    backgroundColor: "#fff",
                    padding: 14,
                    display: "grid",
                    gap: 10,
                  }}
                >
                  <span className="community-skeleton-block community-sidebar-skeleton-line" />
                  <span className="community-skeleton-block community-sidebar-skeleton-line" />
                </section>
              </aside>
            </>
          ) : (
            <>
              {showGlobalBoardMenuSkeleton ? (
                <aside className="community-left-sidebar" style={{ display: "grid", gap: 12 }}>
                  <CommunityProfileCard
                    selectedView={view}
                    onSelectView={handleSidebarViewSelect}
                    writeHref={communityWriteHref}
                  />
                  <BoardMenuSkeleton count={5} />
                </aside>
              ) : (
                <CommunityLeftSidebar
                  selectedView={view}
                  onSelectView={handleSidebarViewSelect}
                  selectedBoard={boardFilter}
                  onSelectBoard={handleSidebarBoardSelect}
                  noticeBoardLabel={noticeBoardLabel}
                  freeBoardLabel={freeBoardLabel}
                  hasNoticeBoard={effectiveHasNoticeBoard}
                  hasFreeBoard={effectiveHasFreeBoard}
                  extraBoards={extraGlobalBoards}
                  noticeChanged={noticeBoardRenamed}
                  freeChanged={freeBoardRenamed}
                  canAddBoard={isAdmin && editMode}
                  onAddBoard={handleAddGlobalBoardDraft}
                  pendingAddedBoardNames={boardStagedCustomCreates}
                  pendingPanel={
                    isAdmin && editMode ? (
                      <BoardPendingPanel
                        postPinnedCount={formatPendingCount(pendingPinDelta)}
                        postDeletedCount={formatPendingCount(pendingDeleteCount)}
                        boardCreateCount={formatPendingCount(boardCreateCount)}
                        boardRenameCount={formatPendingCount(boardRenameChangeCount)}
                        boardDeleteCount={formatPendingCount(boardDeleteCount)}
                        onReset={resetToEditInitialState}
                        onApply={() => void applyEditChanges()}
                        resetDisabled={isApplyingEdits || !hasPendingEditChanges}
                        applyDisabled={isApplyingEdits}
                        showBasePinnedCount
                        basePinnedCount={basePinnedCount}
                        embedded
                      />
                    ) : undefined
                  }
                  showEditModeToggle={isAdmin}
                  editModeActive={editMode}
                  onToggleEditMode={toggleEditMode}
                />
              )}
              <section className="community-center-column">
            <CommunityBoardToolbar
              title={boardTitle}
              titleContent={
                <BoardEditableTitle
                  title={boardTitle}
                  editable={canEditBoardTitleInline}
                  editing={isInlineBoardTitleEditing}
                  draft={inlineBoardTitleDraft}
                  busy={isApplyingEdits}
                  onDraftChange={setInlineBoardTitleDraft}
                  onStartEdit={openInlineRenameGlobalBoard}
                  onSave={() => void handleRenameGlobalBoard()}
                  onCancel={() => setIsInlineBoardTitleEditing(false)}
                  onDelete={() => void handleDeleteGlobalBoard()}
                />
              }
              searchType={searchType}
              onSearchTypeChange={(type) => setSearchType(type)}
              keyword={keyword}
              onKeywordChange={setKeyword}
              placeholder={view === "myReplies" ? "댓글/원문 제목 검색" : "게시글 검색"}
              titleAddon={
                isAdmin ? (
                  <button
                    type="button"
                    className={`community-edit-mode-button ${isReindexing ? "active" : ""}`}
                    onClick={() => void handleReindexPostSearch()}
                    disabled={isReindexing}
                    title="게시글 검색 인덱스 재색인"
                  >
                    <RefreshCcw size={14} strokeWidth={2} style={{ marginRight: 6 }} />
                    {isReindexing ? "재색인 중" : "검색 재색인"}
                  </button>
                ) : undefined
              }
            />
            {isAdmin && editMode && (
              <CommunityPinnedPreviewList
                items={topPreviewItems}
                editable
                onTogglePin={handleTogglePin}
                onCancelDelete={handleCancelStagedDelete}
              />
            )}
            {!editMode && <GlobalPinnedPreviewSection fromPath={boardFromPath} />}
            <section>
              <CommunityListState
                loading={showGlobalBoardListSkeleton}
                loadingContent={
                  <CommunityPostListSkeleton
                    count={6}
                    showBoardName={boardFilter === "all"}
                  />
                }
                errorMessage={loadError}
                isEmpty={view === "myReplies" ? pagedCommunityReplyItems.length === 0 : pagedCommunityPostItems.length === 0}
                emptyText={emptyText}
                emptyDescription={emptyDescription}
                emptyActionLabel={showEmptyWriteAction ? "게시글 작성하기" : undefined}
                onEmptyAction={
                  showEmptyWriteAction
                    ? () => {
                        navigate(communityWriteHref);
                      }
                    : undefined
                }
              >
                {view === "myReplies" ? (
                  <ul className="community-post-list">
                    {pagedCommunityReplyItems.map((item) => (
                      <li key={`reply-${item.replyId}`}>
                        <Link
                          to={item.href}
                          state={{ from: boardFromPath, focusReplyId: item.replyId }}
                          className={`community-post-item-link ${editMode ? "is-disabled" : ""}`}
                          onClick={(e) => {
                            if (editMode) {
                              e.preventDefault();
                            }
                          }}
                        >
                          <div className="community-post-item-body">
                            <p className="community-post-item-title">
                              <span className="community-post-item-title-text">{item.content}</span>
                              {boardFilter === "all" && (
                                <span className="community-post-item-board">
                                  · {toBoardDisplayName(item.boardLabel)}
                                </span>
                              )}
                            </p>
                            <p className="community-post-item-meta">
                              <span>원문: {truncateByCharCount(item.postTitle, COMMUNITY_POST_TITLE_MAX_CHARS)}</span>
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
                ) : (
                  <BoardPostList
                    items={pagedCommunityPostItems.map((item) => ({
                      postId: item.postId,
                      href: item.href,
                      linkState: { from: boardFromPath },
                      title: truncateByCharCount(item.title, COMMUNITY_POST_TITLE_MAX_CHARS),
                      boardName: item.boardLabel,
                      authorName: item.authorName,
                      viewCount: item.viewCount,
                      replyCount: item.replyCount,
                      likeCount: item.likeCount,
                      createDate: item.createDate,
                    }))}
                    disabledLinks={editMode}
                    isDeleted={(postId) => !!stagedDeletes[postId]}
                    dateLabel={toDateLabel}
                    renderLeading={(item) => {
                      const source = communityPostItems.find((post) => post.postId === item.postId);
                      if (!source) return null;
                      const effectivePinned =
                        localPinOverrides[source.postId]?.pinned ?? (source.pinned ?? false);
                      const showPinnedIndicator =
                        !isAdmin && source.boardName === "공지사항" && effectivePinned;
                      if (!showPinnedIndicator) return null;
                      return (
                        <span className="community-post-pin-indicator" aria-label="상단 고정">
                          <Pin size={14} strokeWidth={2} className="pin-icon pinned" />
                        </span>
                      );
                    }}
                    renderTitleAddon={(item) => {
                      const source = communityPostItems.find((post) => post.postId === item.postId);
                      if (!source || source.boardName !== "공지사항") return null;
                      return (
                        <span
                          className="community-post-item-category"
                          style={source.noticeCategory
                            ? {
                                borderColor: NOTICE_CATEGORY_BADGE_PALETTE[source.noticeCategory].borderColor,
                                backgroundColor:
                                  NOTICE_CATEGORY_BADGE_PALETTE[source.noticeCategory].backgroundColor,
                                color: NOTICE_CATEGORY_BADGE_PALETTE[source.noticeCategory].color,
                              }
                            : {
                                borderColor: NOTICE_CATEGORY_BADGE_PALETTE.ANNOUNCEMENT.borderColor,
                                backgroundColor: NOTICE_CATEGORY_BADGE_PALETTE.ANNOUNCEMENT.backgroundColor,
                                color: NOTICE_CATEGORY_BADGE_PALETTE.ANNOUNCEMENT.color,
                              }}
                        >
                          {source.noticeCategory ? (NOTICE_CATEGORY_LABEL[source.noticeCategory] ?? "공지") : "공지"}
                        </span>
                      );
                    }}
                    showBoardName={boardFilter === "all"}
                    boardNameFormatter={(boardName) =>
                      toBoardDisplayName(boardName)
                    }
                    hideLikeCount={(item) => {
                      const source = communityPostItems.find((post) => post.postId === item.postId);
                      return source?.boardName === "공지사항";
                    }}
                    renderAdminActions={(item) => {
                      if (!isAdmin || !editMode) return null;
                      const source = communityPostItems.find((post) => post.postId === item.postId);
                      if (!source) return null;
                      return (
                        <div className="community-post-admin-actions">
                          {source.boardName === "공지사항" && (
                            <button
                              type="button"
                              aria-label={source.pinned ? "상단 고정 해제" : "상단 고정"}
                              className="community-post-admin-action-button"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleTogglePin(source.postId);
                              }}
                            >
                              <Pin
                                size={14}
                                strokeWidth={2}
                                className={`pin-icon ${
                                  (localPinOverrides[source.postId]?.pinned ?? (source.pinned ?? false))
                                    ? "pinned"
                                    : ""
                                } ${pinAnimatingPostId === source.postId ? "pulse" : ""}`}
                              />
                              <span>고정</span>
                            </button>
                          )}
                          <button
                            type="button"
                            aria-label="게시글 삭제"
                            className={`community-post-admin-action-button danger ${
                              stagedDeletes[source.postId] ? "active" : ""
                            }`}
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleDeletePost(source);
                            }}
                          >
                            <Trash2 size={14} strokeWidth={2} />
                            <span>삭제</span>
                          </button>
                        </div>
                      );
                    }}
                  />
                )}
              </CommunityListState>
              {totalItemCount > 0 && totalPages > 1 && (
                <div className="border-moa-border mt-2 flex flex-col items-center gap-3 border-t px-6 py-5">
                  <MoaPaginate
                    pageCount={totalPages}
                    currentPage={currentPage}
                    onPageChange={({ selected }) => goToPage(selected + 1)}
                  />
                  <p className="text-moa-subtle text-xs">
                    <span className="text-moa-secondary font-semibold">{currentPage}</span> / {totalPages} 페이지
                    &nbsp;·&nbsp;총 <span className="text-moa-primary font-semibold">{totalItemCount.toLocaleString()}</span>건
                  </p>
                </div>
              )}
              </section>
              </section>
              <CommunityRightSidebar />
            </>
          )}
        </section>
        </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
