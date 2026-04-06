import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Activity, Inbox, Loader2, MessageSquare, Users } from "lucide-react";
import Navbar from "../../common/layout/Navbar";
import Footer from "../../common/layout/Footer";
import { postApi } from "../api/postApi";
import type { CommunityMyReply } from "../types/postTypes";
import { circleApi } from "../../api/circleApi";
import { circleBoardApi } from "../../api/circleBoardApi";
import type { CircleResponse } from "../../circle/types/circle";
import { postRoutes } from "../routes/postRoutes";

type TopTab = "board" | "activity";
type BoardFilter = "all" | "community" | "circle";
type SourceKind = "community" | "circle" | "activity";

interface MyReplyItem {
  source: SourceKind;
  reply: CommunityMyReply;
}

function getTopTab(searchParams: URLSearchParams): TopTab {
  return searchParams.get("tab") === "activity" ? "activity" : "board";
}

function getBoardFilter(searchParams: URLSearchParams): BoardFilter {
  const view = searchParams.get("view");
  if (view === "community" || view === "circle") return view;
  return "all";
}

function getActivityCircleId(searchParams: URLSearchParams): number | "all" {
  const raw = searchParams.get("circleId");
  if (!raw || raw === "all") return "all";
  const parsed = Number(raw);
  if (!Number.isInteger(parsed) || parsed <= 0) return "all";
  return parsed;
}

function toDetailPath(item: MyReplyItem): string {
  const { reply } = item;
  if (item.source === "circle" || item.source === "activity") {
    if (reply.circleId != null && reply.boardId != null) {
      return `/circle/${reply.circleId}/board/${reply.boardId}/posts/${reply.postId}`;
    }
    return "/circle";
  }
  if (reply.boardType === "NOTICE") return postRoutes.noticeDetail(reply.postId);
  return postRoutes.freeDetail(reply.postId);
}

const TOP_TAB_LABEL: Record<TopTab, string> = {
  board: "게시판",
  activity: "모임 활동",
};

