import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import Footer from "../../common/layout/Footer";
import Navbar from "../../common/layout/Navbar";
import BoardSectionHeader from "../../common/components/BoardSectionHeader";
import PostEditorPageShell from "../components/PostEditorPageShell";
import { usePostDetail } from "../hooks/usePostDetail";
import { usePostForm } from "../hooks/usePostForm";
import { postRoutes } from "../routes/postRoutes";
import type { PostKind } from "../types/postTypes";
import {
  NOTICE_CATEGORY_OPTIONS,
  type NoticeCategory,
} from "../constants/noticeCategory";

function resolveKind(pathname: string): Exclude<PostKind, "circle"> {
  if (pathname.includes("/notice")) return "notice";
  return "free";
}

export default function PostFormPage() {
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
  const listPath =
    kind === "notice" ? postRoutes.noticeBase : postRoutes.freeBase;
  const boardTitle = kind === "notice" ? "공지게시판" : "자유게시판";
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

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f7f7f8" }}>
      <Navbar />
      <BoardSectionHeader
        title={boardTitle}
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
          kind === "notice" ? (
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
          ) : null
        }
        onSubmit={async (values) => {
          if (isEdit && data) {
            const isChanged =
              values.title !== data.title ||
              values.content !== data.content ||
              (kind === "notice" &&
                noticeCategory !==
                  ((data.noticeCategory as NoticeCategory | undefined) ?? "ANNOUNCEMENT"));
            if (!isChanged) {
              navigate(detailPath);
              return;
            }
          }

          const savedPostId = await submit({
            kind,
            values: {
              ...values,
              noticeCategory: kind === "notice" ? noticeCategory : undefined,
            },
            postId: isEdit ? postIdNumber : undefined,
          });
          const savedDetailPath =
            kind === "notice"
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
