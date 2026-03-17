import { useNavigate } from 'react-router-dom';
import PageLayout from '../../common/layout/PageLayout';
import BoardNotFoundPage from './BoardNotFoundPage';
import PostFormPage from './PostFormPage';
import { useBoardPageLayout } from '../hooks/useBoardPageLayout';
import { useCirclePost, useDeleteCirclePost, useUpdateCirclePost } from '../hooks/usePosts';
import { useCirclePostParams } from '../hooks/route/useRouteParams';
import { toCircleBoardPath, toCirclePostPath } from '../utils/paths';
import QueryStateBlock from '../components/layout/QueryStateBlock';
import { pageUi } from './pageUi';

export default function CirclePostEditPage() {
  const layout = useBoardPageLayout();
  const navigate = useNavigate();
  const { parsedCircleId, parsedBoardId, parsedPostId, isValid } =
    useCirclePostParams();

  const postQuery = useCirclePost(parsedCircleId ?? 0, parsedBoardId ?? 0, parsedPostId ?? 0, {
    enabled: isValid,
  });
  const updateMutation = useUpdateCirclePost();
  const deleteMutation = useDeleteCirclePost();

  if (!isValid || !parsedCircleId || !parsedBoardId || !parsedPostId) {
    return <BoardNotFoundPage />;
  }

  return (
    <PageLayout {...layout}>
      <section style={pageUi.pageSection}>
        <QueryStateBlock
          loading={postQuery.loading}
          loadingText="Loading post..."
          error={postQuery.error}
        />
        {postQuery.data && (
          <PostFormPage
            title="게시글 수정"
            description={`Circle ${parsedCircleId} / Board ${parsedBoardId}`}
            defaultTitle={postQuery.data.title}
            defaultContent={postQuery.data.content}
            loading={updateMutation.loading}
            submitLabel="Update"
            error={updateMutation.error ?? deleteMutation.error}
            onBack={() => navigate(toCircleBoardPath(parsedCircleId, parsedBoardId))}
            dangerAction={(
              <button
                type="button"
                onClick={async () => {
                  const ok = window.confirm('Delete this post?');
                  if (!ok) return;
                  const deleted = await deleteMutation.mutate(
                    parsedCircleId,
                    parsedBoardId,
                    parsedPostId,
                  );
                  if (deleted !== null) {
                    navigate(toCircleBoardPath(parsedCircleId, parsedBoardId));
                  }
                }}
                style={pageUi.actionDanger}
              >
                삭제
              </button>
            )}
            onSubmit={async (payload) => {
              const updated = await updateMutation.mutate(
                parsedCircleId,
                parsedBoardId,
                parsedPostId,
                payload,
              );
              if (updated !== null) {
                navigate(toCirclePostPath(parsedCircleId, parsedBoardId, parsedPostId));
              }
            }}
          />
        )}
      </section>
    </PageLayout>
  );
}
