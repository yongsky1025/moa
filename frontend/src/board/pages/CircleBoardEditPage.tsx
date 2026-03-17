import { useNavigate } from 'react-router-dom';
import PageLayout from '../../common/layout/PageLayout';
import BoardNotFoundPage from './BoardNotFoundPage';
import BoardFormPage from './BoardFormPage';
import { useBoardPageLayout } from '../hooks/useBoardPageLayout';
import { useCircleBoard, useDeleteCircleBoard, useUpdateCircleBoard } from '../hooks/useBoards';
import { useCircleBoardParams } from '../hooks/route/useRouteParams';
import { toCircleBoardPath, toCircleBoardsPath } from '../utils/paths';
import QueryStateBlock from '../components/layout/QueryStateBlock';
import { pageUi } from './pageUi';

export default function CircleBoardEditPage() {
  const layout = useBoardPageLayout();
  const { parsedCircleId, parsedBoardId, isValid } = useCircleBoardParams();
  const navigate = useNavigate();

  const boardQuery = useCircleBoard(parsedCircleId ?? 0, parsedBoardId ?? 0, {
    enabled: isValid,
  });
  const board = boardQuery.data;
  const updateMutation = useUpdateCircleBoard();
  const deleteMutation = useDeleteCircleBoard();

  if (!isValid || !parsedCircleId || !parsedBoardId) {
    return <BoardNotFoundPage />;
  }

  return (
    <PageLayout {...layout}>
      <section style={pageUi.pageSection}>
        <QueryStateBlock
          loading={boardQuery.loading}
          loadingText="Loading board..."
          error={boardQuery.error}
        />
        {board && (
          <BoardFormPage
            title="게시판 수정"
            description={`Circle ${parsedCircleId} / Board ${parsedBoardId}`}
            defaultName={board.name}
            loading={updateMutation.loading}
            submitLabel="Update"
            error={updateMutation.error ?? deleteMutation.error}
            onBack={() => navigate(toCircleBoardsPath(parsedCircleId))}
            dangerAction={(
              <button
                type="button"
                onClick={async () => {
                  const ok = window.confirm('Delete this board?');
                  if (!ok) return;
                  const deleted = await deleteMutation.mutate(parsedCircleId, parsedBoardId);
                  if (deleted !== null) {
                    navigate(toCircleBoardsPath(parsedCircleId));
                  }
                }}
                style={pageUi.actionDanger}
              >
                삭제
              </button>
            )}
            onSubmit={async (name) => {
              const updated = await updateMutation.mutate(
                parsedCircleId,
                parsedBoardId,
                { name },
              );
              if (updated !== null) {
                navigate(toCircleBoardPath(parsedCircleId, parsedBoardId));
              }
            }}
          />
        )}

      </section>
    </PageLayout>
  );
}
