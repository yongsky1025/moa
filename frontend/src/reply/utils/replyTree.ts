import type { ReplyResponse, ReplyTreeNode } from "../types/replyTypes";

export function buildReplyTree(replies: ReplyResponse[]): ReplyTreeNode[] {
  const nodeMap = new Map<number, ReplyTreeNode>(
    replies.map((reply) => [reply.replyId, { ...reply, children: [] }]),
  );
  const roots: ReplyTreeNode[] = [];

  for (const reply of replies) {
    if (reply.parentId !== null) continue;
    const rootNode = nodeMap.get(reply.replyId);
    if (rootNode) {
      rootNode.children = [];
      roots.push(rootNode);
    }
  }

  for (const reply of replies) {
    if (reply.parentId === null) continue;

    const node = nodeMap.get(reply.replyId);
    if (!node) continue;
    const root = nodeMap.get(reply.parentId);
    if (!root) {
      roots.push(node);
      continue;
    }
    root.children.push(node);
  }

  return roots;
}
