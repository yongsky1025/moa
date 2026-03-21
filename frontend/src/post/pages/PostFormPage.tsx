import { useEffect, useRef } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import Footer from "../../common/layout/Footer";
import Navbar from "../../common/layout/Navbar";
import PostEditorPageShell from "../components/PostEditorPageShell";
import { usePostDetail } from "../hooks/usePostDetail";
import { usePostForm } from "../hooks/usePostForm";
import { postRoutes } from "../routes/postRoutes";
import type { PostKind } from "../types/postTypes";
import type { RootState } from "../../users/reducers/store";

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
  const { isLoggedIn, user } = useSelector((state: RootState) => state.auth);
  const isAdmin = user?.userRole === "ADMIN";
  const unauthorizedHandledRef = useRef(false);

  const {
    data,
    loading: detailLoading,
    error: detailError,
  } = usePostDetail({
    kind,
    postId: postIdNumber,
    enabled: isEdit && !Number.isNaN(postIdNumber),
  });
  const { submitting, error, submit } = usePostForm();
  const listPath =
    kind === "notice" ? postRoutes.noticeBase : postRoutes.freeBase;
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

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f7f7f8" }}>
      <Navbar />
      <PostEditorPageShell
        title={isEdit ? "게시글 수정" : "게시글 작성"}
        listPath={listPath}
        mode={isEdit ? "edit" : "create"}
        detailLoading={detailLoading}
        detailError={detailError}
        submitError={error}
        showForm={!isEdit || !!data}
        initialValue={data ? { title: data.title, content: data.content } : undefined}
        submitting={submitting}
        onSubmit={async (values) => {
          const savedPostId = await submit({
            kind,
            values,
            postId: isEdit ? postIdNumber : undefined,
          });
          const savedDetailPath =
            kind === "notice"
              ? postRoutes.noticeDetail(savedPostId)
              : postRoutes.freeDetail(savedPostId);
          navigate(savedDetailPath);
        }}
      />
      <Footer />
    </div>
  );
}
