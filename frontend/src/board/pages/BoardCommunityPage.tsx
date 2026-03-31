import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useEffect, useMemo, useRef, useState } from "react";
import { Heart, Pin, Trash2 } from "lucide-react";
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
import MoaPaginate from "../../admin/component/Moapaginate";
import "./boardCommunity.css";
import { postApi } from "../../post/api/postApi";
import { globalBoardApi } from "../../api/globalBoardApi";
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
import { useAuthStore } from "../../store/authStore";
import { getErrorMessage } from "../../common/utils/errorMessage";
import type { BoardResponse } from "../types/boardTypes";

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

const toDateLabel = (value: string) => {
  const d = new Date(value);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}.${m}.${day}`;
};

const COMMUNITY_POST_TITLE_MAX_CHARS = 42;
const COMMUNITY_PAGE_SIZE = 15;

const truncateByCharCount = (value: string, maxChars: number) => {
  const chars = Array.from(value ?? "");
  if (chars.length <= maxChars) {
    return value;
  }
  return `${chars.slice(0, maxChars).join("")}...`;
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
  const [boardFilter, setBoardFilter] = useState<CommunityBoardFilter>("all");
  const [searchParams, setSearchParams] = useSearchParams();
  const [keyword, setKeyword] = useState("");
  const [debouncedKeyword, setDebouncedKeyword] = useState("");
  const [searchType, setSearchType] = useState<"all" | "title" | "content">("all");
  const [currentPage, setCurrentPage] = useState(1);
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
  const pinAnimationResetRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setBoardFilter(parseCommunityBoardFilter(searchParams.get("board")));
  }, [searchParams]);

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

  const { data: globalBoards = [] } = useQuery<BoardResponse[]>({
    queryKey: ["globalBoards"],
    queryFn: async () => (await globalBoardApi.getBoards()).data,
  });

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
    !((view === "scrap" || view === "myPosts" || view === "myReplies") && !isLoggedIn);

  const communityQueryKey = ["communityPosts", view, boardFilter, debouncedKeyword, searchType, isLoggedIn] as const;

  const { data: posts = [], isPending, isFetching, isError } = useQuery<Array<CommunityPostItem | CommunityReplyItem>>({
    queryKey: communityQueryKey,
    enabled: canFetchCommunityPosts,
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
          q: debouncedKeyword || undefined,
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

      if (!debouncedKeyword) {
        const { data } =
          boardIdParam !== undefined
            ? await postApi.getCommunityPostsByBoardId(boardIdParam)
            : await postApi.getCommunityPosts(boardParam);
        return data
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
        q: debouncedKeyword,
        target: targetMap[searchType],
        boardType,
        boardId: boardIdParam,
        page: 1,
        size: 100,
      });

      return data.hits
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

  const loading = canFetchCommunityPosts && (isPending || isFetching);
  const loadError = canFetchCommunityPosts && isError ? "게시글을 불러오지 못했습니다." : "";
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

  const canEditBoardTitleInline =
    isAdmin &&
    editMode &&
    view === "home" &&
    (boardFilter === "notice" || boardFilter === "free");

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
    if (!isAdmin || !editMode || isApplyingEdits) {
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
    if (!isAdmin || !editMode || isApplyingEdits) {
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
    if (!isAdmin || !editMode || isApplyingEdits) {
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
    return "게시글이 없습니다.";
  }, [isLoggedIn, view]);

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
        subtitle="자유게시판과 공지게시판에서 다양한 소식을 확인해보세요"
      />

      <main style={{ maxWidth: 1200, margin: "0 auto", padding: "24px 16px" }}>
        <div className="community-sticky-gap" aria-hidden="true" />
        <section className={`board-community-layout ${isAdmin && editMode ? "is-edit-focus" : ""}`}>
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
                loading={loading}
                errorMessage={loadError}
                isEmpty={view === "myReplies" ? pagedCommunityReplyItems.length === 0 : pagedCommunityPostItems.length === 0}
                emptyText={emptyText}
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
        </section>
      </main>

      <Footer />
    </div>
  );
}
