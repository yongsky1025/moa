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
      style={{
        marginTop: 0,
        lineHeight: 1.95,
        fontSize: 16,
        color: "#111827",
        wordBreak: "break-word",
      }}
      dangerouslySetInnerHTML={{ __html: sanitized }}
    />
  );
}
