import { Navigate, useParams } from 'react-router-dom';

export function LegacyGlobalBoardRedirect() {
  const { boardType } = useParams();
  return <Navigate to={`/board/global/${boardType ?? 'notice'}`} replace />;
}

export function LegacyGlobalPostCreateRedirect() {
  const { boardType } = useParams();
  return <Navigate to={`/board/global/${boardType ?? 'notice'}/posts/new`} replace />;
}

export function LegacyGlobalPostDetailRedirect() {
  const { boardType, postId } = useParams();
  return <Navigate to={`/board/global/${boardType ?? 'notice'}/posts/${postId ?? ''}`} replace />;
}

export function LegacyGlobalPostEditRedirect() {
  const { boardType, postId } = useParams();
  return (
    <Navigate
      to={`/board/global/${boardType ?? 'notice'}/posts/${postId ?? ''}/edit`}
      replace
    />
  );
}

export function LegacyCircleBoardsRedirect() {
  const { circleId } = useParams();
  return <Navigate to={`/board/circle/${circleId ?? ''}/boards`} replace />;
}

export function LegacyCircleBoardCreateRedirect() {
  const { circleId } = useParams();
  return <Navigate to={`/board/circle/${circleId ?? ''}/boards/new`} replace />;
}

export function LegacyCircleBoardDetailRedirect() {
  const { circleId, boardId } = useParams();
  return <Navigate to={`/board/circle/${circleId ?? ''}/boards/${boardId ?? ''}`} replace />;
}

export function LegacyCircleBoardEditRedirect() {
  const { circleId, boardId } = useParams();
  return <Navigate to={`/board/circle/${circleId ?? ''}/boards/${boardId ?? ''}/edit`} replace />;
}

export function LegacyCirclePostCreateRedirect() {
  const { circleId, boardId } = useParams();
  return <Navigate to={`/board/circle/${circleId ?? ''}/boards/${boardId ?? ''}/posts/new`} replace />;
}

export function LegacyCirclePostDetailRedirect() {
  const { circleId, boardId, postId } = useParams();
  return (
    <Navigate
      to={`/board/circle/${circleId ?? ''}/boards/${boardId ?? ''}/posts/${postId ?? ''}`}
      replace
    />
  );
}

export function LegacyCirclePostEditRedirect() {
  const { circleId, boardId, postId } = useParams();
  return (
    <Navigate
      to={`/board/circle/${circleId ?? ''}/boards/${boardId ?? ''}/posts/${postId ?? ''}/edit`}
      replace
    />
  );
}
