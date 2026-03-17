import { Link } from 'react-router-dom';
import PageLayout from '../../common/layout/PageLayout';
import BoardNotFoundPage from './BoardNotFoundPage';
import BoardList from '../components/BoardList';
import ActionBar from '../components/layout/ActionBar';
import PageHeader from '../components/layout/PageHeader';
import QueryStateBlock from '../components/layout/QueryStateBlock';
import { useBoardPageLayout } from '../hooks/useBoardPageLayout';
import { useCircleBoards, useDeleteCircleBoard } from '../hooks/useBoards';
import { useCircleBoardParams } from '../hooks/route/useRouteParams';
import { toCircleBoardCreatePath } from '../utils/paths';
import { pageUi } from './pageUi';

export default function CircleBoardListPage() {
  const layout = useBoardPageLayout();
  const { parsedCircleId } = useCircleBoardParams();
  const isValid = Boolean(parsedCircleId);
  const boardQuery = useCircleBoards(parsedCircleId ?? 0, { enabled: isValid });
  const deleteMutation = useDeleteCircleBoard();

  if (!isValid || !parsedCircleId) {
    return <BoardNotFoundPage />;
  }

  return (
    <PageLayout {...layout}>
      <section style={pageUi.pageSection}>
        <PageHeader
          title={`Circle ${parsedCircleId} 게시판`}
          actions={(
            <ActionBar>
              <Link to={toCircleBoardCreatePath(parsedCircleId)} style={pageUi.actionLink}>
                새 게시판
              </Link>
            </ActionBar>
          )}
        />
        <QueryStateBlock
          loading={boardQuery.loading}
          loadingText="Loading boards..."
          error={boardQuery.error ?? deleteMutation.error}
        />
        {boardQuery.data && (
          <BoardList
            circleId={parsedCircleId}
            boards={boardQuery.data}
            onDelete={async (boardId) => {
              const ok = window.confirm('Delete this board?');
              if (!ok) return;
              const deleted = await deleteMutation.mutate(parsedCircleId, boardId);
              if (deleted !== null) {
                await boardQuery.refetch();
              }
            }}
          />
        )}
      </section>
    </PageLayout>
  );
}
