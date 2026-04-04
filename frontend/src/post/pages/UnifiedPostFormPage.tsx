import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import Footer from "../../common/layout/Footer";
import Navbar from "../../common/layout/Navbar";
import BoardSectionHeader from "../../common/components/BoardSectionHeader";
import CircleActivityComposer from "../../common/components/CircleActivityComposer";
import PostEditorPageShell from "../components/PostEditorPageShell";
import { usePostDetail } from "../hooks/usePostDetail";
import { usePostForm } from "../hooks/usePostForm";
import { postRoutes } from "../routes/postRoutes";
import type { PostFormValues, PostKind, PostResponse } from "../types/postTypes";
import {
  NOTICE_CATEGORY_OPTIONS,
  type NoticeCategory,
} from "../constants/noticeCategory";
import { circleBoardApi, type CircleBoardResponse } from "../../api/circleBoardApi";
import { getErrorMessage } from "../../common/utils/errorMessage";

function resolveKind(pathname: string): Exclude<PostKind, "circle"> {
  if (pathname.includes("/notice")) return "notice";
  return "free";
}

function resolveQueryKind(
  search: string,
  isAdmin: boolean,
  defaultKind: Exclude<PostKind, "circle">,
): Exclude<PostKind, "circle"> | "" {
  const params = new URLSearchParams(search);
  const board = params.get("board");
  const shouldSelectBoard = params.get("selectBoard") === "true";
  const fromBoard = params.get("fromBoard");

  if (shouldSelectBoard || fromBoard === "all" || fromBoard === "review" || fromBoard === "qna") {
    return "";
  }
  if (board === "notice") {
    return isAdmin ? "notice" : "free";
  }
  if (board === "free") {
    return "free";
  }
  return defaultKind;
}

