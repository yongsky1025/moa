import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useEffect, useMemo, useRef, useState } from "react";
import { Eye, Heart, Pin, Settings, Trash2 } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import CommentBubbleIcon from "../../common/components/CommentBubbleIcon";
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
import "./boardCommunity.css";
import { postApi } from "../../post/api/postApi";
import type {
  CommunityMyReply,
  PostResponse,
  PostSearchHit,
  PostSearchTarget,
} from "../../post/types/postTypes";
import { useAuthStore } from "../../store/authStore";
import { getErrorMessage } from "../../common/utils/errorMessage";

interface CommunityPostItem {
  postId: number;
  boardName: "공지사항" | "자유게시판";
  title: string;
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

export default function BoardCommunityPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { isLoggedIn, user } = useAuthStore();
  const isAdmin = user?.userRole === "ADMIN";
  const [view, setView] = useState<CommunityView>("home");
  const [boardFilter, setBoardFilter] = useState<CommunityBoardFilter>("all");
  const [searchParams] = useSearchParams();
  const [keyword, setKeyword] = useState("");
  const [debouncedKeyword, setDebouncedKeyword] = useState("");
  const [searchType, setSearchType] = useState<"all" | "title" | "content">("all");
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
      Pick<CommunityPostItem, "postId" | "boardName" | "title" | "authorName" | "createDate" | "href">
    >
  >({});
  const [stagedDeletes, setStagedDeletes] = useState<Record<number, CommunityPostItem>>({});
  const [isApplyingEdits, setIsApplyingEdits] = useState(false);
  const pinAnimationResetRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const value = searchParams.get("board");
    if (
      value === "all" ||
      value === "notice" ||
      value === "review" ||
      value === "free" ||
      value === "qna"
    ) {
      setBoardFilter(value);
    } else {
      setBoardFilter("all");
    }
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

