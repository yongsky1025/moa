import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { replyApi } from "../api/replyApi";
import { getErrorMessage } from "../../common/utils/errorMessage";

interface CreateReplyOptions {
  postId: number;
  content: string;
  parentId?: number;
}

interface UpdateReplyOptions {
  postId: number;
  replyId: number;
  content: string;
}

interface DeleteReplyOptions {
  postId: number;
  replyId: number;
}

export function useReplyForm() {
  const queryClient = useQueryClient();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const create = async ({ postId, content, parentId }: CreateReplyOptions) => {
    setSubmitting(true);
    setError("");
    try {
      if (parentId) {
        const createdReplyId = (await replyApi.createChildReply(postId, parentId, { content })).data;
        await queryClient.invalidateQueries({ queryKey: ["postReplies", postId] });
        return createdReplyId;
      }
      const createdReplyId = (await replyApi.createReply(postId, { content })).data;
      await queryClient.invalidateQueries({ queryKey: ["postReplies", postId] });
      return createdReplyId;
    } catch (e) {
      const message = getErrorMessage(e);
      setError(message);
      throw new Error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const update = async ({ postId, replyId, content }: UpdateReplyOptions) => {
    setSubmitting(true);
    setError("");
    try {
      const updatedReplyId = (await replyApi.updateReply(postId, replyId, { content })).data;
      await queryClient.invalidateQueries({ queryKey: ["postReplies", postId] });
      return updatedReplyId;
    } catch (e) {
      const message = getErrorMessage(e);
      setError(message);
      throw new Error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const remove = async ({ postId, replyId }: DeleteReplyOptions) => {
    setSubmitting(true);
    setError("");
    try {
      await replyApi.deleteReply(postId, replyId);
      await queryClient.invalidateQueries({ queryKey: ["postReplies", postId] });
    } catch (e) {
      const message = getErrorMessage(e);
      setError(message);
      throw new Error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return { submitting, error, create, update, remove };
}
