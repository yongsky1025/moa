import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import PageLayout from '../../common/layout/PageLayout';
import BoardNotFoundPage from './BoardNotFoundPage';
import BoardSearchBar from '../components/BoardSearchBar';
import PaginationControls from '../components/PaginationControls';
import PostList from '../components/PostList';
import ActionBar from '../components/layout/ActionBar';
import PageHeader from '../components/layout/PageHeader';
import QueryStateBlock from '../components/layout/QueryStateBlock';
import { useBoardPageLayout } from '../hooks/useBoardPageLayout';
import { useCircleBoard } from '../hooks/useBoards';
import { useCirclePosts } from '../hooks/usePosts';
import { useCircleBoardParams } from '../hooks/route/useRouteParams';
import {
  toCircleBoardEditPath,
  toCircleBoardsPath,
  toCirclePostCreatePath,
  toCirclePostPath,
} from '../utils/paths';
import { pageUi } from './pageUi';

export default function CircleBoardReadPage() {
  const layout = useBoardPageLayout();
  const [searchParams, setSearchParams] = useSearchParams();
  const { parsedCircleId, parsedBoardId, isValid } = useCircleBoardParams();
  const navigate = useNavigate();
  const parsedPage = Number(searchParams.get('page') ?? '1');
  const page = Number.isInteger(parsedPage) && parsedPage > 0 ? parsedPage : 1;
  const keyword = searchParams.get('keyword') ?? '';

  const boardQuery = useCircleBoard(parsedCircleId ?? 0, parsedBoardId ?? 0, {
    enabled: isValid,
  });
  const postQuery = useCirclePosts(parsedCircleId ?? 0, parsedBoardId ?? 0, {
    page,
    size: 20,
    keyword,
  }, { enabled: isValid });
  const board = boardQuery.data;

  if (!isValid || !parsedCircleId || !parsedBoardId) {
    return <BoardNotFoundPage />;
  }

  const updateSearchParams = (next: { page: number; keyword: string }) => {
    const params = new URLSearchParams();
    params.set('page', String(next.page));
    params.set('size', '20');
    if (next.keyword) {
      params.set('keyword', next.keyword);
    }
    setSearchParams(params);
  };

  return (
    <PageLayout {...layout}>
      <section style={pageUi.pageSection}>
        <PageHeader
          title={`${board?.name ?? `Board ${parsedBoardId}`} (Circle ${parsedCircleId})`}
          actions={(
            <ActionBar>
            <Link
              style={pageUi.actionLink}
              to={toCircleBoardsPath(parsedCircleId)}
            >
              목록
            </Link>
            <button
              type="button"
              onClick={() => navigate(toCircleBoardEditPath(parsedCircleId, parsedBoardId))}
              style={pageUi.actionButton}
            >
              게시판 수정
            </button>
            <Link
              style={{
                ...pageUi.actionButton,
                color: '#fff',
                background: '#0f7a5a',
                border: '1px solid #0f7a5a',
                textDecoration: 'none',
              }}
              to={toCirclePostCreatePath(parsedCircleId, parsedBoardId)}
            >
              새 글 작성
            </Link>
            </ActionBar>
          )}
        />

        <BoardSearchBar
          keyword={keyword}
          onSearch={(nextKeyword) => updateSearchParams({ page: 1, keyword: nextKeyword })}
          onReset={() => updateSearchParams({ page: 1, keyword: '' })}
        />

        <p style={pageUi.mutedText}>검색어: {keyword || '전체'}</p>

        <QueryStateBlock
          loading={boardQuery.loading}
          loadingText="Loading board..."
          error={boardQuery.error}
        />

        <QueryStateBlock
          loading={postQuery.loading}
          loadingText="Loading posts..."
          error={postQuery.error}
        />
        {postQuery.data && (
          <>
            <PostList
              posts={postQuery.data.content}
              makePostPath={(postId) =>
                toCirclePostPath(parsedCircleId, parsedBoardId, postId)
              }
            />
            <PaginationControls
              page={page}
              totalPages={postQuery.data.totalPages}
              onChangePage={(nextPage) =>
                updateSearchParams({ page: nextPage, keyword })
              }
            />
          </>
        )}
      </section>
    </PageLayout>
  );
}