  const canFetchCommunityPosts =
    boardFilter !== "review" &&
    boardFilter !== "qna" &&
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
      const mapFromPost = (post: PostResponse, boardName: "공지사항" | "자유게시판") => ({
        postId: post.postId,
        boardName,
        title: post.title,
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

      if (view === "scrap" || view === "myPosts" || view === "myReplies") {
        if (!isLoggedIn) {
          return [];
        }
        const personalParams = {
          board: boardParam,
          q: debouncedKeyword || undefined,
          target: targetMap[searchType],
        };
        if (view === "myReplies") {
          const data = (await postApi.getMyCommunityRepliedPosts(personalParams)).data;
          return data
            .map((reply: CommunityMyReply) => {
              const boardName = reply.boardType === "NOTICE" ? "공지사항" as const : "자유게시판" as const;
              return {
                replyId: reply.replyId,
                boardName,
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
            return mapFromPost(post, boardName);
          })
          .sort(compareCommunityPosts);
      }

      if (!debouncedKeyword) {
        const { data } = await postApi.getCommunityPosts(boardParam);
        return data
          .map((post: PostResponse) => {
            const boardName = boardFilter === "notice"
              ? "공지사항"
              : boardFilter === "free"
                ? "자유게시판"
                : post.boardType === "NOTICE"
                  ? "공지사항"
                  : "자유게시판";
            return mapFromPost(post, boardName);
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
        page: 1,
        size: 100,
      });

      return data.hits
        .filter((hit: PostSearchHit) => hit.boardType === "FREE" || hit.boardType === "NOTICE")
        .map((hit: PostSearchHit) => ({
          postId: hit.postId,
          boardName: hit.boardType === "NOTICE" ? "공지사항" as const : "자유게시판" as const,
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

  const { data: pinnedGlobalPosts = [] } = useQuery<CommunityPostItem[]>({
    queryKey: ["communityPinnedGlobalTop"],
    queryFn: async () => {
      const { data } = await postApi.getCommunityPosts("all");
      const mapped: CommunityPostItem[] = data
        .filter((post: PostResponse) => post.pinned)
        .map((post: PostResponse) => {
          const boardName: CommunityPostItem["boardName"] =
            post.boardType === "NOTICE" ? "공지사항" : "자유게시판";
          return {
            postId: post.postId,
            boardName,
            title: post.title,
            authorName: post.authorName,
            likeCount: post.likeCount,
            viewCount: post.viewCount,
            replyCount: post.replyCount,
            pinned: post.pinned ?? false,
            pinnedAt: post.pinnedAt ?? null,
            createDate: post.createDate,
            href:
              boardName === "공지사항"
                ? postRoutes.noticeDetail(post.postId)
                : postRoutes.freeDetail(post.postId),
          };
        });
      return mapped.sort(compareCommunityPosts);
    },
  });
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
          current.authorName !== item.authorName ||
          current.createDate !== item.createDate ||
          current.href !== item.href
        ) {
          changed = true;
          next[item.postId] = {
            postId: item.postId,
            boardName: item.boardName,
            title: item.title,
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

  const pendingPinCount = useMemo(
    () =>
      Object.values(pinDraftPosts)
        .filter((item) => item.boardName === "공지사항")
        .filter((item) => !stagedDeletes[item.postId])
        .filter((item) => localPinOverrides[item.postId]?.pinned ?? false)
        .length,
    [localPinOverrides, pinDraftPosts, stagedDeletes],
  );
  const pendingDeleteCount = useMemo(
    () => Object.keys(stagedDeletes).length,
    [stagedDeletes],
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
  const hasPendingEditChanges = pinChangedCount > 0 || pendingDeleteCount > 0;

  const clearEditState = () => {
    setLocalPinOverrides({});
    setServerPinSnapshot({});
    setPinDraftPosts({});
    setStagedDeletes({});
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
        Pick<CommunityPostItem, "postId" | "boardName" | "title" | "authorName" | "createDate" | "href">
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
    if (pinPostIds.length === 0 && deleteTargets.length === 0) {
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
      await Promise.all([...pinRequests, ...deleteRequests]);

      clearEditState();

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: communityQueryKey }),
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

  const boardTitle = useMemo(() => {
    if (view === "scrap") return "스크랩";
    if (view === "myPosts") return "내가 쓴 글";
    if (view === "myReplies") return "내가 쓴 댓글";
    if (boardFilter === "notice") return "공지사항";
    if (boardFilter === "review") return "모임 후기";
    if (boardFilter === "free") return "자유게시판";
    if (boardFilter === "qna") return "Q&A";
    return "전체 게시판";
  }, [boardFilter, view]);

  const handleSidebarBoardSelect = (board: CommunityBoardFilter) => {
    const query = board === "all" ? "" : `?board=${board}`;
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
      params.set("board", boardFilter);
    }
    navigate(`/board?${params.toString()}`);
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
        .map(({ id, title, authorName, createDateLabel, href }) => ({
          id,
          title,
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

  const readonlyPinnedPreviewItems = useMemo(
    () =>
      pinnedGlobalPosts
        .filter((item) => item.pinned)
        .sort(
          (a, b) =>
            new Date(b.pinnedAt ?? "").getTime() - new Date(a.pinnedAt ?? "").getTime(),
        )
        .map((item) => ({
          id: item.postId,
          title: item.title,
          authorName: item.authorName,
          createDateLabel: toDateLabel(item.createDate),
          href: item.href,
          status: "pinned" as const,
        })),
    [pinnedGlobalPosts],
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
          />
          <section className="community-center-column">
            <div className="community-center-toolbar">
              <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: "#111827" }}>
                {boardTitle}
              </h3>
              <div style={{ display: "flex", alignItems: "center", gap: 8, width: 360, maxWidth: "100%" }}>
                <select
                  value={searchType}
                  onChange={(e) =>
                    setSearchType(e.target.value as "all" | "title" | "content")
                  }
                  style={{
                    height: 36,
                    borderRadius: 8,
                    border: "1px solid #d1d5db",
                    padding: "0 10px",
                    fontSize: 13,
                    color: "#111827",
                    backgroundColor: "#fff",
                    flexShrink: 0,
                  }}
                >
                  <option value="all">전체</option>
                  <option value="title">제목</option>
                  <option value="content">내용</option>
                </select>
                <input
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder={view === "myReplies" ? "댓글/원문 제목 검색" : "게시글 검색"}
                  style={{
                    width: "100%",
                    height: 36,
                    borderRadius: 8,
                    border: "1px solid #d1d5db",
                    padding: "0 12px",
                    fontSize: 14,
                    color: "#111827",
                  }}
                />
                {isAdmin && (
                  <button
                    type="button"
                    onClick={toggleEditMode}
                    className={`community-edit-mode-button ${editMode ? "active" : ""}`}
                    aria-label="수정모드 전환"
                    title="수정모드"
                  >
                    <Settings size={16} strokeWidth={2} aria-hidden="true" />
                  </button>
                )}
              </div>
            </div>
            {isAdmin && editMode && (
              <section className="community-admin-toolbar">
                <p className="community-admin-toolbar-summary">
                  변경 대기: 고정 {pendingPinCount}건, 삭제 {pendingDeleteCount}건
                </p>
                <div className="community-admin-toolbar-actions">
                  <button
                    type="button"
                    className="community-admin-reset-button"
                    disabled={isApplyingEdits || !hasPendingEditChanges}
                    onClick={resetToEditInitialState}
                  >
                    되돌리기
                  </button>
                  <button
                    type="button"
                    className="community-apply-button"
                    disabled={isApplyingEdits}
                    onClick={() => void applyEditChanges()}
                  >
                    적용
                  </button>
                </div>
              </section>
            )}
            {isAdmin && editMode && (
              <CommunityPinnedPreviewList
                items={topPreviewItems}
                editable
                onTogglePin={handleTogglePin}
                onCancelDelete={handleCancelStagedDelete}
              />
            )}
            {!editMode && readonlyPinnedPreviewItems.length > 0 && (
              <CommunityPinnedPreviewList
                items={readonlyPinnedPreviewItems}
                fromPath={boardFromPath}
              />
            )}
            <section>
            {loading && <p style={{ margin: 0, color: "#6b7280" }}>불러오는 중...</p>}
            {!loading && loadError && <p style={{ margin: 0, color: "#dc2626" }}>{loadError}</p>}
            {!loading && !loadError && posts.length === 0 && (
              <p style={{ margin: 0, color: "#6b7280" }}>{emptyText}</p>
            )}

            {!loading && !loadError && posts.length > 0 && (
              <ul className="community-post-list">
                {posts.map((item) =>
                  "replyId" in item ? (
                    <li key={`reply-${item.replyId}`}>
                      <Link
                        to={item.href}
                        state={{ from: boardFromPath }}
                        className={`community-post-item-link ${editMode ? "is-disabled" : ""}`}
                        onClick={(e) => {
                          if (editMode) {
                            e.preventDefault();
                          }
                        }}
                      >
                        <div className="community-post-item-body">
                          <p className="community-post-item-title">
                            <span className="community-post-item-title-text">
                              {item.content}
                            </span>
                            {boardFilter === "all" && (
                              <span className="community-post-item-board">
                                · {item.boardName}
                              </span>
                            )}
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
                  ) : (
                    <li
                      key={`${item.boardName}-${item.postId}`}
                      style={
                        stagedDeletes[item.postId]
                          ? { opacity: 0.45, filter: "grayscale(0.15)" }
                          : undefined
                      }
                    >
                      <div className="community-post-item-row">
                        {(() => {
                          const effectivePinned =
                            localPinOverrides[item.postId]?.pinned ?? (item.pinned ?? false);
                          const showPinnedIndicator =
                            !isAdmin && item.boardName === "공지사항" && effectivePinned;

                          if (showPinnedIndicator) {
                            return (
                              <span className="community-post-pin-indicator" aria-label="상단 고정">
                                <Pin size={14} strokeWidth={2} className="pin-icon pinned" />
                              </span>
                            );
                          }

                          return null;
                        })()}
                        <Link
                          to={item.href}
                          state={{ from: boardFromPath }}
                          className={`community-post-item-link ${
                            isAdmin && editMode ? "has-admin-actions" : ""
                          } ${editMode ? "is-disabled" : ""}`}
                          onClick={(e) => {
                            if (editMode) {
                              e.preventDefault();
                            }
                          }}
                        >
                          <div className="community-post-item-body">
                            <p className="community-post-item-title">
                              <span className="community-post-item-title-text">
                                {item.title}
                              </span>
                              {boardFilter === "all" && (
                                <span className="community-post-item-board">
                                  · {item.boardName}
                                </span>
                              )}
                            </p>
                            <p className="community-post-item-meta">
                              <span>{item.authorName}</span>
                              <span className="community-post-item-stat">
                                <Eye size={14} />
                                {item.viewCount}
                              </span>
                              <span className="community-post-item-stat">
                                <CommentBubbleIcon size={14} strokeWidth={1.8} />
                                {item.replyCount}
                              </span>
                              {item.boardName !== "공지사항" && (
                                <span className="community-post-item-stat">
                                  <Heart size={14} />
                                  {item.likeCount}
                                </span>
                              )}
                              <span>{toDateLabel(item.createDate)}</span>
                            </p>
                          </div>
                        </Link>
                        {isAdmin && editMode && (
                          <div className="community-post-admin-actions">
                            {item.boardName === "공지사항" && (
                              <button
                                type="button"
                                aria-label={item.pinned ? "상단 고정 해제" : "상단 고정"}
                                className="community-post-admin-action-button"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  handleTogglePin(item.postId);
                                }}
                              >
                                <Pin
                                  size={14}
                                  strokeWidth={2}
                                  className={`pin-icon ${
                                    (localPinOverrides[item.postId]?.pinned ?? (item.pinned ?? false))
                                      ? "pinned"
                                      : ""
                                  } ${pinAnimatingPostId === item.postId ? "pulse" : ""}`}
                                />
                                <span>고정</span>
                              </button>
                            )}
                              <button
                                type="button"
                                aria-label="게시글 삭제"
                                className={`community-post-admin-action-button danger ${
                                  stagedDeletes[item.postId] ? "active" : ""
                                }`}
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                handleDeletePost(item);
                              }}
                            >
                              <Trash2 size={14} strokeWidth={2} />
                              <span>삭제</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </li>
                  ),
                )}
              </ul>
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
