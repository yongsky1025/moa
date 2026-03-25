import { useState } from "react";
import PostCkEditor from "./PostCkEditor";

function EditorBox() {
  const [content, setContent] = useState("<p>hello react editor world!</p>");

  return (
    <PostCkEditor
      value={content}
      onChange={setContent}
    />
  );
}

export default EditorBox;
