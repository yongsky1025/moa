import type { Post } from '../types';
import { pageUi } from '../pages/pageUi';

interface PostDetailProps {
  post: Post;
}

export default function PostDetail({ post }: PostDetailProps) {
  const formatDate = (value?: string) => {
    if (!value) {
      return '-';
    }
    return value.slice(0, 16).replace('T', ' ');
  };

  return (
    <article style={pageUi.sectionCard}>
      <h2 style={{ margin: '0 0 10px', color: '#23201b' }}>{post.title}</h2>
      <div style={pageUi.metaBar}>
        <span style={pageUi.chip}>작성자 {post.authorName}</span>
        <span style={pageUi.chip}>조회 {post.viewCount}</span>
        <span style={pageUi.chip}>댓글 {post.replyCount}</span>
        <span style={pageUi.chip}>작성일 {formatDate(post.createDate)}</span>
      </div>
      <p style={pageUi.contentBody}>{post.content}</p>
    </article>
  );
}