function CommunityPostFormScene() {
  const { postId } = useParams<{ postId: string }>();
  const postIdNumber = Number(postId);
  const location = useLocation();
  const navigate = useNavigate();
  const kind = resolveKind(location.pathname);
  const isEdit = location.pathname.endsWith("/edit");
  const { isLoggedIn, user } = useAuthStore();
  const isAdmin = user?.userRole === "ADMIN";
  const unauthorizedHandledRef = useRef(false);
  const [noticeCategory, setNoticeCategory] = useState<NoticeCategory>("ANNOUNCEMENT");
  const [selectedKind, setSelectedKind] = useState<Exclude<PostKind, "circle"> | "">(() =>
    resolveQueryKind(location.search, isAdmin, kind),
  );

  const {
    data,
    loading: detailLoading,
    error: detailError,
  } = usePostDetail({
    kind,
    postId: postIdNumber,
    enabled: isEdit && !Number.isNaN(postIdNumber),
  });
  const { submitting, deleting, error, submit, remove } = usePostForm();
  const activeKind = isEdit ? kind : selectedKind || "free";
  const listPath = activeKind === "notice" ? postRoutes.noticeBase : postRoutes.freeBase;
  const detailPath =
    isEdit && !Number.isNaN(postIdNumber)
      ? kind === "notice"
        ? postRoutes.noticeDetail(postIdNumber)
        : postRoutes.freeDetail(postIdNumber)
      : listPath;

  useEffect(() => {
    if (!isEdit) return;
    if (postId && Number.isNaN(postIdNumber)) {
      navigate(listPath, { replace: true });
    }
  }, [isEdit, postId, postIdNumber, listPath, navigate]);

  useEffect(() => {
    if (unauthorizedHandledRef.current) return;

    if (!isEdit) {
      const unauthorizedCreate =
        (kind === "free" && !isLoggedIn) || (kind === "notice" && !isAdmin);
      if (unauthorizedCreate) {
        unauthorizedHandledRef.current = true;
        alert("권한이 없습니다.");
        navigate(listPath, { replace: true });
      }
      return;
    }

    if (detailLoading || !data) return;

    const isOwner = !!user && data.authorPublicId === user.publicId;
    const unauthorizedEdit =
      (kind === "free" && !isOwner) || (kind === "notice" && !isAdmin);

    if (unauthorizedEdit) {
      unauthorizedHandledRef.current = true;
      alert("권한이 없습니다.");
      navigate(detailPath, { replace: true });
    }
  }, [
    isEdit,
    kind,
    isLoggedIn,
    isAdmin,
    user,
    data,
    detailLoading,
    listPath,
    detailPath,
    navigate,
  ]);

  useEffect(() => {
    if (!isEdit || !data || kind !== "notice") return;
    setNoticeCategory((data.noticeCategory as NoticeCategory | undefined) ?? "ANNOUNCEMENT");
  }, [isEdit, data, kind]);

  useEffect(() => {
    if (isEdit) {
      setSelectedKind(kind);
      return;
    }
    setSelectedKind(resolveQueryKind(location.search, isAdmin, kind));
  }, [isEdit, kind, location.search, isAdmin]);

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f7f7f8" }}>
      <Navbar />
      <BoardSectionHeader
        title={isEdit ? "게시글 수정" : "게시글 작성"}
        backTo={isEdit ? detailPath : listPath}
        backLabel={isEdit ? "이전으로 이동" : "목록으로 이동"}
      />
      <PostEditorPageShell
        title={isEdit ? "게시글 수정" : "게시글 작성"}
        listPath={isEdit ? detailPath : listPath}
        listLabel={isEdit ? "이전으로" : "목록으로"}
        mode={isEdit ? "edit" : "create"}
        detailLoading={detailLoading}
        detailError={detailError}
        submitError={error}
        showForm={!isEdit || !!data}
        initialValue={data ? { title: data.title, content: data.content } : undefined}
        submitting={submitting}
        deleting={deleting}
        preFormSlot={
          <>
            {!isEdit && (
              <div className="post-editor-board-group" style={{ marginBottom: 16 }}>
                <label className="post-editor-label" htmlFor="post-board-kind">
                  게시판 선택
                </label>
                <select
                  id="post-board-kind"
                  value={selectedKind}
                  onChange={(e) => setSelectedKind(e.target.value as Exclude<PostKind, "circle"> | "")}
                  className="post-editor-board-select"
                >
                  <option value="">게시판을 선택해주세요</option>
                  <option value="free">자유게시판</option>
                  {isAdmin && <option value="notice">공지사항</option>}
                </select>
              </div>
            )}
            {activeKind === "notice" ? (
              <div className="post-editor-board-group" style={{ marginBottom: 16 }}>
                <label className="post-editor-label" htmlFor="notice-category">
                  카테고리
                </label>
                <select
                  id="notice-category"
                  value={noticeCategory}
                  onChange={(e) => setNoticeCategory(e.target.value as NoticeCategory)}
                  className="post-editor-board-select"
                >
                  {NOTICE_CATEGORY_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            ) : null}
          </>
        }
        onSubmit={async (values) => {
          const submitKind = isEdit ? kind : selectedKind;
          if (!submitKind) {
            window.alert("게시판을 선택해주세요.");
            return;
          }
          if (isEdit && data) {
            const isChanged =
              values.title !== data.title ||
              values.content !== data.content ||
              (submitKind === "notice" &&
                noticeCategory !==
                  ((data.noticeCategory as NoticeCategory | undefined) ?? "ANNOUNCEMENT"));
            if (!isChanged) {
              navigate(detailPath);
              return;
            }
          }

          const savedPostId = await submit({
            kind: submitKind,
            values: {
              ...values,
              noticeCategory: submitKind === "notice" ? noticeCategory : undefined,
            },
            postId: isEdit ? postIdNumber : undefined,
          });
          const savedDetailPath =
            submitKind === "notice"
              ? postRoutes.noticeDetail(savedPostId)
              : postRoutes.freeDetail(savedPostId);
          if (isEdit) {
            window.alert("게시글 수정이 완료되었습니다.");
          }
          navigate(savedDetailPath);
        }}
        onDelete={isEdit ? async () => {
          if (!window.confirm("게시글을 삭제하시겠습니까?")) {
            return;
          }
          await remove({
            kind,
            postId: postIdNumber,
          });
          window.alert("게시글 삭제가 완료되었습니다.");
          navigate(listPath);
        } : undefined}
      />
      <Footer />
    </div>
  );
}

