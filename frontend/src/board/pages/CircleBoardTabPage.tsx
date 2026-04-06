import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { Heart, Pin, Settings, Trash2 } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Navbar from "../../common/layout/Navbar";
import Footer from "../../common/layout/Footer";
import CircleDetailTabs from "../../common/components/CircleDetailTabs";
import CircleBoardSidebarMenu from "../components/CircleBoardSidebarMenu";
import CircleDetailBanner from "../../common/components/CircleDetailBanner";
import GlobalPinnedPreviewSection from "../components/GlobalPinnedPreviewSection";
import CommunityPinnedPreviewList from "../components/CommunityPinnedPreviewList";
import CommunityBoardToolbar from "../components/CommunityBoardToolbar";
import CommunityListState from "../components/CommunityListState";
import BoardPendingPanel from "../components/BoardPendingPanel";
import BoardPostList from "../components/BoardPostList";
import BoardEditableTitle from "../components/BoardEditableTitle";
import MoaPaginate from "../../admin/component/Moapaginate";
import { circleApi } from "../../api/circleApi";
import {
  circleBoardApi,
  type CircleBoardKind,
  type CircleBoardResponse,
} from "../../api/circleBoardApi";
import type { CircleMember, CircleResponse } from "../../circle/types/circle";
import { postApi } from "../../post/api/postApi";
import CommunityProfileCard, {
  type CommunityProfileQuickView,
} from "../components/CommunityProfileCard";
import CommunityRightSidebar from "../components/CommunityRightSidebar";
import "./boardCommunity.css";
import { useAuthStore } from "../../store/authStore";
import type {
  CommunityMyReply,
  PostResponse,
  PostSearchTarget,
} from "../../post/types/postTypes";
import { getErrorMessage } from "../../common/utils/errorMessage";

type BoardFilter = "all" | number;

type SearchType = "all" | "title" | "content";

const COMMUNITY_PAGE_SIZE = 15;
const CIRCLE_POST_TITLE_MAX_CHARS = 42;

interface CircleReplyItem {
  replyId: number;
  boardId: number;
  postId: number;
  postTitle: string;
  content: string;
  likeCount: number;
  createDate: string;
  href: string;
}

type CircleBoardListItem = PostResponse | CircleReplyItem;

