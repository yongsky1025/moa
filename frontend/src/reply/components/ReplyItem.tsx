import { useState } from "react";
import type { ReplyResponse } from "../types/replyTypes";
import { formatDateTime } from "../../post/utils/dateFormat";
import ReplyForm from "./ReplyForm";

interface ReplyItemProps {
  postId: number;
  reply: ReplyResponse;
  childrenReplies?: ReplyResponse[];
  onCreateChild: (content: string, parentId: number) => Promise<void>;
}

export default function ReplyItem({ postId, reply, childrenReplies = [], onCreateChild }: ReplyItemProps) {
  const [showChildForm, setShowChildForm] = useState(false);

  return (
    <li style={{ padding: "12px 0", borderBottom: "1px solid #f2f2f2" }}>
      <p style={{ margin: 0, fontWeight: 700 }}>{reply.authorName}</p>
      <p style={{ margin: "6px 0", whiteSpace: "pre-wrap" }}>{reply.deleted ? "삭제된 댓글입니다." : reply.content}</p>
      <p style={{ margin: 0, fontSize: 12, color: "#777" }}>{formatDateTime(reply.createDate)}</p>
      {!reply.deleted && (
        <button
          type="button"
          onClick={() => setShowChildForm((prev) => !prev)}
          style={{ marginTop: 6, border: "none", background: "none", color: "#555", cursor: "pointer", padding: 0 }}
        >
          {showChildForm ? "대댓글 닫기" : "대댓글 작성"}
        </button>
      )}

      {showChildForm && (
        <div style={{ marginTop: 8 }}>
          <ReplyForm
            postId={postId}
            parentId={reply.replyId}
            onSubmitReply={(content, parentId) => onCreateChild(content, parentId ?? reply.replyId)}
            onSuccess={() => setShowChildForm(false)}
          />
        </div>
      )}

      {childrenReplies.length > 0 && (
        <ul style={{ listStyle: "none", margin: "8px 0 0 12px", padding: 0 }}>
          {childrenReplies.map((child) => (
            <li key={child.replyId} style={{ borderLeft: "2px solid #eee", paddingLeft: 10, marginBottom: 8 }}>
              <p style={{ margin: 0, fontWeight: 700, fontSize: 14 }}>{child.authorName}</p>
              <p style={{ margin: "4px 0", whiteSpace: "pre-wrap" }}>
                {child.deleted ? "삭제된 댓글입니다." : child.content}
              </p>
              <p style={{ margin: 0, fontSize: 12, color: "#777" }}>{formatDateTime(child.createDate)}</p>
            </li>
          ))}
        </ul>
      )}
    </li>
  );
}