function CirclePostFormScene() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const location = useLocation();
  const { circleId, boardId, postId } = useParams<{
    circleId: string;
    boardId: string;
    postId?: string;
  }>();
  const { isLoggedIn, user } = useAuthStore();

  const cid = Number(circleId);
  const bid = Number(boardId);
  const pid = Number(postId);
  const isEdit = location.pathname.endsWith("/edit");
  const fromQuery = new URLSearchParams(location.search).get("from");
  const locationState = location.state as { from?: string } | null;
  const fromState = locationState?.from;
  const isActivityContext =
    fromQuery === "activity" ||
    (typeof fromState === "string" && fromState.includes(`/circle/${cid}/activity`));

  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [selectedBoardId, setSelectedBoardId] = useState<string>("");

  const hasValidRequiredParams =
    !!circleId &&
    !!boardId &&
    Number.isInteger(cid) &&
    Number.isInteger(bid) &&
    cid > 0 &&
    bid > 0;
  const hasValidEditParams = hasValidRequiredParams && !!postId && Number.isInteger(pid) && pid > 0;

  const listPath = hasValidRequiredParams
    ? isActivityContext
      ? `/circle/${cid}/activity`
      : `/circle/${cid}/board?board=${bid}`
    : "/circle";
  const createListPath = hasValidRequiredParams
    ? isActivityContext
      ? `/circle/${cid}/activity`
      : selectedBoardId
        ? `/circle/${cid}/board?board=${selectedBoardId}`
        : `/circle/${cid}/board`
    : "/circle";
  const detailPath = hasValidEditParams
    ? `/circle/${cid}/board/${bid}/posts/${pid}`
    : listPath;

  useEffect(() => {
    if (hasValidRequiredParams && (!isEdit || hasValidEditParams)) {
      return;
    }
    navigate("/circle", { replace: true });
  }, [hasValidEditParams, hasValidRequiredParams, isEdit, navigate]);

  useEffect(() => {
    if (isLoggedIn) {
      return;
    }
    navigate("/users/login", { replace: true });
  }, [isLoggedIn, navigate]);

  const { data: boards = [] } = useQuery<CircleBoardResponse[]>({
    queryKey: ["circleBoardsForPostForm", cid],
    enabled: hasValidRequiredParams && isLoggedIn,
    queryFn: async () => (await circleBoardApi.getBoards(cid)).data,
  });

  const {
    data: post = null,
    isPending: detailLoading,
    isError: detailIsError,
    error: detailQueryError,
  } = useQuery<PostResponse | null>({
    queryKey: ["circlePostForForm", cid, bid, pid],
    enabled: isEdit && hasValidEditParams && isLoggedIn,
    queryFn: async () => (await circleBoardApi.getBoardPost(cid, bid, pid)).data,
  });

  const detailError = detailIsError ? getErrorMessage(detailQueryError) : "";
  const writableBoards = useMemo(
    () => boards.filter((board) => board.circleBoardKind !== "ACTIVITY"),
    [boards],
  );
  useEffect(() => {
    if (isEdit) {
      return;
    }
    if (isActivityContext) {
      setSelectedBoardId("");
      return;
    }
    const currentBoard = boards.find((board) => board.boardId === bid);
    if (currentBoard && currentBoard.circleBoardKind !== "ACTIVITY") {
      setSelectedBoardId(String(currentBoard.boardId));
      return;
    }
    setSelectedBoardId("");
  }, [bid, boards, isActivityContext, isEdit]);

  useEffect(() => {
    if (!isEdit || !post || !user) {
      return;
    }
    const isOwner = post.authorPublicId === user.publicId;
    if (isOwner) {
      return;
    }
    window.alert("권한이 없습니다.");
    navigate(detailPath, { replace: true });
  }, [detailPath, isEdit, navigate, post, user]);


  const handleSubmit = async (values: PostFormValues) => {
    if (!hasValidRequiredParams || (isEdit && !hasValidEditParams)) {
      return;
    }
    if (isEdit && post) {
      const isChanged = values.title !== post.title || values.content !== post.content;
      if (!isChanged) {
        navigate(detailPath);
        return;
      }
    }

    const targetBoardId = isEdit ? bid : Number(selectedBoardId);
    if (!isEdit && (!Number.isInteger(targetBoardId) || targetBoardId <= 0)) {
      window.alert("게시판 종류를 선택해주세요.");
      return;
    }

    setSubmitting(true);
    setSubmitError("");
    try {
      const savedPostId = isEdit
        ? (await circleBoardApi.updatePost(cid, bid, pid, values)).data
        : (await circleBoardApi.createPost(cid, targetBoardId, values)).data;

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["circleBoardPosts", cid] }),
        queryClient.invalidateQueries({ queryKey: ["circleBoardsForBoardTab", cid] }),
      ]);

      if (isEdit) {
        window.alert("게시글 수정이 완료되었습니다.");
      }
      navigate(`/circle/${cid}/board/${targetBoardId}/posts/${savedPostId}`, {
        state: { from: createListPath },
      });
    } catch (error) {
      setSubmitError(getErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!isEdit || !hasValidEditParams) {
      return;
    }
    if (!window.confirm("게시글을 삭제하시겠습니까?")) {
      return;
    }
    setDeleting(true);
    setSubmitError("");
    try {
      await circleBoardApi.deletePost(cid, bid, pid);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["circleBoardPosts", cid] }),
        queryClient.invalidateQueries({ queryKey: ["circleBoardsForBoardTab", cid] }),
      ]);
      window.alert("게시글 삭제가 완료되었습니다.");
      navigate(listPath);
    } catch (error) {
      setSubmitError(getErrorMessage(error));
    } finally {
      setDeleting(false);
    }
  };

  if (isEdit && isActivityContext) {
    return (
      <div style={{ minHeight: "100vh", backgroundColor: "#f7f7f8" }}>
        <Navbar />
        <BoardSectionHeader
          title="모임 활동 수정"
          backTo={detailPath}
          backLabel="이전으로 이동"
        />
        <main style={{ maxWidth: 860, margin: "0 auto", padding: "14px 16px 32px" }}>
          {detailLoading && <p style={{ margin: 0, color: "#6b7280" }}>모임 활동을 불러오는 중...</p>}
          {!detailLoading && detailError && <p style={{ margin: 0, color: "#dc2626" }}>{detailError}</p>}
          {!detailLoading && !detailError && post && (
            <CircleActivityComposer
              circleId={cid}
              circleName={post.circleName ?? undefined}
              boards={boards}
              selectedBoard={bid}
              mode="edit"
              editConfig={{
                boardId: bid,
                postId: pid,
                title: post.title,
                content: post.content,
                activityPublic: post.activityPublic ?? true,
              }}
              onCreated={() => {
                void Promise.all([
                  queryClient.invalidateQueries({ queryKey: ["circleBoardPosts", cid] }),
                  queryClient.invalidateQueries({ queryKey: ["circleBoardsForBoardTab", cid] }),
                ]);
                window.alert("모임 활동 수정이 완료되었습니다.");
                navigate(detailPath, { state: { from: listPath } });
              }}
            />
          )}
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f7f7f8" }}>
      <Navbar />
      <BoardSectionHeader
        title={isEdit ? "게시글 수정" : "게시글 작성"}
        backTo={isEdit ? detailPath : createListPath}
        backLabel={isEdit ? "이전으로 이동" : "목록으로 이동"}
      />
      <PostEditorPageShell
        title={isEdit ? "게시글 수정" : "게시글 작성"}
        listPath={isEdit ? detailPath : createListPath}
        listLabel={isEdit ? "이전으로" : "목록으로"}
        mode={isEdit ? "edit" : "create"}
        detailLoading={detailLoading}
        detailError={detailError}
        submitError={submitError}
        showForm={!isEdit || !!post}
        initialValue={post ? { title: post.title, content: post.content } : undefined}
        submitting={submitting}
        deleting={deleting}
        preFormSlot={
          !isEdit ? (
            <div className="post-editor-board-group" style={{ marginBottom: 16 }}>
              <label className="post-editor-label" htmlFor="circle-post-board-kind">
                게시판 선택
              </label>
              <select
                id="circle-post-board-kind"
                value={selectedBoardId}
                onChange={(e) => setSelectedBoardId(e.target.value)}
                className="post-editor-board-select"
              >
                <option value="">게시판을 선택해주세요.</option>
                {writableBoards.map((board) => (
                  <option key={board.boardId} value={board.boardId}>
                    {board.name}
                  </option>
                ))}
              </select>
            </div>
          ) : undefined
        }
        onSubmit={handleSubmit}
        onDelete={isEdit ? handleDelete : undefined}
      />
      <Footer />
    </div>
  );
}

export default function UnifiedPostFormPage() {
  const { circleId, boardId } = useParams<{ circleId?: string; boardId?: string }>();
  const isCircleContext = !!circleId && !!boardId;

  if (isCircleContext) {
    return <CirclePostFormScene />;
  }
  return <CommunityPostFormScene />;
}
