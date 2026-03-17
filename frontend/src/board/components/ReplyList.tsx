import type { Reply } from '../types';

interface ReplyListProps {
  replies: Reply[];
  onDelete: (replyId: number) => Promise<void> | void;
  onEdit: (replyId: number, content: string) => Promise<void> | void;
  onReply: (replyId: number, content: string) => Promise<void> | void;
}

export default function ReplyList({
  replies,
  onDelete,
  onEdit,
  onReply,
}: ReplyListProps) {
  const safeReplies = Array.isArray(replies) ? replies : [];

  if (safeReplies.length === 0) {
    return <p style={{ margin: 0 }}>댓글이 없습니다.</p>;
  }

  return (
    <ul style={{ listStyle: 'none', padding: 0, display: 'grid', gap: 8 }}>
      {safeReplies.map((reply) => (
        <li
          key={reply.replyId}
          style={{
            border: '1px solid #e5e0d4',
            borderRadius: 10,
            padding: 12,
            marginLeft: reply.depth > 0 ? 20 : 0,
            background: '#fffcf7',
          }}
        >
          <p style={{ margin: 0 }}>
            <strong>{reply.authorName}</strong>
          </p>
          <p style={{ whiteSpace: 'pre-wrap', margin: '8px 0', color: '#2f2b25' }}>
            {reply.deleted ? '(deleted)' : reply.content}
          </p>
          {!reply.deleted && (
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                type="button"
                style={{
                  border: '1px solid #d9d4c7',
                  background: '#fff',
                  borderRadius: 8,
                  padding: '6px 10px',
                  cursor: 'pointer',
                }}
                onClick={() => {
                  const next = window.prompt('Edit reply', reply.content);
                  if (next && next.trim()) {
                    void onEdit(reply.replyId, next.trim());
                  }
                }}
              >
                Edit
              </button>
              <button
                type="button"
                style={{
                  border: '1px solid #d9d4c7',
                  background: '#fff',
                  borderRadius: 8,
                  padding: '6px 10px',
                  cursor: 'pointer',
                }}
                onClick={() => void onDelete(reply.replyId)}
              >
                Delete
              </button>
              <button
                type="button"
                style={{
                  border: '1px solid #d9d4c7',
                  background: '#fff',
                  borderRadius: 8,
                  padding: '6px 10px',
                  cursor: 'pointer',
                }}
                onClick={() => {
                  const next = window.prompt('Child reply');
                  if (next && next.trim()) {
                    void onReply(reply.replyId, next.trim());
                  }
                }}
              >
                Reply
              </button>
            </div>
          )}
        </li>
      ))}
    </ul>
  );
}
