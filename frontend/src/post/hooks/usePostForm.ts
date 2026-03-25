import { useState } from "react";
import { postApi } from "../api/postApi";
import type { PostFormValues, PostKind } from "../types/postTypes";
import { getErrorMessage } from "../../common/utils/errorMessage";

interface SubmitOptions {
  kind: PostKind;
  values: PostFormValues;
  postId?: number;
  circleId?: number;
  boardId?: number;
}

interface RemoveOptions {
  kind: PostKind;
  postId?: number;
  circleId?: number;
  boardId?: number;
}

export function usePostForm() {
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  const submit = async ({ kind, values, postId, circleId, boardId }: SubmitOptions): Promise<number> => {
    setSubmitting(true);
    setError("");
    try {
      if (kind === "free") {
        if (postId) return (await postApi.updateFreePost(postId, values)).data;
        return (await postApi.createFreePost(values)).data;
      }

      if (kind === "notice") {
        if (postId) return (await postApi.updateNoticePost(postId, values)).data;
        return (await postApi.createNoticePost(values)).data;
      }

      if (postId) return (await postApi.updateCirclePost(circleId ?? 0, boardId ?? 0, postId, values)).data;
      return (await postApi.createCirclePost(circleId ?? 0, boardId ?? 0, values)).data;
    } catch (e) {
      const message = getErrorMessage(e);
      setError(message);
      throw new Error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const remove = async ({ kind, postId, circleId, boardId }: RemoveOptions): Promise<void> => {
    if (!postId) {
      throw new Error("삭제할 게시글 정보가 올바르지 않습니다.");
    }

    setDeleting(true);
    setError("");
    try {
      if (kind === "free") {
        await postApi.deleteFreePost(postId);
        return;
      }

      if (kind === "notice") {
        await postApi.deleteNoticePost(postId);
        return;
      }

      await postApi.deleteCirclePost(circleId ?? 0, boardId ?? 0, postId);
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
