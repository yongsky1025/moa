import { useState } from "react";
import type { CSSProperties } from "react";
import Navbar from "../../common/layout/Navbar";
import Footer from "../../common/layout/Footer";
import {
  BoardDetailSkeleton,
  BoardListSkeleton,
  BoardPreviewSectionSkeleton,
  BoardSelectorSkeleton,
  BoardSideMenuSkeleton,
  CommonEditorSkeleton,
  ReplyListSkeleton,
} from "../../common/components/BoardLoadingSkeletons";

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
          <h2 style={sectionTitleStyle}>리스트 개수 조절</h2>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <input
              type="range"
              min={1}
              max={10}
              value={count}
              onChange={(e) => setCount(Number(e.target.value))}
            />
            <strong style={{ minWidth: 24 }}>{count}</strong>
          </div>
        </section>

        <div style={{ display: "grid", gap: 16 }}>
          <section style={sectionCardStyle}>
            <h2 style={sectionTitleStyle}>1) 게시글 목록</h2>
            <BoardListSkeleton count={count} />
          </section>

          <section style={sectionCardStyle}>
            <h2 style={sectionTitleStyle}>2) 게시글 상세</h2>
            <BoardDetailSkeleton />
          </section>

          <section style={sectionCardStyle}>
            <h2 style={sectionTitleStyle}>3) 댓글 목록</h2>
            <ReplyListSkeleton count={4} />
          </section>

          <section style={sectionCardStyle}>
            <h2 style={sectionTitleStyle}>4) 게시판 사이드메뉴</h2>
            <BoardSideMenuSkeleton count={6} />
          </section>

          <section style={sectionCardStyle}>
            <h2 style={sectionTitleStyle}>5) 게시판 프리뷰 섹션</h2>
            <BoardPreviewSectionSkeleton />
          </section>

          <section style={sectionCardStyle}>
            <h2 style={sectionTitleStyle}>6) 게시판 선택 셀렉터</h2>
            <BoardSelectorSkeleton />
          </section>

          <section style={sectionCardStyle}>
            <h2 style={sectionTitleStyle}>7) 글 작성/수정 에디터</h2>
            <CommonEditorSkeleton />
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
