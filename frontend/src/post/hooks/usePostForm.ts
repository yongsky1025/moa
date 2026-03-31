import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { postApi } from "../api/postApi";
import type { PostFormValues, PostKind } from "../types/postTypes";
import { getErrorMessage } from "../../common/utils/errorMessage";

interface SubmitOptions {
  kind: PostKind;
  values: PostFormValues;
  postId?: number;
}

interface RemoveOptions {
  kind: PostKind;
  postId?: number;
}

export function usePostForm() {
  const queryClient = useQueryClient();
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  const submit = async ({ kind, values, postId }: SubmitOptions): Promise<number> => {
    setSubmitting(true);
    setError("");
    try {
      if (kind === "free") {
        const savedPostId = postId
          ? (await postApi.updateFreePost(postId, values)).data
          : (await postApi.createFreePost(values)).data;
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: ["communityPosts"] }),
          queryClient.invalidateQueries({ queryKey: ["communitySidebar"] }),
          queryClient.invalidateQueries({ queryKey: ["postDetail", kind, savedPostId] }),
        ]);
        return savedPostId;
      }

      if (kind === "notice") {
        const savedPostId = postId
          ? (await postApi.updateNoticePost(postId, values)).data
          : (await postApi.createNoticePost(values)).data;
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: ["communityPosts"] }),
          queryClient.invalidateQueries({ queryKey: ["communitySidebar"] }),
          queryClient.invalidateQueries({ queryKey: ["postDetail", kind, savedPostId] }),
        ]);
        return savedPostId;
      }

      throw new Error("지원하지 않는 게시판 종류입니다.");
    } catch (e) {
      const message = getErrorMessage(e);
      setError(message);
      throw new Error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const remove = async ({ kind, postId }: RemoveOptions): Promise<void> => {
    if (!postId) {
      throw new Error("삭제할 게시글 정보가 올바르지 않습니다.");
    }

    setDeleting(true);
    setError("");
    try {
      if (kind === "free") {
        await postApi.deleteFreePost(postId);
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: ["communityPosts"] }),
          queryClient.invalidateQueries({ queryKey: ["communitySidebar"] }),
          queryClient.invalidateQueries({ queryKey: ["postDetail", kind, postId] }),
        ]);
        return;
      }

      if (kind === "notice") {
        await postApi.deleteNoticePost(postId);
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: ["communityPosts"] }),
          queryClient.invalidateQueries({ queryKey: ["communitySidebar"] }),
          queryClient.invalidateQueries({ queryKey: ["postDetail", kind, postId] }),
        ]);
        return;
      }

      throw new Error("지원하지 않는 게시판 종류입니다.");
    } catch (e) {
      const message = getErrorMessage(e);
      setError(message);
      throw new Error(message);
    } finally {
      setDeleting(false);
    }
  };

  return { submitting, deleting, error, submit, remove };
}
