import { useEffect, useRef, useState } from 'react';

const EMOJIS = [
  '😀','😃','😄','😁','😆','😅','😂','🤣','😊','😇',
  '🙂','😉','😍','🥰','😘','😋','😛','😜','🤪','😎',
  '🥳','😏','😒','😔','😢','😭','😤','😠','🤬','🥺',
  '😱','😨','😳','🤗','🤔','🤫','🤥','😶','😬','🙄',
  '😴','🤢','🤮','🤧','😷','🤒','🤑','🤠','👍','👎',
  '👋','🙌','👏','🤝','🙏','❤️','🔥','✨','🎉','💯',
  '😺','🎂','🎁','🎊','🌟','💪','🤞','✌️','👌','🫡',
];

interface EmojiPickerProps {
  onSelect: (emoji: string) => void;
  onClose: () => void;
  anchorRef: React.RefObject<HTMLButtonElement | null>;
}

export default function EmojiPicker({ onSelect, onClose, anchorRef }: EmojiPickerProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (!anchorRef.current || !ref.current) return;
    const rect = anchorRef.current.getBoundingClientRect();
    const pickerW = 220;
    const pickerH = ref.current.offsetHeight || 160;
    let left = rect.left;
    let top = rect.top - pickerH - 8;
    if (left + pickerW > window.innerWidth - 8) left = window.innerWidth - pickerW - 8;
    if (left < 8) left = 8;
    if (top < 8) top = rect.bottom + 8;
    setPos({ top, left });
  }, [anchorRef]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        ref.current && !ref.current.contains(e.target as Node) &&
        anchorRef.current && !anchorRef.current.contains(e.target as Node)
      ) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose, anchorRef]);

  return (
    <div ref={ref} className="emoji-picker-box" style={{ ...styles.box, top: pos.top, left: pos.left }}>
      {EMOJIS.map((emoji) => (
        <button
          key={emoji}
          style={styles.btn}
          onClick={() => { onSelect(emoji); onClose(); }}
        >
          {emoji}
        </button>
      ))}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  box: {
    position: 'fixed',
    width: 220,
    background: '#fff',
    borderRadius: 12,
    boxShadow: '0 4px 20px rgba(0,0,0,0.18)',
    padding: 8,
    display: 'grid',
    gridTemplateColumns: 'repeat(7, 1fr)',
    gap: 2,
    zIndex: 99999,
    boxSizing: 'border-box',
    maxHeight: 180,
    overflowY: 'scroll',
    overflowX: 'hidden',
    scrollbarWidth: 'none' as const,
  },
  btn: {
    background: 'none',
    border: 'none',
    fontSize: 20,
    cursor: 'pointer',
    padding: 3,
    borderRadius: 4,
    lineHeight: 1,
    width: '100%',
    textAlign: 'center' as const,
  },
};
