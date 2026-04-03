import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { postApi } from "../../post/api/postApi";
import { postRoutes } from "../../post/routes/postRoutes";
import type { CommunitySidebarPost } from "../../post/types/postTypes";

type SortMode = "recent" | "views" | "replies";

interface SidebarPostItem {
  postId: number;
  boardName: "자유" | "공지";
  title: string;
  viewCount: number;
  replyCount: number;
  createDate: string;
  href: string;
}

export default function CommunityRightSidebar() {
  const [mode, setMode] = useState<SortMode>("recent");

  const { data, isLoading } = useQuery({
    queryKey: ["communitySidebar", "all", mode, 12],
    queryFn: async () => {
      const response = await postApi.getCommunitySidebarPosts({
        board: "all",
        sort: mode,
        limit: 12,
      });
      return response.data;
    },
  });

  const items = useMemo<SidebarPostItem[]>(
    () =>
      (data ?? []).map((post: CommunitySidebarPost) => ({
        postId: post.postId,
        boardName: post.boardType === "NOTICE" ? "공지" : "자유",
        title: post.title,
        viewCount: post.viewCount,
        replyCount: post.replyCount,
        createDate: post.createDate,
        href:
          post.boardType === "NOTICE"
            ? postRoutes.noticeDetail(post.postId)
            : postRoutes.freeDetail(post.postId),
      })),
    [data],
  );

  const toggleButtonStyle = (active: boolean) => ({
    border: active ? "1px solid #2dd4bf" : "1px solid #d1d5db",
    backgroundColor: active ? "#e6fffb" : "#fff",
    color: active ? "#0f766e" : "#374151",
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 700,
    padding: "6px 10px",
    cursor: "pointer",
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
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 8 }}>
          <p style={{ margin: 0, fontSize: 16, fontWeight: 900, color: "#111827" }}>
            최근 게시글
          </p>
          <span style={{ fontSize: 11, color: "#6b7280" }}>커뮤니티 기준</span>
        </div>

        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          <button type="button" onClick={() => setMode("recent")} style={toggleButtonStyle(mode === "recent")}>
            최근
          </button>
          <button type="button" onClick={() => setMode("views")} style={toggleButtonStyle(mode === "views")}>
            최다 조회
          </button>
          <button type="button" onClick={() => setMode("replies")} style={toggleButtonStyle(mode === "replies")}>
            최다 댓글
          </button>
        </div>

        {isLoading && (
          <p style={{ margin: "4px 0 0", fontSize: 13, color: "#6b7280" }}>
            불러오는 중...
          </p>
        )}

        {!isLoading && items.length === 0 && (
          <p style={{ margin: "4px 0 0", fontSize: 13, color: "#6b7280" }}>
            게시글이 없습니다.
          </p>
        )}

        {!isLoading &&
          items.map((item) => (
            <Link
              key={`${item.boardName}-${item.postId}`}
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
