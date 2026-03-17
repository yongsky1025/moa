import { Link, useParams, useSearchParams } from 'react-router-dom';
import PageLayout from '../../common/layout/PageLayout';
import BoardNotFoundPage from './BoardNotFoundPage';
import BoardSearchBar from '../components/BoardSearchBar';
import PaginationControls from '../components/PaginationControls';
import PostList from '../components/PostList';
import ActionBar from '../components/layout/ActionBar';
import PageHeader from '../components/layout/PageHeader';
import QueryStateBlock from '../components/layout/QueryStateBlock';
import { useBoardPageLayout } from '../hooks/useBoardPageLayout';
import { useGlobalPosts } from '../hooks/usePosts';
import { isGlobalBoardType } from '../utils/guards';
import { toGlobalBoardPath, toGlobalPostCreatePath, toGlobalPostPath } from '../utils/paths';
import { pageUi } from './pageUi';

export default function GlobalBoardPage() {
  const { boardType } = useParams();
  const layout = useBoardPageLayout();
  const [searchParams, setSearchParams] = useSearchParams();
  const resolvedBoardType = boardType && isGlobalBoardType(boardType) ? boardType : null;

  const parsedPage = Number(searchParams.get('page') ?? '1');
  const page = Number.isInteger(parsedPage) && parsedPage > 0 ? parsedPage : 1;
  const keyword = searchParams.get('keyword') ?? '';

  const query = useGlobalPosts(
    resolvedBoardType ?? 'notice',
    { page, size: 20, keyword },
    { enabled: Boolean(resolvedBoardType) },
  );
  const boardTitle = resolvedBoardType === 'notice' ? '공지 게시판' : '자유 게시판';

  if (!resolvedBoardType) {
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
          title={boardTitle}
          actions={(
            <ActionBar>
            <Link
              style={{
                fontWeight: 700,
                textDecoration: 'none',
                color: boardType === 'notice' ? '#fff' : '#2c2924',
                background: boardType === 'notice' ? '#2c2924' : '#fff',
                border: '1px solid #d9d2c4',
                borderRadius: 999,
                padding: '7px 12px',
              }}
              to={toGlobalBoardPath('notice')}
            >
              공지
            </Link>
            <Link
              style={{
                fontWeight: 700,
                textDecoration: 'none',
                color: boardType === 'free' ? '#fff' : '#2c2924',
                background: boardType === 'free' ? '#2c2924' : '#fff',
                border: '1px solid #d9d2c4',
                borderRadius: 999,
                padding: '7px 12px',
              }}
              to={toGlobalBoardPath('free')}
            >
              자유
            </Link>
            <Link
              style={{
                fontWeight: 700,
                textDecoration: 'none',
                color: '#fff',
                background: '#0f7a5a',
                border: '1px solid #0f7a5a',
                borderRadius: 10,
                padding: '7px 12px',
              }}
              to={toGlobalPostCreatePath(resolvedBoardType)}
            >
              글쓰기
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

        <QueryStateBlock loading={query.loading} error={query.error} />
        {query.data && (
          <>
            <PostList
              posts={query.data.content}
              makePostPath={(postId) => toGlobalPostPath(resolvedBoardType, postId)}
            />
            <PaginationControls
              page={page}
              totalPages={query.data.totalPages}
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
