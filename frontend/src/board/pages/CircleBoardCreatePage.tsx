import { useNavigate, useParams } from 'react-router-dom';
import PageLayout from '../../common/layout/PageLayout';
import BoardNotFoundPage from './BoardNotFoundPage';
import BoardFormPage from './BoardFormPage';
import { useBoardPageLayout } from '../hooks/useBoardPageLayout';
import { useCreateCircleBoard } from '../hooks/useBoards';
import { toCircleBoardPath, toCircleBoardsPath } from '../utils/paths';
import { toNumberParam } from '../utils/parse';

export default function CircleBoardCreatePage() {
  const { circleId } = useParams();
  const layout = useBoardPageLayout();
  const navigate = useNavigate();
  const createMutation = useCreateCircleBoard();
  const parsedCircleId = (() => {
    try {
      return toNumberParam(circleId, 'circleId');
    } catch {
      return null;
    }
  })();

  if (!parsedCircleId) {
    return <BoardNotFoundPage />;
  }

  return (
    <PageLayout {...layout}>
      <BoardFormPage
        title={`Circle ${parsedCircleId} 새 게시판`}
        description="서클 전용 게시판 이름을 입력하세요."
        loading={createMutation.loading}
        submitLabel="Create"
        error={createMutation.error}
        onBack={() => navigate(toCircleBoardsPath(parsedCircleId))}
        onSubmit={async (name) => {
          const createdId = await createMutation.mutate(parsedCircleId, { name });
          if (createdId) {
            navigate(toCircleBoardPath(parsedCircleId, createdId));
          }
        }}
      />
    </PageLayout>
  );
}
