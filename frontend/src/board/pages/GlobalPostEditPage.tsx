import { useNavigate } from 'react-router-dom';
import PageLayout from '../../common/layout/PageLayout';
import BoardNotFoundPage from './BoardNotFoundPage';
import PostFormPage from './PostFormPage';
import QueryStateBlock from '../components/layout/QueryStateBlock';
import { useBoardPageLayout } from '../hooks/useBoardPageLayout';
import {
  useDeleteGlobalPost,
  useGlobalPost,
  useUpdateGlobalPost,
} from '../hooks/usePosts';
import {
  toGlobalBoardPath,
  toGlobalPostPath,
} from '../utils/paths';
import { useGlobalPostParams } from '../hooks/route/useRouteParams';
import { pageUi } from './pageUi';

export default function GlobalPostEditPage() {
  const navigate = useNavigate();
  const layout = useBoardPageLayout();
  const { resolvedBoardType, parsedPostId, isValid } = useGlobalPostParams();

  const postQuery = useGlobalPost(
    resolvedBoardType ?? 'notice',
    parsedPostId ?? 0,
    { enabled: isValid },
  );
  const updateMutation = useUpdateGlobalPost();
  const deleteMutation = useDeleteGlobalPost();

  if (!isValid || !resolvedBoardType || !parsedPostId) {
    return <BoardNotFoundPage />;
  }

  return (
    <PageLayout {...layout}>
      <QueryStateBlock
        loading={postQuery.loading}
        loadingText="Loading post..."
        error={postQuery.error}
      />
      {postQuery.data && (
        <PostFormPage
          title="게시글 수정"
          description={resolvedBoardType === 'notice' ? '공지 게시판' : '자유 게시판'}
          defaultTitle={postQuery.data.title}
          defaultContent={postQuery.data.content}
          loading={updateMutation.loading}
          submitLabel="Update"
          error={updateMutation.error ?? deleteMutation.error}
          onBack={() => navigate(toGlobalBoardPath(resolvedBoardType))}
          dangerAction={(
            <button
              type="button"
              onClick={async () => {
                const ok = window.confirm('Delete this post?');
                if (!ok) return;
                const deleted = await deleteMutation.mutate(resolvedBoardType, parsedPostId);
                if (deleted !== null) {
                  navigate(toGlobalBoardPath(resolvedBoardType));
                }
              }}
              style={pageUi.actionDanger}
            >
              삭제
            </button>
          )}
          onSubmit={async (payload) => {
            const updated = await updateMutation.mutate(
              resolvedBoardType,
              parsedPostId,
              payload,
            );
            if (updated !== null) {
              navigate(toGlobalPostPath(resolvedBoardType, parsedPostId));
            }
          }}
        />
      )}
    </PageLayout>
  );
}
