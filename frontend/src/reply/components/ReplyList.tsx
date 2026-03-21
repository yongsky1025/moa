import type { ReplyTreeNode } from "../types/replyTypes";
import ReplyItem from "./ReplyItem";

interface ReplyListProps {
  postId: number;
  tree: ReplyTreeNode[];
  currentUserPublicId?: string;
  isAdmin: boolean;
  canWrite: boolean;
  canDeleteAsAdmin: boolean;
  onUpdate: (replyId: number, content: string) => Promise<void>;
  onDelete: (replyId: number) => Promise<void>;
  onCreateChild: (content: string, parentId: number) => Promise<void>;
}

export default function ReplyList({
  postId,
  tree,
  currentUserPublicId,
  isAdmin,
  canWrite,
  canDeleteAsAdmin,
  onUpdate,
  onDelete,
  onCreateChild,
}: ReplyListProps) {
  if (tree.length === 0) return <p style={{ color: "#666" }}>댓글이 없습니다.</p>;

  return (
    <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
      {tree.map((reply) => (
        <ReplyItem
          key={reply.replyId}
          postId={postId}
          reply={reply}
          childrenReplies={reply.children}
          currentUserPublicId={currentUserPublicId}
          isAdmin={isAdmin}
          canWrite={canWrite}
          canDeleteAsAdmin={canDeleteAsAdmin}
          onUpdate={onUpdate}
          onDelete={onDelete}
          onCreateChild={onCreateChild}
        />
      ))}
    </ul>
  );
}
