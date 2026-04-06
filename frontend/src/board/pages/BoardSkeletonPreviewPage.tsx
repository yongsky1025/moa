import { useState } from "react";
import type { CSSProperties } from "react";
import Navbar from "../../common/layout/Navbar";
import Footer from "../../common/layout/Footer";
import {
  BoardDetailSkeleton,
  BoardPreviewSectionSkeleton,
  BoardSelectorSkeleton,
  BoardSideMenuSkeleton,
  CommonEditorSkeleton,
  ReplyListSkeleton,
} from "../../common/components/BoardLoadingSkeletons";
import CommunityPostListSkeleton from "../components/CommunityPostListSkeleton";
import {
  ActivityFeedListSkeleton,
  BoardMenuSkeleton,
  CircleDetailBannerSkeleton,
  PinnedPreviewSkeleton,
  SidebarPostListSkeleton,
} from "../components/BoardSectionSkeletons";

const sectionTitleStyle: CSSProperties = {
  margin: "0 0 10px",
  fontSize: 16,
  fontWeight: 800,
  color: "#111827",
};

const sectionCardStyle: CSSProperties = {
  border: "1px solid #e5e7eb",
  borderRadius: 14,
  backgroundColor: "#fff",
  padding: 16,
};

export default function BoardSkeletonPreviewPage() {
  const [count, setCount] = useState(5);
  const [showBoardName, setShowBoardName] = useState(true);

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f7f7f8" }}>
      <Navbar />
      <main style={{ maxWidth: 1100, margin: "0 auto", padding: "24px 16px 40px" }}>
        <header style={{ marginBottom: 20 }}>
          <h1 style={{ margin: "0 0 8px", fontSize: 28, color: "#111827" }}>
            게시판 Skeleton UI Preview
          </h1>
          <p style={{ margin: 0, color: "#4b5563", fontSize: 14 }}>
            로딩 상태를 테스트하기 위한 전용 프리뷰 화면입니다.
          </p>
        </header>

        <section style={{ ...sectionCardStyle, marginBottom: 16 }}>
          <h2 style={sectionTitleStyle}>프리뷰 옵션</h2>
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <input
              type="range"
              min={1}
              max={10}
              value={count}
              onChange={(e) => setCount(Number(e.target.value))}
            />
            <strong style={{ minWidth: 24 }}>{count}</strong>
            <label
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                fontSize: 13,
                color: "#374151",
                marginLeft: 8,
              }}
            >
              <input
                type="checkbox"
                checked={showBoardName}
                onChange={(e) => setShowBoardName(e.target.checked)}
              />
              게시판명 표시
            </label>
          </div>
        </section>

        <div style={{ display: "grid", gap: 16 }}>
          <section style={sectionCardStyle}>
            <h2 style={sectionTitleStyle}>1) 모임 상세 배너</h2>
            <CircleDetailBannerSkeleton />
          </section>

          <section style={sectionCardStyle}>
            <h2 style={sectionTitleStyle}>2) 좌측 게시판 메뉴</h2>
            <BoardMenuSkeleton count={Math.max(4, Math.min(8, count))} />
          </section>

          <section style={sectionCardStyle}>
            <h2 style={sectionTitleStyle}>3) 상단 고정글 프리뷰</h2>
            <PinnedPreviewSkeleton count={Math.max(2, Math.min(5, count))} />
          </section>

          <section style={sectionCardStyle}>
            <h2 style={sectionTitleStyle}>4) 게시글 목록 (현재 디자인)</h2>
            <CommunityPostListSkeleton count={count} showBoardName={showBoardName} />
          </section>

          <section style={sectionCardStyle}>
            <h2 style={sectionTitleStyle}>5) 우측 사이드바</h2>
            <SidebarPostListSkeleton count={Math.max(6, Math.min(10, count + 2))} />
          </section>

          <section style={sectionCardStyle}>
            <h2 style={sectionTitleStyle}>6) 모임 활동 피드</h2>
            <ActivityFeedListSkeleton count={Math.max(2, Math.min(4, Math.floor(count / 2) || 2))} />
          </section>

          <section style={sectionCardStyle}>
            <h2 style={sectionTitleStyle}>7) 레거시 공용 스켈레톤 (참고)</h2>
            <div style={{ display: "grid", gap: 14 }}>
              <div>
                <p style={{ margin: "0 0 8px", fontSize: 13, fontWeight: 700, color: "#374151" }}>
                  게시글 상세
                </p>
                <BoardDetailSkeleton />
              </div>
              <div>
                <p style={{ margin: "0 0 8px", fontSize: 13, fontWeight: 700, color: "#374151" }}>
                  댓글 목록
                </p>
                <ReplyListSkeleton count={4} />
              </div>
              <div>
                <p style={{ margin: "0 0 8px", fontSize: 13, fontWeight: 700, color: "#374151" }}>
                  사이드메뉴/프리뷰/셀렉터/에디터
                </p>
                <div style={{ display: "grid", gap: 10 }}>
                  <BoardSideMenuSkeleton count={6} />
                  <BoardPreviewSectionSkeleton />
                  <BoardSelectorSkeleton />
                  <CommonEditorSkeleton />
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
