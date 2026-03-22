import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import Footer from "../../common/layout/Footer";
import Navbar from "../../common/layout/Navbar";
import CircleBoardSelector from "../components/CircleBoardSelector";
import { useCircleBoards } from "../hooks/useCircleBoards";
import PostEditorPageShell from "../../post/components/PostEditorPageShell";
import { parseRouteNumber } from "../utils/boardRouteHelpers";
import { usePostDetail } from "../../post/hooks/usePostDetail";
import { usePostForm } from "../../post/hooks/usePostForm";
import { postRoutes } from "../../post/routes/postRoutes";

export default function CirclePostFormPage() {
  const { circleId, boardId, postId } = useParams<{
    circleId: string;
    boardId?: string;
    postId?: string;
  }>();
  const location = useLocation();
  const navigate = useNavigate();
  const isEdit = location.pathname.endsWith("/edit");

  const circleIdNumber = parseRouteNumber(circleId);
  const boardIdNumber = parseRouteNumber(boardId ?? "");
  const postIdNumber = parseRouteNumber(postId ?? "");
  const hasValidRouteBoardId = boardId == null || boardIdNumber !== null;
  const hasValidParams =
    circleIdNumber !== null &&
    hasValidRouteBoardId &&
    (!isEdit || (boardIdNumber !== null && postIdNumber !== null));
  const [selectedBoardId, setSelectedBoardId] = useState<number | undefined>(
    !isEdit && boardIdNumber !== null ? boardIdNumber : undefined,
  );
  const [boardValidationError, setBoardValidationError] = useState("");

  const { data: boards, loading: boardsLoading, error: boardsError } = useCircleBoards({
    circleId: circleIdNumber ?? 0,
    enabled: hasValidParams && !isEdit,
  });

  useEffect(() => {
    if (isEdit) return;
    setSelectedBoardId(boardIdNumber !== null ? boardIdNumber : undefined);
    setBoardValidationError("");
  }, [isEdit, boardIdNumber]);

  const { data, loading: detailLoading, error: detailError } = usePostDetail({
    kind: "circle",
    circleId: circleIdNumber ?? 0,
    boardId: boardIdNumber ?? 0,
    postId: postIdNumber ?? 0,
    enabled: hasValidParams && isEdit,
  });
  const { submitting, deleting, error, submit, remove } = usePostForm();
  const listTargetBoardId = isEdit ? boardIdNumber : selectedBoardId;
  const listPath = listTargetBoardId !== null && listTargetBoardId !== undefined
    ? postRoutes.circleBoard(circleIdNumber ?? 0, listTargetBoardId)
    : postRoutes.circleAll(circleIdNumber ?? 0);

  if (!hasValidParams) {
    return (
      <div style={{ minHeight: "100vh", backgroundColor: "#f7f7f8" }}>
        <Navbar />
        <main style={{ maxWidth: 900, margin: "0 auto", padding: "24px 16px" }}>
          <p style={{ color: "#dc2626" }}>잘못된 경로입니다.</p>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f7f7f8" }}>
      <Navbar />
      <PostEditorPageShell
        title={isEdit ? "써클 게시글 수정" : "써클 게시글 작성"}
        listPath={listPath}
        mode={isEdit ? "edit" : "create"}
        detailLoading={detailLoading}
        detailError={detailError}
        submitError={error}
        showForm={!isEdit || !!data}
        initialValue={data ? { title: data.title, content: data.content } : undefined}
        submitting={submitting}
        deleting={deleting}
        preFormSlot={!isEdit ? (
          <div style={{ marginBottom: 12 }}>
            <CircleBoardSelector
              boards={boards}
              selectedBoardId={selectedBoardId}
              onChange={(nextBoardId) => {
                setSelectedBoardId(nextBoardId);
                setBoardValidationError("");
              }}
              placeholderLabel="게시판 선택"
            />
            {boardsLoading && <p style={{ margin: "8px 0 0", fontSize: 13, color: "#777" }}>게시판 불러오는 중...</p>}
            {boardsError && <p style={{ margin: "8px 0 0", fontSize: 13, color: "#dc2626" }}>{boardsError}</p>}
            {boardValidationError && <p style={{ margin: "8px 0 0", fontSize: 13, color: "#dc2626" }}>{boardValidationError}</p>}
          </div>
        ) : undefined}
        onSubmit={async (values) => {
          const activeBoardId = isEdit ? boardIdNumber : selectedBoardId;
          if (activeBoardId === null || activeBoardId === undefined) {
            setBoardValidationError("게시판을 선택해주세요.");
            return;
          }
          const savedPostId = await submit({
            kind: "circle",
            values,
            circleId: circleIdNumber,
            boardId: activeBoardId,
            postId: isEdit ? postIdNumber ?? undefined : undefined,
          });
          navigate(postRoutes.circleDetail(circleIdNumber, activeBoardId, savedPostId));
        }}
        onDelete={isEdit ? async () => {
          if (boardIdNumber === null || postIdNumber === null) {
            return;
          }
          if (!window.confirm("게시글을 삭제하시겠습니까?")) {
            return;
          }
          await remove({
            kind: "circle",
            circleId: circleIdNumber ?? 0,
            boardId: boardIdNumber,
            postId: postIdNumber,
          });
          navigate(postRoutes.circleBoard(circleIdNumber ?? 0, boardIdNumber));
        } : undefined}
      />
      <Footer />
    </div>
  );
}
