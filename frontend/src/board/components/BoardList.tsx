import { Link } from 'react-router-dom';
import type { Board } from '../types';
import { isCircleBoard } from '../utils/guards';
import { toCircleBoardPath } from '../utils/paths';

interface BoardListProps {
  circleId: number;
  boards: Board[];
  onDelete: (boardId: number) => Promise<void> | void;
}

export default function BoardList({ circleId, boards, onDelete }: BoardListProps) {
  if (boards.length === 0) {
    return <p style={{ margin: 0 }}>게시판이 없습니다.</p>;
  }

  return (
    <ul style={{ display: 'grid', gap: 10, listStyle: 'none', padding: 0, margin: 0 }}>
      {boards.map((board) => (
        <li
          key={board.boardId}
          style={{
            border: '1px solid #e5e0d4',
            borderRadius: 10,
            padding: 14,
            background: '#fffcf7',
          }}
        >
          <p style={{ margin: 0 }}>
            <strong>{board.name}</strong>
          </p>
          <p style={{ margin: '6px 0 10px', color: '#666056', fontSize: 13 }}>
            Type: {board.type}
          </p>
          <Link
            to={toCircleBoardPath(circleId, board.boardId)}
            style={{ marginRight: 8, color: '#2f5d9a', fontWeight: 600 }}
          >
            Open
          </Link>
          <button
            type="button"
            onClick={() => void onDelete(board.boardId)}
            disabled={!isCircleBoard(board)}
            style={{
              border: '1px solid #d9d4c7',
              background: '#fff',
              borderRadius: 8,
              padding: '6px 10px',
              cursor: 'pointer',
            }}
          >
            Delete
          </button>
        </li>
      ))}
    </ul>
  );
}
