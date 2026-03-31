import { Eye, Heart } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { circleApi } from "../../api/circleApi";
import { circleBoardApi, type CircleBoardResponse } from "../../api/circleBoardApi";
import type { CircleResponse } from "../../circle/types/circle";
import CommentBubbleIcon from "../../common/components/CommentBubbleIcon";
import CircleActivityComposer from "../../common/components/CircleActivityComposer";
import CircleDetailBanner from "../../common/components/CircleDetailBanner";
import CircleDetailTabs from "../../common/components/CircleDetailTabs";
import Footer from "../../common/layout/Footer";
import Navbar from "../../common/layout/Navbar";
import "../../board/pages/boardCommunity.css";
import CommunityProfileCard, {
  type CommunityProfileQuickView,
} from "../../board/components/CommunityProfileCard";
import CommunityRightSidebar from "../../board/components/CommunityRightSidebar";
import type { PostResponse } from "../types/postTypes";
import { useAuthStore } from "../../store/authStore";
import { getErrorMessage } from "../../common/utils/errorMessage";

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

const parseBoardName = (boardMap: Map<number, CircleBoardResponse>, post: PostResponse) =>
  boardMap.get(post.boardId)?.name ?? "게시판";

export default function CirclePhotoTabPage() {
  const { circleId } = useParams<{ circleId: string }>();
  const cid = Number(circleId);
  const navigate = useNavigate();
  const { isLoggedIn, user } = useAuthStore();

  const [circle, setCircle] = useState<CircleResponse | null>(null);
  const [boards, setBoards] = useState<CircleBoardResponse[]>([]);
  const [posts, setPosts] = useState<PostResponse[]>([]);
  const [selectedView, setSelectedView] = useState<CommunityProfileQuickView>("home");
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const loadActivityPage = useCallback(async () => {
    if (!circleId || Number.isNaN(cid)) {
      navigate("/circle", { replace: true });
      return;
    }

    setLoading(true);
    setErrorMessage("");
    try {
      const [circleRes, boardRes, postRes] = await Promise.all([
        circleApi.getCircle(cid),
        circleBoardApi.getBoards(cid),
        circleBoardApi.getAllPosts(cid),
      ]);
      setCircle(circleRes.data);
      setBoards(boardRes.data);
      setPosts(postRes.data);
    } catch (e) {
      setErrorMessage(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }, [cid, circleId, navigate]);

  const refreshPosts = useCallback(async () => {
    if (!circleId || Number.isNaN(cid)) return;
    const postRes = await circleBoardApi.getAllPosts(cid);
    setPosts(postRes.data);
  }, [cid, circleId]);

  useEffect(() => {
    void loadActivityPage();
  }, [loadActivityPage]);

  const boardMap = useMemo(
    () => new Map<number, CircleBoardResponse>(boards.map((board) => [board.boardId, board])),
    [boards],
  );

  const activityOnlyPosts = useMemo(
    () =>
      posts
        .map((post) => ({ post, imageUrls: extractImageUrls(post.content) }))
        .filter((item) => item.imageUrls.length > 0),
    [posts],
  );

  const filteredPosts = useMemo(() => {
    const byView =
      selectedView === "myPosts"
        ? isLoggedIn
          ? activityOnlyPosts.filter((item) => item.post.authorName === user?.nickname)
          : []
        : selectedView === "myReplies" || selectedView === "scrap"
          ? []
          : activityOnlyPosts;

    return [...byView].sort(
      (a, b) => new Date(b.post.createDate).getTime() - new Date(a.post.createDate).getTime(),
    );
  }, [activityOnlyPosts, isLoggedIn, selectedView, user?.nickname]);

  const emptyText = useMemo(() => {
    if ((selectedView === "myPosts" || selectedView === "myReplies" || selectedView === "scrap") && !isLoggedIn) {
      return "로그인 후 목록을 확인할 수 있습니다.";
    }
    if (selectedView === "myReplies") {
      return "모임활동 댓글 모아보기는 준비 중입니다.";
    }
    if (selectedView === "scrap") {
      return "모임활동 스크랩 기능은 준비 중입니다.";
    }
    if (selectedView === "myPosts") {
      return "작성한 모임활동이 없습니다.";
    }
    return "이미지가 포함된 모임활동 게시글이 없습니다.";
  }, [isLoggedIn, selectedView]);

  const boardFromPath = useMemo(
    () => `/circle/${cid}/activity`,
    [cid],
  );

  const handleSelectView = (nextView: CommunityProfileQuickView) => {
    setSelectedView(nextView);
    requestAnimationFrame(() => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  };

  return (
    <div className="board-community-page" style={{ minHeight: "100vh", backgroundColor: "#f7f7f8" }}>
      <Navbar />
      <main style={{ maxWidth: 1200, margin: "0 auto", padding: "24px 16px 60px" }}>
        {!loading && circle && <CircleDetailBanner circle={circle} />}
        <CircleDetailTabs circleId={cid} activeTab="activity" />

        {loading && <p style={{ margin: 0, color: "#6b7280" }}>모임활동을 불러오는 중...</p>}
        {!loading && errorMessage && <p style={{ margin: 0, color: "#dc2626" }}>{errorMessage}</p>}

        {!loading && !errorMessage && (
          <>
            <div className="community-sticky-gap" aria-hidden="true" />
            <section className="board-community-layout">
              <aside className="community-left-sidebar" style={{ display: "grid", gap: 12 }}>
                <CommunityProfileCard
                  selectedView={selectedView}
                  onSelectView={handleSelectView}
                  writeHref={`/circle/${cid}/activity`}
                />
              </aside>

              <section className="community-center-column">
                <CircleActivityComposer
                  circleId={cid}
                  boards={boards}
                  selectedBoard="all"
                  onCreated={() => void refreshPosts()}
                />

                {filteredPosts.length === 0 ? (
                  <p style={{ margin: 0, color: "#6b7280" }}>{emptyText}</p>
                ) : (
                  <ul className="community-post-list">
                    {filteredPosts.map(({ post, imageUrls }) => {
                      const boardName = parseBoardName(boardMap, post);
                      return (
                        <li key={post.postId}>
                          <Link
                            to={`/circle/${cid}/board/${post.boardId}/posts/${post.postId}`}
                            state={{ from: boardFromPath }}
                            className="community-post-item-link"
                          >
                            <div className="community-post-item-body">
                              <p className="community-post-item-title">
                                <span className="community-post-item-title-text">
                                  {post.title} <span style={{ color: "#0ea5a0", fontWeight: 700 }}>[사진 {imageUrls.length}]</span>
                                </span>
                                <span className="community-post-item-board">· {boardName}</span>
                              </p>
                              <p className="community-post-item-meta">
                                <span>{post.authorName}</span>
                                <span className="community-post-item-stat">
                                  <Eye size={14} />
                                  {post.viewCount}
                                </span>
                                <span className="community-post-item-stat">
                                  <CommentBubbleIcon size={14} strokeWidth={1.8} />
                                  {post.replyCount}
                                </span>
                                <span className="community-post-item-stat">
                                  <Heart size={14} />
                                  {post.likeCount}
                                </span>
                                <span>{toDateLabel(post.createDate)}</span>
                              </p>
                            </div>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </section>

              <CommunityRightSidebar />
            </section>
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}
