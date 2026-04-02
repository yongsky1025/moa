import { useState, useRef, memo } from "react";
import { Paperclip, Smile, BotMessageSquare } from "lucide-react";
import { chatApi } from "../../api/chatApi";
import EmojiPicker from "./EmojiPicker";

interface Props {
  activeRoomId: number | null;
  replyTo: { messageId: number; content: string; nickname: string } | null;
  onClearReply: () => void;
  onSend: (content: string, replyToId?: number) => void;
  onSendFile: (file: File) => void;
  onTyping: (nickname: string) => void;
  typingCooldownRef: React.RefObject<boolean | null>;
  nickname: string;
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
}

const ChatInput = memo(function ChatInput({
  activeRoomId,
  replyTo,
  onClearReply,
  onSend,
  onSendFile,
  onTyping,
  typingCooldownRef,
  nickname,
  textareaRef,
}: Props) {
  const [input, setInput] = useState("");
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [pendingPreviewUrl, setPendingPreviewUrl] = useState<string | null>(null);
  const [showEmoji, setShowEmoji] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<{ quickReplies: string[]; draft: string } | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const emojiBtnRef = useRef<HTMLButtonElement>(null);

  const cancelPendingFile = () => {
    if (pendingPreviewUrl) URL.revokeObjectURL(pendingPreviewUrl);
    setPendingFile(null);
    setPendingPreviewUrl(null);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';
    if (pendingPreviewUrl) URL.revokeObjectURL(pendingPreviewUrl);
    setPendingFile(file);
    setPendingPreviewUrl(file.type.startsWith('image/') ? URL.createObjectURL(file) : null);
  };

  const handleSend = () => {
    if (pendingFile) {
      onSendFile(pendingFile);
      cancelPendingFile();
      setInput("");
      if (textareaRef.current) textareaRef.current.style.height = "auto";
      return;
    }
    const content = input.trim();
    if (!content) return;
    onSend(content, replyTo?.messageId);
    setInput("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
  };

  return (
    <div style={{ ...s.inputArea, flexDirection: 'column', alignItems: 'stretch', gap: 0 }}>
      {/* 답장 미리보기 */}
      {replyTo && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px', background: '#F0F7F4', borderBottom: '1px solid #D1E8DF', borderLeft: '3px solid #5F8F7B' }}>
          <div style={{ flex: 1, overflow: 'hidden' }}>
            <div style={{ fontSize: 11, color: '#5F8F7B', fontWeight: 600 }}>{replyTo.nickname}에게 답장</div>
            <div style={{ fontSize: 12, color: '#6B7280', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{replyTo.content}</div>
          </div>
          <button onClick={onClearReply} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF', fontSize: 14, padding: '0 2px', flexShrink: 0 }}>✕</button>
        </div>
      )}
      {/* 파일 미리보기 */}
      {pendingFile && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px', borderBottom: '1px solid #e5e7eb' }}>
          {pendingPreviewUrl ? (
            <img src={pendingPreviewUrl} alt="미리보기" style={{ width: 56, height: 56, objectFit: 'cover', borderRadius: 8, border: '1px solid #E5E7EB' }} />
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#F3F4F6', borderRadius: 8, padding: '6px 10px', fontSize: 13, color: '#374151' }}>
              📎 {pendingFile.name}
            </div>
          )}
          <button onClick={cancelPendingFile} style={{ background: '#e5e7eb', border: 'none', borderRadius: '50%', width: 20, height: 20, cursor: 'pointer', fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6B7280', flexShrink: 0 }}>✕</button>
        </div>
      )}
      {/* AI 스마트 답변 제안 */}
      {aiSuggestions && (
        <div style={{ background: '#F0FAF5', borderTop: '1px solid #D1EAE0', padding: '6px 10px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
            <span style={{ fontSize: 10, color: '#5F8F7B', fontWeight: 600 }}>✨ AI 스마트 답변</span>
            <button style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 11, color: '#aaa' }} onClick={() => setAiSuggestions(null)}>✕</button>
          </div>
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: aiSuggestions.draft ? 4 : 0 }}>
            {aiSuggestions.quickReplies.map((r, i) => (
              <button key={i} style={{ background: '#fff', border: '1px solid #5F8F7B', color: '#5F8F7B', borderRadius: 14, padding: '3px 10px', fontSize: 11, cursor: 'pointer', fontWeight: 500 }}
                onClick={() => { setInput(r); setAiSuggestions(null); textareaRef.current?.focus(); }}>
                {r}
              </button>
            ))}
          </div>
          {aiSuggestions.draft && (
            <button style={{ background: '#fff', border: '1px solid #D1EAE0', borderRadius: 6, padding: '4px 8px', fontSize: 11, cursor: 'pointer', color: '#333', textAlign: 'left', width: '100%', display: 'flex', alignItems: 'center', gap: 4 }}
              onClick={() => { setInput(aiSuggestions.draft); setAiSuggestions(null); textareaRef.current?.focus(); }}>
              <span style={{ color: '#888', flexShrink: 0 }}>초안</span>{aiSuggestions.draft}
            </button>
          )}
        </div>
      )}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 10px' }}>
        <button className="chat-icon-btn" onClick={() => fileInputRef.current?.click()} style={s.iconBtn}><Paperclip size={17} /></button>
        <input ref={fileInputRef} type="file" style={{ display: "none" }} onChange={handleFileSelect} />
        <button ref={emojiBtnRef} className="chat-icon-btn" style={s.iconBtn} onClick={() => setShowEmoji((v) => !v)}><Smile size={17} /></button>
        <button
          style={{ ...s.iconBtn, color: aiLoading ? '#aaa' : '#5F8F7B' }}
          disabled={aiLoading || !activeRoomId}
          onClick={async () => {
            if (!activeRoomId) return;
            setAiLoading(true);
            try {
              const result = await chatApi.suggestReply(activeRoomId);
              setAiSuggestions(result);
            } finally {
              setAiLoading(false);
            }
          }}
          title="AI 스마트 답변"
        >
          <BotMessageSquare size={17} />
        </button>
        {showEmoji && (
          <EmojiPicker anchorRef={emojiBtnRef} onSelect={(emoji) => setInput((prev) => prev + emoji)} onClose={() => setShowEmoji(false)} />
        )}
        <textarea
          ref={textareaRef}
          className="chat-textarea"
          style={s.textInput}
          placeholder="메시지 입력..."
          value={input}
          rows={1}
          onChange={(e) => {
            setInput(e.target.value);
            e.target.style.height = "auto";
            e.target.style.height = e.target.scrollHeight + "px";
            if (!typingCooldownRef.current && e.target.value.trim()) {
              onTyping(nickname);
              typingCooldownRef.current = true;
              setTimeout(() => { typingCooldownRef.current = false; }, 2000);
            }
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
        />
        <button className="chat-send-btn" onClick={handleSend} style={s.sendBtn} disabled={!input.trim() && !pendingFile}>전송</button>
      </div>
    </div>
  );
});

export default ChatInput;

const s: Record<string, React.CSSProperties> = {
  inputArea: { display: 'flex', alignItems: 'center', borderTop: '1px solid #E5E7EB', background: '#fff', flexShrink: 0 },
  iconBtn: { background: 'none', border: 'none', fontSize: 17, cursor: 'pointer', padding: '2px 4px', color: '#6B7280', flexShrink: 0 },
  textInput: { flex: 1, border: '1px solid #E5E7EB', borderRadius: 20, padding: '8px 14px', fontSize: 13, outline: 'none', resize: 'none', lineHeight: 1.5, maxHeight: 120, background: '#F8FAF9', fontFamily: 'inherit', overflowY: 'hidden', color: '#1F2937' },
  sendBtn: { background: '#5F8F7B', color: '#fff', border: 'none', borderRadius: 18, padding: '8px 16px', cursor: 'pointer', fontWeight: 700, fontSize: 13, flexShrink: 0 },
};
