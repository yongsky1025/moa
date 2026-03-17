import { Link, useNavigate } from 'react-router-dom';
import PageLayout from '../../common/layout/PageLayout';
import BoardNotFoundPage from './BoardNotFoundPage';
import PostDetail from '../components/PostDetail';
import ReplyForm from '../components/ReplyForm';
import ReplyList from '../components/ReplyList';
import ActionBar from '../components/layout/ActionBar';
import PageHeader from '../components/layout/PageHeader';
import QueryStateBlock from '../components/layout/QueryStateBlock';
import { useBoardPageLayout } from '../hooks/useBoardPageLayout';
import { useGlobalPost } from '../hooks/usePosts';
import {
  useCreateChildReply,
  useCreateReply,
  useDeleteReply,
  useReplies,
  useUpdateReply,
} from '../hooks/useReplies';
import { useGlobalPostParams } from '../hooks/route/useRouteParams';
import { toGlobalBoardPath, toGlobalPostEditPath } from '../utils/paths';
import { pageUi } from './pageUi';

export default function GlobalPostReadPage() {
  const navigate = useNavigate();
  const layout = useBoardPageLayout();
  const { resolvedBoardType, parsedPostId, isValid } = useGlobalPostParams();

  const postQuery = useGlobalPost(
    resolvedBoardType ?? 'notice',
    parsedPostId ?? 0,
    { enabled: isValid },
  );
  const replyQuery = useReplies(parsedPostId ?? 0, { enabled: isValid });

  const createReply = useCreateReply();
  const createChildReply = useCreateChildReply();
  const updateReply = useUpdateReply();
  const deleteReply = useDeleteReply();

  const boardTitle =
    resolvedBoardType === 'notice' ? '공지 게시판' : '자유 게시판';

  if (!isValid || !resolvedBoardType || !parsedPostId) {
    return <BoardNotFoundPage />;
  }

  return (
    <PageLayout {...layout}>
      <section style={pageUi.pageSection}>
        <PageHeader
          title="게시글 상세"
          description={boardTitle}
          actions={(
            <ActionBar>
            <Link
              to={toGlobalBoardPath(resolvedBoardType)}
              style={pageUi.actionLink}
            >
              게시판
            </Link>
            <button
              type="button"
              onClick={() => navigate(toGlobalBoardPath(resolvedBoardType))}
              style={pageUi.actionButton}
            >
              목록으로
            </button>
            <Link
              to={toGlobalPostEditPath(resolvedBoardType, parsedPostId)}
              style={pageUi.actionLink}
            >
              수정
            </Link>
            </ActionBar>
          )}
        />

        <QueryStateBlock
          loading={postQuery.loading}
          loadingText="Loading post..."
          error={postQuery.error}
        />

        {postQuery.data && <PostDetail post={postQuery.data} />}

        <section
          style={{
            display: 'grid',
            gap: 10,
            borderTop: '1px solid #ece6d8',
            paddingTop: 12,
          }}
        >
          <h3 style={{ margin: 0 }}>댓글</h3>
          <ReplyForm
            loading={createReply.loading}
            submitLabel="댓글 등록"
            onSubmit={async (content) => {
              const created = await createReply.mutate(parsedPostId, {
                content,
              });
              if (created !== null) {
                await replyQuery.refetch();
              }
            }}
          />
          <QueryStateBlock
            loading={replyQuery.loading}
            loadingText="Loading replies..."
            error={replyQuery.error}
          />
          {replyQuery.data && (
            <ReplyList
              replies={replyQuery.data}
              onDelete={async (replyId) => {
                const deleted = await deleteReply.mutate(parsedPostId, replyId);
                if (deleted !== null) {
                  await replyQuery.refetch();
                }
              }}
              onEdit={async (replyId, content) => {
                const updated = await updateReply.mutate(
                  parsedPostId,
                  replyId,
                  {
                    content,
                  },
                );
                if (updated !== null) {
                  await replyQuery.refetch();
                }
              }}
              onReply={async (replyId, content) => {
                const created = await createChildReply.mutate(
                  parsedPostId,
                  replyId,
                  {
                    content,
                  },
                );
                if (created !== null) {
                  await replyQuery.refetch();
                }
              }}
            />
          )}
        </section>
      </section>
    </PageLayout>
  );
}
