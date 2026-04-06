import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Clock3, Eye, Flame, MessageSquare } from "lucide-react";
import { circleBoardApi, type CircleBoardResponse } from "../../api/circleBoardApi";
import type { PostResponse } from "../../post/types/postTypes";
import { SidebarPostListSkeleton } from "./BoardSectionSkeletons";
import { useDelayedLoading } from "../../common/hooks/useDelayedLoading";

type SortMode = "popular" | "recent" | "views" | "replies";

interface SidebarPostItem {
  postId: number;
  boardId: number;
  boardName: string;
  title: string;
  viewCount: number;
  replyCount: number;
  createDate: string;
  href: string;
}

interface CircleBoardRightSidebarProps {
  circleId: number;
  boards?: CircleBoardResponse[];
}

export default function CircleBoardRightSidebar({
  circleId,
  boards = [],
}: CircleBoardRightSidebarProps) {
  const [mode, setMode] = useState<SortMode>("popular");

  const modeLabel: Record<SortMode, string> = {
    popular: "인기",
    recent: "최신",
    views: "조회수",
    replies: "댓글수",
  };
  const modeIcon: Record<SortMode, React.ReactNode> = {
    popular: <Flame size={14} color="#ef4444" />,
    recent: <Clock3 size={14} color="#0ea5e9" />,
    views: <Eye size={14} color="#6366f1" />,
    replies: <MessageSquare size={14} color="#10b981" />,
  };

  const boardNameById = useMemo(
    () => new Map<number, string>(boards.map((board) => [board.boardId, board.name])),
    [boards],
  );

  const { data: posts = [], isLoading } = useQuery<PostResponse[]>({
    queryKey: ["circleBoardSidebar", circleId],
    enabled: Number.isFinite(circleId) && circleId > 0,
    staleTime: 60_000,
    queryFn: async () => (await circleBoardApi.getAllPosts(circleId)).data,
  });

  const sortedPosts = useMemo(() => {
    const source = [...posts];
    if (mode === "popular") {
      return source
        .sort((a, b) => {
          const aScore = a.viewCount * 0.7 + a.replyCount * 1.3;
          const bScore = b.viewCount * 0.7 + b.replyCount * 1.3;
          return bScore - aScore;
        })
        .slice(0, 12);
    }
    if (mode === "views") {
      return source.sort((a, b) => b.viewCount - a.viewCount).slice(0, 12);
    }
    if (mode === "replies") {
      return source.sort((a, b) => b.replyCount - a.replyCount).slice(0, 12);
    }
    return source
      .sort((a, b) => new Date(b.createDate).getTime() - new Date(a.createDate).getTime())
      .slice(0, 12);
  }, [mode, posts]);

  const items = useMemo<SidebarPostItem[]>(
    () =>
      sortedPosts.map((post) => ({
        postId: post.postId,
        boardId: post.boardId,
        boardName: boardNameById.get(post.boardId) ?? "게시판",
        title: post.title,
        viewCount: post.viewCount,
        replyCount: post.replyCount,
        createDate: post.createDate,
        href: `/circle/${circleId}/board/${post.boardId}/posts/${post.postId}`,
      })),
    [boardNameById, circleId, sortedPosts],
  );
  const showLoading = useDelayedLoading(isLoading, 150, 300);
  const isBusy = isLoading || showLoading;

  const toggleButtonStyle = (active: boolean) => ({
    border: active ? "1px solid #2dd4bf" : "1px solid #d1d5db",
    backgroundColor: active ? "#e6fffb" : "#fff",
    color: active ? "#0f766e" : "#374151",
    borderRadius: 8,
    fontSize: 11,
    fontWeight: 700,
    padding: "6px 4px",
    cursor: "pointer",
    whiteSpace: "nowrap" as const,
    width: "100%",
    textAlign: "center" as const,
  });

  return (
    <aside className="community-right-sidebar">
      <section
        style={{
          border: "1px solid #e5e7eb",
          borderRadius: 10,
          backgroundColor: "#fff",
          padding: 14,
          display: "grid",
          gap: 8,
        }}
      >
        <div style={{ display: "flex", justifyContent: "flex-start" }}>
          <strong
            style={{
              fontSize: 13,
              color: "#111827",
              fontWeight: 800,
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            {modeIcon[mode]}
            {modeLabel[mode]}
          </strong>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 6 }}>
          <button type="button" onClick={() => setMode("popular")} style={toggleButtonStyle(mode === "popular")}>
            인기
          </button>
          <button type="button" onClick={() => setMode("recent")} style={toggleButtonStyle(mode === "recent")}>
            최신
          </button>
          <button type="button" onClick={() => setMode("views")} style={toggleButtonStyle(mode === "views")}>
            조회수
          </button>
          <button type="button" onClick={() => setMode("replies")} style={toggleButtonStyle(mode === "replies")}>
            댓글수
          </button>
        </div>

        {showLoading && <SidebarPostListSkeleton count={8} />}

        {!isBusy && items.length === 0 && (
          <p style={{ margin: "4px 0 0", fontSize: 13, color: "#6b7280" }}>
            게시글이 없습니다.
          </p>
        )}

        {!isBusy &&
          items.map((item) => (
            <Link
              key={`${item.boardId}-${item.postId}`}
              to={item.href}
              style={{
                textDecoration: "none",
                color: "#1f2937",
                fontSize: 14,
                lineHeight: 1.35,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
              title={`${item.boardName} . ${item.title}`}
            >
              {item.boardName} . {item.title}
            </Link>
          ))}
      </section>
    </aside>
  );
}