const parseSearchType = (value: string | null): SearchType => {
  if (value === "title" || value === "content") {
    return value;
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

const toDateLabel = (value: string) => {
  const d = new Date(value);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}.${m}.${day}`;
};

const compareCirclePosts = (a: PostResponse, b: PostResponse) => {
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

const truncateByCharCount = (value: string, maxChars: number) => {
  const chars = Array.from(value ?? "");
  if (chars.length <= maxChars) {
    return value;
  }
  return `${chars.slice(0, maxChars).join("")}...`;
};

const isCircleReplyItem = (item: CircleBoardListItem): item is CircleReplyItem =>
  "replyId" in item;

const parseBoardFilter = (value: string | null): BoardFilter => {
  if (value === "all" || value === null || value === "") {
    return "all";
  }
  const asNumber = Number(value);
  if (Number.isInteger(asNumber) && asNumber > 0) {
    return asNumber;
  }
  return "all";
};

export default function CircleBoardTabPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const { isLoggedIn, user } = useAuthStore();

  const { circleId } = useParams<{ circleId: string }>();
  const cid = Number(circleId);
  const hasValidCircleId = !!circleId && !Number.isNaN(cid);

  const [view, setView] = useState<CommunityProfileQuickView>("home");
  const [boardFilter, setBoardFilter] = useState<BoardFilter>("all");
  const [keyword, setKeyword] = useState(() => searchParams.get("q") ?? "");
  const [debouncedKeyword, setDebouncedKeyword] = useState(() =>
    (searchParams.get("q") ?? "").trim(),
  );
  const [searchType, setSearchType] = useState<SearchType>(() =>
    parseSearchType(searchParams.get("type")),
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [editMode, setEditMode] = useState(false);
  const [isBoardEditBusy, setIsBoardEditBusy] = useState(false);
  const [isInlineBoardTitleEditing, setIsInlineBoardTitleEditing] = useState(false);
  const [inlineBoardTitleDraft, setInlineBoardTitleDraft] = useState("");
  const [boardNameDrafts, setBoardNameDrafts] = useState<Record<number, string>>({});
  const [boardStagedDeletes, setBoardStagedDeletes] = useState<Record<number, boolean>>({});
  const [boardStagedCreates, setBoardStagedCreates] = useState<
    Array<{ tempId: number; name: string; circleBoardKind: CircleBoardKind }>
  >([]);
  const [stagedPostDeletes, setStagedPostDeletes] = useState<Record<number, PostResponse>>({});

  useEffect(() => {
    if (!hasValidCircleId) {
      navigate("/circle", { replace: true });
    }
  }, [hasValidCircleId, navigate]);

  useEffect(() => {
    const value = parseBoardFilter(searchParams.get("board"));
    setBoardFilter(value);
  }, [searchParams]);

  useEffect(() => {
    const viewParam = searchParams.get("view");
    if (viewParam === "myPosts" || viewParam === "myReplies" || viewParam === "scrap") {
      setView(viewParam);
      return;
    }
    setView("home");
  }, [searchParams]);

  useEffect(() => {
    const nextKeyword = searchParams.get("q") ?? "";
    const nextSearchType = parseSearchType(searchParams.get("type"));
    setKeyword(nextKeyword);
    setSearchType(nextSearchType);
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
    const currentQ = searchParams.get("q") ?? "";
    const currentType = parseSearchType(searchParams.get("type"));
    if (currentQ === debouncedKeyword && currentType === searchType) {
      return;
    }

    setSearchParams(
      (prev) => {
        const params = new URLSearchParams(prev);
        if (debouncedKeyword) {
          params.set("q", debouncedKeyword);
        } else {
          params.delete("q");
        }
        if (searchType === "all") {
          params.delete("type");
        } else {
          params.set("type", searchType);
        }
        return params;
      },
      { replace: true },
    );
  }, [debouncedKeyword, searchParams, searchType, setSearchParams]);

  useEffect(() => {
    const urlPage = parsePageNumber(searchParams.get("page"));
    if (urlPage !== currentPage) {
      setCurrentPage(urlPage);
    }
  }, [currentPage, searchParams]);

  const { data: circle = null } = useQuery<CircleResponse | null>({
    queryKey: ["circleDetailForBoardTab", cid],
    enabled: hasValidCircleId,
    queryFn: async () => (await circleApi.getCircle(cid)).data,
  });

  const { data: boards = [] } = useQuery<CircleBoardResponse[]>({
    queryKey: ["circleBoardsForBoardTab", cid],
    enabled: hasValidCircleId,
    queryFn: async () => (await circleBoardApi.getBoards(cid)).data,
  });

  const { data: activeMembers = [] } = useQuery<CircleMember[]>({
    queryKey: ["circleActiveMembersForBoardTab", cid],
    enabled: hasValidCircleId && isLoggedIn,
    queryFn: async () => (await circleApi.getActiveMembers(cid, { page: 1, size: 200 })).data.dtoList,
  });

  const canFetchCirclePosts =
    hasValidCircleId &&
    !((view === "myPosts" || view === "myReplies" || view === "scrap") && !isLoggedIn);

  const postQueryKey = [
    "circleBoardPosts",
    cid,
    view,
    boardFilter,
    debouncedKeyword,
    searchType,
    isLoggedIn,
    user?.nickname,
  ] as const;

  const {
    data: listItems = [],
    isPending: postsPending,
    isFetching: postsFetching,
    isError: postsError,
    error: postsQueryError,
  } = useQuery<CircleBoardListItem[]>({
    queryKey: postQueryKey,
    enabled: canFetchCirclePosts,
    queryFn: async () => {
      const targetMap: Record<SearchType, PostSearchTarget> = {
        all: "ALL",
        title: "TITLE",
        content: "CONTENT",
      };
      const personalParams = {
        boardId: view === "scrap" || boardFilter === "all" ? undefined : boardFilter,
        q: debouncedKeyword || undefined,
        target: targetMap[searchType],
      };

      if (view === "myReplies" || view === "scrap" || view === "myPosts") {
        if (!isLoggedIn) {
          return [];
        }
        if (view === "myReplies") {
          const data = (await circleBoardApi.getMyRepliedPosts(cid, personalParams)).data;
          return data
            .map((reply: CommunityMyReply) => ({
              replyId: reply.replyId,
              boardId: reply.boardId ?? 0,
              postId: reply.postId,
              postTitle: reply.postTitle,
              content: reply.content,
              likeCount: reply.likeCount,
              createDate: reply.createDate,
              href: `/circle/${cid}/board/${reply.boardId}/posts/${reply.postId}`,
            }))
            .filter((reply) => reply.boardId > 0)
            .sort((a, b) => new Date(b.createDate).getTime() - new Date(a.createDate).getTime());
        }
        const data =
          view === "scrap"
            ? (await circleBoardApi.getMyBookmarkedPosts(cid, personalParams)).data
            : (await circleBoardApi.getMyPosts(cid, personalParams)).data;
        return [...data].sort(compareCirclePosts);
      }

      if (!debouncedKeyword) {
        const response =
          boardFilter === "all"
            ? await circleBoardApi.getAllPosts(cid)
            : await circleBoardApi.getBoardPosts(cid, boardFilter);
        return [...response.data].sort(compareCirclePosts);
      }

      const { data } = await postApi.searchPosts({
        q: debouncedKeyword,
        target: targetMap[searchType],
        boardType: "CIRCLE",
        boardId: boardFilter === "all" ? undefined : boardFilter,
        circleId: cid,
        page: 1,
        size: 100,
      });

      const mapped: PostResponse[] = data.hits.map((hit) => ({
        boardId: hit.boardId,
        boardType: "CIRCLE",
        postId: hit.postId,
        title: hit.title,
        content: hit.content,
        thumbnailImageId: null,
        thumbnailUrl: null,
        authorName: hit.authorName,
        authorPublicId: hit.authorPublicId,
        viewCount: hit.viewCount,
        likeCount: hit.likeCount,
        myReaction: null,
        replyCount: hit.replyCount,
        noticeCategory: null,
        pinned: false,
        pinnedAt: null,
        createDate: hit.createDate,
        updateDate: hit.updateDate,
      }));
      return mapped.sort(compareCirclePosts);
    },
  });

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

  const circleBoards = useMemo(
    () => boards.filter((board) => board.circleId === cid),
    [boards, cid],
  );

  const originalBoardNameMap = useMemo(
    () => new Map<number, string>(circleBoards.map((board) => [board.boardId, board.name ?? ""])),
    [circleBoards],
  );

  const effectiveCircleBoards = useMemo(
    () =>
      circleBoards
        .filter((board) => !boardStagedDeletes[board.boardId])
        .map((board) => ({
          ...board,
          name: boardNameDrafts[board.boardId] ?? board.name,
        })),
    [boardNameDrafts, boardStagedDeletes, circleBoards],
  );

  const boardMap = useMemo(
    () =>
      new Map<number, CircleBoardResponse>(
        effectiveCircleBoards.map((board) => [board.boardId, board]),
      ),
    [effectiveCircleBoards],
  );

  const defaultWriteBoardId = useMemo(() => {
    if (boardFilter !== "all") {
      return boardFilter;
    }
    const nonActivityBoard = effectiveCircleBoards.find((board) => board.circleBoardKind !== "ACTIVITY");
    return nonActivityBoard?.boardId ?? effectiveCircleBoards[0]?.boardId ?? null;
  }, [boardFilter, effectiveCircleBoards]);

  const writeHref = defaultWriteBoardId
    ? `/circle/${cid}/board/${defaultWriteBoardId}/posts/create`
    : `/circle/${cid}/activity`;

  const myActiveMember = useMemo(
    () => activeMembers.find((member) => member.nickname === user?.nickname) ?? null,
    [activeMembers, user?.nickname],
  );
  const isCircleLeader = circle?.myRole === "LEADER" || myActiveMember?.role === "LEADER";

  useEffect(() => {
    if (!isCircleLeader && editMode) {
      setEditMode(false);
    }
  }, [editMode, isCircleLeader]);

  useEffect(() => {
    const nextDrafts: Record<number, string> = {};
    circleBoards.forEach((board) => {
      nextDrafts[board.boardId] = board.name ?? "";
    });
    setBoardNameDrafts(nextDrafts);
    setBoardStagedDeletes({});
    setBoardStagedCreates([]);
  }, [circleBoards]);

  useEffect(() => {
    if (boardFilter === "all") {
      return;
    }
    if (effectiveCircleBoards.length === 0) {
      return;
    }
    const exists = effectiveCircleBoards.some((board) => board.boardId === boardFilter);
    if (!exists) {
      const params = new URLSearchParams(searchParams);
      params.delete("board");
      navigate(`/circle/${cid}/board${params.toString() ? `?${params.toString()}` : ""}`, {
        replace: true,
      });
    }
  }, [boardFilter, cid, effectiveCircleBoards, navigate, searchParams]);

  const circleReplyItems = useMemo(
    () => listItems.filter(isCircleReplyItem),
    [listItems],
  );
  const circlePostItems = useMemo(
    () => listItems.filter((item): item is PostResponse => !isCircleReplyItem(item)),
    [listItems],
  );

  const filteredPosts = useMemo(() => {
    if (view === "myReplies") {
      return [] as PostResponse[];
    }
    const byBoard =
      boardFilter === "all"
        ? circlePostItems
        : circlePostItems.filter((post) => post.boardId === boardFilter);

    const visiblePosts =
      view === "home" && boardFilter === "all"
        ? byBoard.filter((post) => boardMap.get(post.boardId)?.circleBoardKind !== "ACTIVITY")
        : byBoard;

    return [...visiblePosts].sort(compareCirclePosts);
  }, [boardFilter, boardMap, circlePostItems, view]);

  const filteredReplies = useMemo(() => {
    if (view !== "myReplies") {
      return [] as CircleReplyItem[];
    }
    if (boardFilter === "all") {
      return circleReplyItems;
    }
    return circleReplyItems.filter((reply) => reply.boardId === boardFilter);
  }, [boardFilter, circleReplyItems, view]);

  const totalItemCount = view === "myReplies" ? filteredReplies.length : filteredPosts.length;
  const totalPages = Math.max(1, Math.ceil(totalItemCount / COMMUNITY_PAGE_SIZE));

  const pagedPosts = useMemo(() => {
    const start = (currentPage - 1) * COMMUNITY_PAGE_SIZE;
    return filteredPosts.slice(start, start + COMMUNITY_PAGE_SIZE);
  }, [currentPage, filteredPosts]);

  const pagedReplies = useMemo(() => {
    const start = (currentPage - 1) * COMMUNITY_PAGE_SIZE;
    return filteredReplies.slice(start, start + COMMUNITY_PAGE_SIZE);
  }, [currentPage, filteredReplies]);

  useEffect(() => {
    if (currentPage > totalPages) {
      goToPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const boardTitle = useMemo(() => {
    if (view === "scrap") return "스크랩";
    if (view === "myPosts") return "내가 쓴 글";
    if (view === "myReplies") return "내가 쓴 댓글";
    if (boardFilter === "all") return "전체 게시판";
    return boardMap.get(boardFilter)?.name ?? "게시판";
  }, [boardFilter, boardMap, view]);

  const selectedCircleBoard = useMemo(
    () => (boardFilter === "all" ? null : boardMap.get(boardFilter) ?? null),
    [boardFilter, boardMap],
  );
  const isRestrictedStickyBoard =
    selectedCircleBoard?.circleBoardKind === "NOTICE" || selectedCircleBoard?.circleBoardKind === "INTRO";

  const canEditBoardTitleInline =
    isCircleLeader && editMode && view === "home" && boardFilter !== "all" && !isRestrictedStickyBoard;

  useEffect(() => {
    if (boardFilter === "all") {
      setIsInlineBoardTitleEditing(false);
      setInlineBoardTitleDraft("");
      return;
    }
    setInlineBoardTitleDraft(boardMap.get(boardFilter)?.name ?? "");
  }, [boardFilter, boardMap]);

  const handleSidebarBoardSelect = (board: BoardFilter) => {
    const params = new URLSearchParams(searchParams);
    params.delete("view");
    params.delete("page");
    if (board === "all") {
      params.delete("board");
    } else {
      params.set("board", String(board));
    }
    const query = params.toString();
    navigate(`/circle/${cid}/board${query ? `?${query}` : ""}`);
    scrollToPageTop();
  };

  const scrollToPageTop = () => {
    requestAnimationFrame(() => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  };

  const handleSidebarViewSelect = (nextView: CommunityProfileQuickView) => {
    const params = new URLSearchParams(searchParams);
    params.delete("page");
    if (nextView === "home") {
      params.delete("view");
      const query = params.toString();
      navigate(`/circle/${cid}/board${query ? `?${query}` : ""}`);
      scrollToPageTop();
      return;
    }
    params.set("view", nextView);
    if (nextView === "scrap") {
      params.delete("board");
    }
    navigate(`/circle/${cid}/board?${params.toString()}`);
    scrollToPageTop();
  };

  const resetBoardEditState = () => {
    const nextDrafts: Record<number, string> = {};
    circleBoards.forEach((board) => {
      nextDrafts[board.boardId] = board.name ?? "";
    });
    setBoardNameDrafts(nextDrafts);
    setBoardStagedDeletes({});
    setBoardStagedCreates([]);
    setStagedPostDeletes({});
    setIsInlineBoardTitleEditing(false);
    setInlineBoardTitleDraft("");
  };

  const handleCreateCircleBoard = (name: string) => {
    if (!isCircleLeader || isBoardEditBusy || !editMode) {
      return;
    }
    const trimmedName = name.trim();
    if (!trimmedName) return;
    setBoardStagedCreates((prev) => [
      ...prev,
      {
        tempId: Date.now() + Math.floor(Math.random() * 1000),
        name: trimmedName,
        circleBoardKind: "CUSTOM",
      },
    ]);
  };

  const openInlineRenameCircleBoard = () => {
    if (!isCircleLeader || isBoardEditBusy || boardFilter === "all" || isRestrictedStickyBoard) {
      return;
    }
    const current = boardMap.get(boardFilter);
    if (!current) return;
    setInlineBoardTitleDraft(current.name ?? "");
    setIsInlineBoardTitleEditing(true);
  };

  const handleRenameCircleBoard = () => {
    if (!isCircleLeader || isBoardEditBusy || !editMode || boardFilter === "all" || isRestrictedStickyBoard) {
      return;
    }
    const current = boardMap.get(boardFilter);
    if (!current) return;
    const trimmed = inlineBoardTitleDraft.trim();
    if (!trimmed || trimmed === (current.name ?? "").trim()) {
      setIsInlineBoardTitleEditing(false);
      return;
    }

    setBoardNameDrafts((prev) => ({
      ...prev,
      [current.boardId]: trimmed,
    }));
    setIsInlineBoardTitleEditing(false);
  };

  const handleDeleteCurrentCircleBoard = async () => {
    if (!isCircleLeader || isBoardEditBusy || !editMode || boardFilter === "all" || isRestrictedStickyBoard) {
      return;
    }
    const current = boardMap.get(boardFilter);
    if (!current) return;
    if (!window.confirm("정말 삭제하시겠습니까?")) {
      return;
    }
    setBoardStagedDeletes((prev) => ({ ...prev, [current.boardId]: true }));
    handleSidebarBoardSelect("all");
  };

  const boardRenameChangeCount = useMemo(
    () =>
      effectiveCircleBoards.filter((board) => {
        const original = originalBoardNameMap.get(board.boardId) ?? "";
        return (board.name ?? "").trim() !== original.trim();
      }).length,
    [effectiveCircleBoards, originalBoardNameMap],
  );
  const boardCreateCount = boardStagedCreates.length;
  const boardDeleteCount = Object.values(boardStagedDeletes).filter(Boolean).length;
  const pendingPostDeleteCount = Object.keys(stagedPostDeletes).length;
  const hasPendingBoardChanges =
    boardRenameChangeCount > 0 || boardCreateCount > 0 || boardDeleteCount > 0 || pendingPostDeleteCount > 0;

  const changedBoardIds = useMemo(
    () =>
      effectiveCircleBoards
        .filter((board) => {
          const original = originalBoardNameMap.get(board.boardId) ?? "";
          return (board.name ?? "").trim() !== original.trim();
        })
        .map((board) => board.boardId),
    [effectiveCircleBoards, originalBoardNameMap],
  );

  const applyBoardEditChanges = async () => {
    if (!isCircleLeader || isBoardEditBusy || !editMode) {
      return;
    }
    const boardRenameTargets = effectiveCircleBoards
      .filter((board) => {
        const original = originalBoardNameMap.get(board.boardId) ?? "";
        return (board.name ?? "").trim() !== original.trim();
      })
      .map((board) => ({ boardId: board.boardId, name: (board.name ?? "").trim() }));
    const boardDeleteTargets = Object.entries(boardStagedDeletes)
      .filter(([, staged]) => staged)
      .map(([boardId]) => Number(boardId));
    const boardCreateTargets = boardStagedCreates
      .map((board) => ({
        name: board.name.trim(),
        circleBoardKind: board.circleBoardKind,
      }))
      .filter((board) => !!board.name);
    const postDeleteTargets = Object.values(stagedPostDeletes);

    if (
      boardRenameTargets.length === 0 &&
      boardDeleteTargets.length === 0 &&
      boardCreateTargets.length === 0 &&
      postDeleteTargets.length === 0
    ) {
      setEditMode(false);
      return;
    }
    if (!window.confirm("변경사항을 적용하시겠습니까?")) {
      return;
    }

    setIsBoardEditBusy(true);
    try {
      const renameRequests = boardRenameTargets.map((target) =>
        circleBoardApi.updateBoardName(cid, target.boardId, target.name),
      );
      const deleteRequests = boardDeleteTargets.map((boardId) =>
        circleBoardApi.deleteBoard(cid, boardId),
      );
      const createRequests = boardCreateTargets.map((target) =>
        circleBoardApi.createBoard(cid, {
          name: target.name,
          circleBoardKind: target.circleBoardKind,
        }),
      );
      const postDeleteRequests = postDeleteTargets.map((post) =>
        circleBoardApi.deletePost(cid, post.boardId, post.postId),
      );
      await Promise.all([...renameRequests, ...deleteRequests, ...createRequests, ...postDeleteRequests]);
      setEditMode(false);
      resetBoardEditState();
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["circleBoardsForBoardTab", cid] }),
        queryClient.invalidateQueries({ queryKey: postQueryKey }),
      ]);
      window.alert("변경사항이 적용되었습니다.");
    } catch (error) {
      window.alert(getErrorMessage(error));
    } finally {
      setIsBoardEditBusy(false);
    }
  };

  const toggleEditMode = () => {
    if (!isCircleLeader || isBoardEditBusy) {
      return;
    }
    if (editMode && hasPendingBoardChanges) {
      if (!window.confirm("저장되지 않은 변경사항을 되돌리고 수정모드를 종료할까요?")) {
        return;
      }
      resetBoardEditState();
    }
    setEditMode((prev) => !prev);
  };

  const handleStageDeletePost = (post: PostResponse) => {
    if (!isCircleLeader || !editMode) {
      return;
    }
    setStagedPostDeletes((prev) => {
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
    if (!isCircleLeader || !editMode) {
      return;
    }
    setStagedPostDeletes((prev) => {
      if (!prev[postId]) {
        return prev;
      }
      const next = { ...prev };
      delete next[postId];
      return next;
    });
  };

  const emptyText = useMemo(() => {
    if ((view === "myPosts" || view === "myReplies" || view === "scrap") && !isLoggedIn) {
      return "로그인 후 목록을 확인할 수 있습니다.";
    }
    if (view === "scrap") {
      return "스크랩한 게시글이 없습니다.";
    }
    if (view === "myReplies") {
      return "작성한 댓글이 없습니다.";
    }
    if (view === "myPosts") {
      return "작성한 게시글이 없습니다.";
    }
    return "게시글이 없습니다.";
  }, [isLoggedIn, view]);

  const boardFromPath = useMemo(
    () => `/circle/${cid}/board${boardFilter === "all" ? "" : `?board=${boardFilter}`}`,
    [boardFilter, cid],
  );

  const deletedPreviewItems = useMemo(
    () =>
      Object.values(stagedPostDeletes)
        .sort((a, b) => new Date(b.createDate).getTime() - new Date(a.createDate).getTime())
        .map((post) => ({
          id: post.postId,
          title: post.title,
          authorName: post.authorName,
          createDateLabel: toDateLabel(post.createDate),
          href: `/circle/${cid}/board/${post.boardId}/posts/${post.postId}`,
          status: "deleted" as const,
        })),
    [cid, stagedPostDeletes],
  );

  const listLoading = hasValidCircleId && (postsPending || postsFetching);
  const listError = canFetchCirclePosts && postsError ? getErrorMessage(postsQueryError) : "";

  return (
    <div className="board-community-page" style={{ minHeight: "100vh", backgroundColor: "#f7f7f8" }}>
      <Navbar />

      <main style={{ maxWidth: 1200, margin: "0 auto", padding: "24px 16px" }}>
        {circle && <CircleDetailBanner circle={circle} />}

        <CircleDetailTabs circleId={cid} activeTab="board" />

        <>
          <div className="community-sticky-gap" aria-hidden="true" />
          <section className="board-community-layout">
            <aside className="community-left-sidebar" style={{ display: "grid", gap: 12 }}>
              <CommunityProfileCard
                selectedView={view}
                onSelectView={handleSidebarViewSelect}
                writeHref={writeHref}
                replaceWithPending={isCircleLeader && editMode}
                pendingContent={
                  isCircleLeader && editMode ? (
                    <BoardPendingPanel
                      postPinnedCount={0}
                      postDeletedCount={pendingPostDeleteCount}
                      boardCreateCount={boardCreateCount}
                      boardRenameCount={boardRenameChangeCount}
                      boardDeleteCount={boardDeleteCount}
                      onReset={resetBoardEditState}
                      onApply={() => void applyBoardEditChanges()}
                      resetDisabled={isBoardEditBusy || !hasPendingBoardChanges}
                      applyDisabled={isBoardEditBusy}
                      embedded
                    />
                  ) : undefined
                }
                bottomAction={
                  isCircleLeader ? (
                    <button
                      type="button"
                      onClick={toggleEditMode}
                      className={`community-side-edit-toggle ${editMode ? "active" : ""}`}
                      aria-label="게시판 편집모드 전환"
                      title="게시판 편집"
                    >
                      <Settings size={16} strokeWidth={2} aria-hidden="true" />
                      <span>편집모드</span>
                    </button>
                  ) : undefined
                }
              />
              <CircleBoardSidebarMenu
                boards={effectiveCircleBoards}
                selectedBoard={boardFilter}
                onSelectBoard={handleSidebarBoardSelect}
                isActive={view === "home"}
                editable={isCircleLeader && editMode}
                onCreateBoard={handleCreateCircleBoard}
                busy={isBoardEditBusy}
                changedBoardIds={changedBoardIds}
                pendingAddedBoards={boardStagedCreates.map((board) => ({
                  name: board.name,
                  circleBoardKind: board.circleBoardKind,
                }))}
              />
            </aside>

            <section className="community-center-column">
              <CommunityBoardToolbar
                  title={boardTitle}
                  titleContent={
                    <BoardEditableTitle
                      title={boardTitle}
                      editable={canEditBoardTitleInline}
                      editing={isInlineBoardTitleEditing}
                      draft={inlineBoardTitleDraft}
                      busy={isBoardEditBusy}
                      onDraftChange={setInlineBoardTitleDraft}
                      onStartEdit={openInlineRenameCircleBoard}
                      onSave={() => void handleRenameCircleBoard()}
                      onCancel={() => setIsInlineBoardTitleEditing(false)}
                      onDelete={() => void handleDeleteCurrentCircleBoard()}
                    />
                  }
                  searchType={searchType}
                  onSearchTypeChange={(type) => setSearchType(type)}
                  keyword={keyword}
                  onKeywordChange={setKeyword}
                  placeholder={view === "myReplies" ? "댓글/원문 제목 검색" : "게시글 검색"}
                />

              {isCircleLeader && editMode ? (
                <CommunityPinnedPreviewList
                  items={deletedPreviewItems}
                  editable
                  fromPath={boardFromPath}
                  onCancelDelete={handleCancelStagedDelete}
                />
              ) : (
                <GlobalPinnedPreviewSection fromPath={boardFromPath} />
              )}

              <CommunityListState
                loading={listLoading}
                errorMessage={listError}
                isEmpty={view === "myReplies" ? pagedReplies.length === 0 : pagedPosts.length === 0}
                emptyText={emptyText}
              >
                {view === "myReplies" ? (
                  <ul className="community-post-list">
                    {pagedReplies.map((item) => (
                      <li key={`reply-${item.replyId}`}>
                        <Link
                          to={item.href}
                          state={{ from: boardFromPath, focusReplyId: item.replyId }}
                          className="community-post-item-link"
                        >
                          <div className="community-post-item-body">
                            <p className="community-post-item-title">
                              <span className="community-post-item-title-text">{item.content}</span>
                              {boardFilter === "all" && (
                                <span className="community-post-item-board">
                                  · {boardMap.get(item.boardId)?.name ?? "게시판"}
                                </span>
                              )}
                            </p>
                            <p className="community-post-item-meta">
                              <span>원문: {truncateByCharCount(item.postTitle, CIRCLE_POST_TITLE_MAX_CHARS)}</span>
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
                      items={pagedPosts.map((post) => ({
                        postId: post.postId,
                        href: `/circle/${cid}/board/${post.boardId}/posts/${post.postId}`,
                        linkState: { from: boardFromPath },
                        title: post.title,
                        boardName: boardMap.get(post.boardId)?.name ?? "게시판",
                        authorName: post.authorName,
                        viewCount: post.viewCount,
                        replyCount: post.replyCount,
                        likeCount: post.likeCount,
                        createDate: post.createDate,
                      }))}
                      disabledLinks={editMode}
                      isDeleted={(postId) => !!stagedPostDeletes[postId]}
                      dateLabel={toDateLabel}
                      renderLeading={(item) =>
                        pagedPosts.find((post) => post.postId === item.postId)?.pinned ? (
                          <span className="community-post-pin-indicator" aria-label="상단 고정">
                            <Pin size={14} strokeWidth={2} className="pin-icon pinned" />
                          </span>
                        ) : null
                      }
                      showBoardName={boardFilter === "all"}
                      renderAdminActions={(item) => {
                        if (!isCircleLeader || !editMode) return null;
                        const source = pagedPosts.find((post) => post.postId === item.postId);
                        if (!source) return null;
                        return (
                          <div className="community-post-admin-actions">
                            <button
                              type="button"
                              aria-label="게시글 삭제"
                              className={`community-post-admin-action-button danger ${
                                stagedPostDeletes[source.postId] ? "active" : ""
                              }`}
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleStageDeletePost(source);
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

            <CommunityRightSidebar scope="circle" circleId={cid} />
          </section>
        </>
      </main>

      <Footer />
    </div>
  );
}
