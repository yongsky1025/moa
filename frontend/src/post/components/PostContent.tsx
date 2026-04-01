import { memo, useMemo } from "react";
import DOMPurify from "dompurify";
import "ckeditor5/ckeditor5.css";

interface PostContentProps {
  html: string;
}

function PostContent({ html }: PostContentProps) {
  const sanitized = useMemo(() => DOMPurify.sanitize(html), [html]);

  return (
    <article
      className="ck-content"
      style={{
        marginTop: 0,
        padding: 16,
        maxWidth: 760,
        marginLeft: "auto",
        marginRight: "auto",
        lineHeight: 1.75,
        fontSize: 16,
        color: "#111827",
        wordBreak: "break-word",
      }}
      dangerouslySetInnerHTML={{ __html: sanitized }}
    />
  );
}

export default memo(PostContent);
