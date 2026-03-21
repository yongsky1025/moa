import type { ReplyTreeNode } from "../types/replyTypes";
import ReplyItem from "./ReplyItem";

interface ReplyListProps {
  postId: number;
  tree: ReplyTreeNode[];
  onCreateChild: (content: string, parentId: number) => Promise<void>;
}

export default function ReplyList({ postId, tree, onCreateChild }: ReplyListProps) {
  if (tree.length === 0) return <p style={{ color: "#666" }}>댓글이 없습니다.</p>;

  return (
    <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
      {tree.map((reply) => (
        <ReplyItem
          key={reply.replyId}
          postId={postId}
          reply={reply}
          childrenReplies={reply.children}
          onCreateChild={onCreateChild}
        />
      ))}
    </ul>
  );
}