export default function MyRepliesPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const topTab = getTopTab(searchParams);
  const boardFilter = getBoardFilter(searchParams);
  const activityCircleId = getActivityCircleId(searchParams);

  const [boardReplies, setBoardReplies] = useState<MyReplyItem[]>([]);
  const [activityReplies, setActivityReplies] = useState<MyReplyItem[]>([]);
  const [myCircles, setMyCircles] = useState<CircleResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const circleNameById = useMemo(
    () => new Map(myCircles.map((c) => [c.circleId, c.name])),
    [myCircles],
  );

  const fetchCommunityReplies = async (): Promise<MyReplyItem[]> => {
    const res = await postApi.getMyCommunityRepliedPosts({ board: "all" });
    return res.data
      .filter((reply) => reply.boardType === "FREE" || reply.boardType === "NOTICE")
      .map((reply) => ({ source: "community" as const, reply }));
  };

  const fetchCircleReplies = async (): Promise<MyReplyItem[]> => {
    const circlesRes = await circleApi.getMyCircles();
    if (circlesRes.data.length === 0) return [];

    const repliesByCircle = await Promise.allSettled(
      circlesRes.data.map((circle) => circleBoardApi.getMyRepliedPosts(circle.circleId)),
    );

    return repliesByCircle.flatMap((result) => {
      if (result.status !== "fulfilled") return [];
      return result.value.data.map((reply) => ({ source: "circle" as const, reply }));
    });
  };

  useEffect(() => {
    circleApi
      .getMyCircles()
      .then((res) => setMyCircles(res.data))
      .catch(() => setMyCircles([]));
  }, []);

  useEffect(() => {
    setLoading(true);
    setError("");

    if (topTab === "activity") {
      postApi
        .getMyCommunityActivityReplies()
        .then((res) => {
          const sorted = res.data
            .map((reply) => ({ source: "activity" as const, reply }))
            .sort(
              (a, b) =>
                new Date(b.reply.createDate).getTime() -
                new Date(a.reply.createDate).getTime(),
            );
          setActivityReplies(sorted);
        })
        .catch(() => setError("내 모임 활동 댓글을 불러오는 중 오류가 발생했습니다."))
        .finally(() => setLoading(false));
      return;
    }

    Promise.all([fetchCommunityReplies(), fetchCircleReplies()])
      .then(([community, circle]) => {
        const merged = [...community, ...circle].sort(
          (a, b) =>
            new Date(b.reply.createDate).getTime() -
            new Date(a.reply.createDate).getTime(),
        );
        setBoardReplies(merged);
      })
      .catch(() => setError("내가 쓴 댓글을 불러오는 중 오류가 발생했습니다."))
      .finally(() => setLoading(false));
  }, [topTab]);

  const counts = useMemo(
    () => ({
      all: boardReplies.length,
      community: boardReplies.filter((item) => item.source === "community").length,
      circle: boardReplies.filter((item) => item.source === "circle").length,
    }),
    [boardReplies],
  );

  const displayedReplies = useMemo(() => {
    if (topTab === "activity") {
      if (activityCircleId === "all") return activityReplies;
      return activityReplies.filter((item) => item.reply.circleId === activityCircleId);
    }
    if (boardFilter === "community") {
      return boardReplies.filter((item) => item.source === "community");
    }
    if (boardFilter === "circle") {
      return boardReplies.filter((item) => item.source === "circle");
    }
    return boardReplies;
  }, [activityCircleId, activityReplies, boardFilter, boardReplies, topTab]);

  const switchTopTab = (tab: TopTab) => {
    if (tab === "activity") {
      setSearchParams(
        { tab: "activity", circleId: activityCircleId === "all" ? "all" : String(activityCircleId) },
        { replace: true },
      );
      return;
    }
    setSearchParams({ tab: "board", view: boardFilter }, { replace: true });
  };

  const switchBoardFilter = (view: BoardFilter) => {
    setSearchParams({ tab: "board", view }, { replace: true });
  };

  const switchActivityCircle = (circleId: number | "all") => {
    setSearchParams(
      { tab: "activity", circleId: circleId === "all" ? "all" : String(circleId) },
      { replace: true },
    );
  };

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <Navbar />

      <div className="mx-auto w-full max-w-4xl flex-1 px-4 py-10">
        <button
          onClick={() => navigate("/users/profile")}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            fontSize: 13,
            color: "#888",
            marginBottom: 6,
            padding: 0,
          }}
        >
          ← 마이페이지로 돌아가기
        </button>
        <h1 className="mb-8 text-2xl font-extrabold text-gray-900">
          내가 쓴 댓글
        </h1>

        <div className="mb-6 flex gap-2 border-b border-gray-200">
          {(["board", "activity"] as TopTab[]).map((tab) => {
            const isActive = topTab === tab;
            return (
              <button
                key={tab}
                type="button"
                onClick={() => switchTopTab(tab)}
                className={`border-b-2 px-3 py-2 text-sm font-semibold transition-colors ${
                  isActive
                    ? "border-moa-primary text-moa-primary"
                    : "border-transparent text-gray-400 hover:text-gray-700"
                }`}
              >
                {TOP_TAB_LABEL[tab]}
              </button>
            );
          })}
        </div>

        <div className="flex gap-6">
          {topTab === "board" && (
            <aside className="w-44 shrink-0">
              <nav className="sticky top-24 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                <SidebarItem
                  icon={<MessageSquare className="h-4 w-4" />}
                  label="전체"
                  badge={!loading && counts.all > 0 ? counts.all : undefined}
                  active={boardFilter === "all"}
                  onClick={() => switchBoardFilter("all")}
                />
                <div className="mx-4 h-px bg-gray-100" />
                <SidebarItem
                  icon={<MessageSquare className="h-4 w-4" />}
                  label="커뮤니티"
                  badge={
                    !loading && counts.community > 0 ? counts.community : undefined
                  }
                  active={boardFilter === "community"}
                  onClick={() => switchBoardFilter("community")}
                />
                <div className="mx-4 h-px bg-gray-100" />
                <SidebarItem
                  icon={<Users className="h-4 w-4" />}
                  label="모임"
                  badge={!loading && counts.circle > 0 ? counts.circle : undefined}
                  active={boardFilter === "circle"}
                  onClick={() => switchBoardFilter("circle")}
                />
              </nav>
            </aside>
          )}
          {topTab === "activity" && (
            <aside className="w-44 shrink-0">
              <nav className="sticky top-24 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                <SidebarItem
                  icon={<Activity className="h-4 w-4" />}
                  label="전체"
                  badge={
                    !loading && activityReplies.length > 0
                      ? activityReplies.length
                      : undefined
                  }
                  active={activityCircleId === "all"}
                  onClick={() => switchActivityCircle("all")}
                />
                {myCircles.map((circle) => {
                  const count = activityReplies.filter(
                    (item) => item.reply.circleId === circle.circleId,
                  ).length;
                  return (
                    <div key={circle.circleId}>
                      <div className="mx-4 h-px bg-gray-100" />
                      <SidebarItem
                        icon={<Users className="h-4 w-4" />}
                        label={circle.name}
                        badge={!loading && count > 0 ? count : undefined}
                        active={activityCircleId === circle.circleId}
                        onClick={() => switchActivityCircle(circle.circleId)}
                      />
                    </div>
                  );
                })}
              </nav>
            </aside>
          )}

          <main className="min-w-0 flex-1">
            {loading ? (
              <div className="flex h-40 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-moa-primary" />
              </div>
            ) : error ? (
              <p className="rounded-xl bg-red-50 px-5 py-4 text-sm text-red-600">
                {error}
              </p>
            ) : displayedReplies.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-white py-16 text-center">
                <Inbox className="h-8 w-8 text-gray-300" />
                <p className="mt-3 text-sm font-medium text-gray-500">
                  작성한 댓글이 없습니다.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {displayedReplies.map((item) => {
                  const circleName =
                    item.reply.circleId != null
                      ? (circleNameById.get(item.reply.circleId) ?? "모임")
                      : "모임";
                  const label =
                    item.source === "community"
                      ? item.reply.boardType === "NOTICE"
                        ? "커뮤니티 · 공지"
                        : "커뮤니티 · 자유"
                      : item.source === "circle"
                        ? `모임 · ${circleName}`
                        : `모임 활동 · ${circleName}`;

                  return (
                    <Link
                      key={`${item.source}-${item.reply.replyId}-${item.reply.postId}`}
                      to={toDetailPath(item)}
                      className="block rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition-colors hover:border-moa-muted"
                    >
                      <div className="mb-2 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2 text-xs font-semibold text-gray-400">
                          {item.source === "activity" ? (
                            <Activity className="h-4 w-4" />
                          ) : item.source === "circle" ? (
                            <Users className="h-4 w-4" />
                          ) : (
                            <MessageSquare className="h-4 w-4" />
                          )}
                          {label}
                        </div>
                        <span className="text-xs text-gray-400">
                          {new Date(item.reply.createDate).toLocaleDateString("ko-KR")}
                        </span>
                      </div>
                      <h2 className="line-clamp-1 text-base font-bold text-gray-900">
                        {item.reply.content}
                      </h2>
                      <p className="mt-1 line-clamp-1 text-xs text-gray-500">
                        게시글: {item.reply.postTitle}
                      </p>
                      <p className="mt-1 text-xs text-gray-400">
                        좋아요 {item.reply.likeCount}
                      </p>
                    </Link>
                  );
                })}
              </div>
            )}
          </main>
        </div>
      </div>

      <Footer />
    </div>
  );
}

function SidebarItem({
  icon,
  label,
  badge,
  active,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  badge?: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center gap-2.5 px-4 py-3.5 text-left text-sm font-medium transition-colors ${
        active
          ? "bg-[#EAF4F0] text-[#5F8F7B]"
          : "text-gray-500 hover:bg-gray-50 hover:text-gray-800"
      }`}
    >
      <span className={active ? "text-[#5F8F7B]" : "text-gray-400"}>{icon}</span>
      <span className="flex-1 truncate">{label}</span>
      {badge != null && (
        <span
          className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
            active ? "bg-white text-[#5F8F7B]" : "bg-gray-100 text-gray-500"
          }`}
        >
          {badge}
        </span>
      )}
    </button>
  );
}
