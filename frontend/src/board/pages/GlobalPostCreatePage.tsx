import { useNavigate, useParams } from 'react-router-dom';
import PageLayout from '../../common/layout/PageLayout';
import BoardNotFoundPage from './BoardNotFoundPage';
import PostFormPage from './PostFormPage';
import { useBoardPageLayout } from '../hooks/useBoardPageLayout';
import { useCreateGlobalPost } from '../hooks/usePosts';
import { isGlobalBoardType } from '../utils/guards';
import { toGlobalBoardPath, toGlobalPostPath } from '../utils/paths';

export default function GlobalPostCreatePage() {
  const { boardType } = useParams();
  const navigate = useNavigate();
  const layout = useBoardPageLayout();
  const createMutation = useCreateGlobalPost();

  if (!boardType || !isGlobalBoardType(boardType)) {
    return <BoardNotFoundPage />;
  }

  return (
    <PageLayout {...layout}>
      <PostFormPage
        title={boardType === 'notice' ? '공지 글 작성' : '자유 글 작성'}
        description="제목과 본문을 입력해 새 게시글을 등록하세요."
        loading={createMutation.loading}
        submitLabel="Create"
        error={createMutation.error}
        onBack={() => navigate(toGlobalBoardPath(boardType))}
        onSubmit={async (payload) => {
          const createdId = await createMutation.mutate(boardType, payload);
          if (createdId) {
            navigate(toGlobalPostPath(boardType, createdId));
          }
        }}
      />
    </PageLayout>
  );
}
