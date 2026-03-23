import type { ReplyTreeNode } from "../types/replyTypes";
import ReplyItem from "./ReplyItem";
import "../styles/replySection.css";

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
  if (tree.length === 0) {
    return (
      <div className="reply-empty-card">
        <p style={{ margin: 0, fontWeight: 600, color: "#374151" }}>아직 댓글이 없습니다.</p>
        <p style={{ margin: "6px 0 0", fontSize: 14 }}>첫 댓글을 남겨보세요!</p>
      </div>
    );
  }

  return (
    <ul className="reply-list">
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
