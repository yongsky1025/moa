import DOMPurify from "dompurify";
import "ckeditor5/ckeditor5.css";

interface PostContentProps {
  html: string;
}

export default function PostContent({ html }: PostContentProps) {
  const sanitized = DOMPurify.sanitize(html);

  return (
    <article
      className="ck-content"
      style={{ marginTop: 16, lineHeight: 1.7 }}
      dangerouslySetInnerHTML={{ __html: sanitized }}
    />
  );
}
