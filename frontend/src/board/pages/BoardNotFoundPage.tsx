import { Link } from 'react-router-dom';

export default function BoardNotFoundPage() {
  return (
    <section style={{ padding: 20 }}>
      <h1>Board page not found</h1>
      <Link to="/board/global/notice">Go to notice board</Link>
    </section>
  );
}
