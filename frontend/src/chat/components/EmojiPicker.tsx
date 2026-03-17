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

  // 버튼 위치 기준으로 피커 위치 계산
  useEffect(() => {
    if (!anchorRef.current) return;
    const rect = anchorRef.current.getBoundingClientRect();
    const pickerW = 220;
    const pickerH = 200;
    let left = rect.right - pickerW;
    let top = rect.top - pickerH - 8;
    if (left < 8) left = 8;
    if (left + pickerW > window.innerWidth - 20) left = window.innerWidth - pickerW - 20;
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
    <div ref={ref} style={{ ...styles.box, top: pos.top, left: pos.left }}>
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
    borderRadius: 10,
    boxShadow: '0 4px 20px rgba(0,0,0,0.18)',
    padding: 4,
    display: 'grid',
    gridTemplateColumns: 'repeat(10, 1fr)',
    gap: 0,
    zIndex: 99999,
  },
  btn: {
    background: 'none',
    border: 'none',
    fontSize: 10,
    cursor: 'pointer',
    padding: 1,
    borderRadius: 3,
    lineHeight: 1,
  },
};
