import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { pageUi } from '../pages/pageUi';
import type { Post } from '../types';

interface PostListProps {
  posts: Post[];
  makePostPath: (postId: number) => string;
}

export default function PostList({ posts, makePostPath }: PostListProps) {
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== 'undefined' && window.innerWidth < 768,
  );

  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined;
    }
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  if (posts.length === 0) {
    return <div style={pageUi.emptyState}>게시글이 없습니다.</div>;
  }

  const formatDate = (value?: string) => {
    if (!value) {
      return '-';
    }
    return value.slice(0, 10);
  };

  if (isMobile) {
    return (
      <ul style={{ display: 'grid', gap: 10, listStyle: 'none', padding: 0, margin: 0 }}>
        {posts.map((post) => (
          <li key={post.postId} style={pageUi.cardMobile}>
            <Link to={makePostPath(post.postId)} style={pageUi.tableTitleLink}>
              {post.title}
            </Link>
            <div style={pageUi.cardMetaRow}>
              <span>#{post.postId}</span>
              <span>{post.authorName}</span>
              <span>조회 {post.viewCount}</span>
              <span>댓글 {post.replyCount}</span>
              <span>{formatDate(post.createDate)}</span>
            </div>
          </li>
        ))}
      </ul>
    );
  }

  return (
    <div style={pageUi.tableWrap}>
      <table style={pageUi.table}>
        <thead style={pageUi.tableHead}>
          <tr>
            <th style={pageUi.tableHeadCell}>번호</th>
            <th style={pageUi.tableHeadCell}>제목</th>
            <th style={pageUi.tableHeadCell}>작성자</th>
            <th style={pageUi.tableHeadCell}>조회</th>
            <th style={pageUi.tableHeadCell}>댓글</th>
            <th style={pageUi.tableHeadCell}>작성일</th>
          </tr>
        </thead>
        <tbody>
          {posts.map((post) => (
            <tr key={post.postId} style={pageUi.tableRow}>
              <td style={pageUi.tableCellNumeric}>{post.postId}</td>
              <td style={pageUi.tableCell}>
                <Link to={makePostPath(post.postId)} style={pageUi.tableTitleLink}>
                  {post.title}
                </Link>
              </td>
              <td style={pageUi.tableCellNumeric}>{post.authorName}</td>
              <td style={pageUi.tableCellNumeric}>{post.viewCount}</td>
              <td style={pageUi.tableCellNumeric}>{post.replyCount}</td>
              <td style={pageUi.tableCellNumeric}>{formatDate(post.createDate)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
