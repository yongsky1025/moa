import { Link } from "react-router-dom";
import type { BoardResponse } from "../types/boardTypes";
import type { PostResponse } from "../../post/types/postTypes";
import { postRoutes } from "../../post/routes/postRoutes";
import BoardPreviewPostList from "./BoardPreviewPostList";

interface BoardPreviewCardProps {
  circleId: number;
  board: BoardResponse;
  posts: PostResponse[];
}

export default function BoardPreviewCard({ circleId, board, posts }: BoardPreviewCardProps) {
  return (
    <section style={{ backgroundColor: "white", border: "1px solid #ececec", borderRadius: 12, padding: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
        <h3 style={{ margin: 0, fontSize: 17, color: "#111" }}>{board.name}</h3>
        <Link to={postRoutes.circleBoard(circleId, board.boardId)} style={{ fontSize: 13, color: "#555" }}>
          전체 보기
        </Link>
      </div>
      <BoardPreviewPostList circleId={circleId} boardId={board.boardId} boardName={board.name} posts={posts} />
    </section>
  );
}
