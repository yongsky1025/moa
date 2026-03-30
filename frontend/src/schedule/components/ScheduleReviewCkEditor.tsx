import { CKEditor } from "@ckeditor/ckeditor5-react";
import {
  BlockQuote,
  Bold,
  ClassicEditor,
  Essentials,
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
  type Editor,
} from "ckeditor5";
import "ckeditor5/ckeditor5.css";
import {
  createEditorUploadAdapterPlugin,
  EDITOR_UPLOAD_DOMAINS,
} from "../../post/upload/editorUploadAdapter";

interface ScheduleReviewCkEditorProps {
  value: string;
  onChange: (value: string) => void;
  onError?: (message: string) => void;
}

const reviewUploadPlugin = createEditorUploadAdapterPlugin(
  EDITOR_UPLOAD_DOMAINS.SCHEDULE_REVIEW
);

export default function ScheduleReviewCkEditor({
  value,
  onChange,
  onError,
}: ScheduleReviewCkEditorProps) {
  return (
    <CKEditor
      editor={ClassicEditor}
      data={value}
      config={{
        licenseKey: "GPL",
        placeholder: "후기를 작성해주세요. 이미지도 첨부할 수 있습니다.",
        plugins: [
          Essentials,
          Paragraph,
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
        ],
        toolbar: {
          items: [
            "bold",
            "italic",
            "link",
            "|",
            "bulletedList",
            "numberedList",
            "blockQuote",
            "|",
            "uploadImage",
          ],
        },
        extraPlugins: [reviewUploadPlugin],
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
