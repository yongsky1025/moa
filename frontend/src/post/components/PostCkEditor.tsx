import { CKEditor } from "@ckeditor/ckeditor5-react";
import {
  BlockQuote,
  Bold,
  ClassicEditor,
  Essentials,
  Heading,
  Image,
  ImageCaption,
  ImageResize,
  ImageStyle,
  ImageToolbar,
  ImageUpload,
  Italic,
  Link,
  List,
  Paragraph,
  Table,
  TableToolbar,
  type Editor,
} from "ckeditor5";
import "ckeditor5/ckeditor5.css";
import {
  createEditorUploadAdapterPlugin,
  EDITOR_UPLOAD_DOMAINS,
} from "../upload/editorUploadAdapter";

interface PostCkEditorProps {
  value: string;
  onChange: (value: string) => void;
  onError?: (message: string) => void;
}

const postUploadPlugin = createEditorUploadAdapterPlugin(EDITOR_UPLOAD_DOMAINS.POST);

export default function PostCkEditor({ value, onChange, onError }: PostCkEditorProps) {
  return (
    <CKEditor
      editor={ClassicEditor}
      data={value}
      config={{
        licenseKey: "GPL",
        placeholder: "내용을 입력하세요",
        plugins: [
          Essentials,
          Paragraph,
          Heading,
          Bold,
          Italic,
          Link,
          List,
          BlockQuote,
          Image,
          ImageUpload,
          ImageCaption,
          ImageToolbar,
          ImageStyle,
          ImageResize,
          Table,
          TableToolbar,
        ],
        toolbar: {
          items: [
            "undo",
            "redo",
            "|",
            "heading",
            "|",
            "bold",
            "italic",
            "link",
            "|",
            "bulletedList",
            "numberedList",
            "blockQuote",
            "|",
            "uploadImage",
            "insertTable",
          ],
        },
        extraPlugins: [postUploadPlugin],
        image: {
          toolbar: [
            "imageTextAlternative",
            "|",
            "imageStyle:inline",
            "imageStyle:wrapText",
            "imageStyle:breakText",
            "|",
            "resizeImage",
          ],
        },
        table: {
          contentToolbar: ["tableColumn", "tableRow", "mergeTableCells"],
        },
      }}
      onChange={(_, editor: Editor) => {
        onChange(editor.getData());
      }}
      onError={() => {
        onError?.("에디터 처리 중 오류가 발생했습니다.");
      }}
    />
  );
}
