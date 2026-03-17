import { useNavigate, useParams } from 'react-router-dom';
import PageLayout from '../../common/layout/PageLayout';
import BoardNotFoundPage from './BoardNotFoundPage';
import PostFormPage from './PostFormPage';
import { useBoardPageLayout } from '../hooks/useBoardPageLayout';
import { useCreateCirclePost } from '../hooks/usePosts';
import { toCircleBoardPath, toCirclePostPath } from '../utils/paths';
import { toNumberParam } from '../utils/parse';

export default function CirclePostCreatePage() {
  const { circleId, boardId } = useParams();
  const layout = useBoardPageLayout();
  const navigate = useNavigate();
  const createMutation = useCreateCirclePost();
  const parsedCircleId = (() => {
    try {
      return toNumberParam(circleId, 'circleId');
    } catch {
      return null;
    }
  })();
  const parsedBoardId = (() => {
    try {
      return toNumberParam(boardId, 'boardId');
    } catch {
      return null;
    }
  })();

  if (!parsedCircleId || !parsedBoardId) {
    return <BoardNotFoundPage />;
  }

  return (
    <PageLayout {...layout}>
      <PostFormPage
        title="서클 글 작성"
        description={`Circle ${parsedCircleId} / Board ${parsedBoardId}`}
        loading={createMutation.loading}
        submitLabel="Create"
        error={createMutation.error}
        onBack={() => navigate(toCircleBoardPath(parsedCircleId, parsedBoardId))}
        onSubmit={async (payload) => {
          const createdId = await createMutation.mutate(
            parsedCircleId,
            parsedBoardId,
            payload,
          );
          if (createdId) {
            navigate(toCirclePostPath(parsedCircleId, parsedBoardId, createdId));
          }
        }}
      />
    </PageLayout>
  );
}
