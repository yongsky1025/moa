import type { ReplyResponse, ReplyTreeNode } from "../types/replyTypes";

export function buildReplyTree(replies: ReplyResponse[]): ReplyTreeNode[] {
  const parents = replies
    .filter((reply) => reply.parentId === null)
    .map((reply) => ({ ...reply, children: [] as ReplyResponse[] }));

  for (const parent of parents) {
    parent.children = replies.filter((reply) => reply.parentId === parent.replyId);
  }

  return parents;
}
