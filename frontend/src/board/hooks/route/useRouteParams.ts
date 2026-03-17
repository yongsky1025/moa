import { useParams } from 'react-router-dom';
import { isGlobalBoardType } from '../../utils/guards';
import { toNumberParam } from '../../utils/parse';

const toNumberOrNull = (
  raw: string | undefined,
  label: 'circleId' | 'boardId' | 'postId',
): number | null => {
  try {
    return toNumberParam(raw, label);
  } catch {
    return null;
  }
};

export const useGlobalPostParams = () => {
  const { boardType, postId } = useParams();
  const resolvedBoardType =
    boardType && isGlobalBoardType(boardType) ? boardType : null;
  const parsedPostId = toNumberOrNull(postId, 'postId');
  const isValid = Boolean(resolvedBoardType && parsedPostId);

  return { resolvedBoardType, parsedPostId, isValid };
};

export const useCircleBoardParams = () => {
  const { circleId, boardId } = useParams();
  const parsedCircleId = toNumberOrNull(circleId, 'circleId');
  const parsedBoardId = toNumberOrNull(boardId, 'boardId');
  const isValid = Boolean(parsedCircleId && parsedBoardId);

  return { parsedCircleId, parsedBoardId, isValid };
};

export const useCirclePostParams = () => {
  const { circleId, boardId, postId } = useParams();
  const parsedCircleId = toNumberOrNull(circleId, 'circleId');
  const parsedBoardId = toNumberOrNull(boardId, 'boardId');
  const parsedPostId = toNumberOrNull(postId, 'postId');
  const isValid = Boolean(parsedCircleId && parsedBoardId && parsedPostId);

  return { parsedCircleId, parsedBoardId, parsedPostId, isValid };
};
