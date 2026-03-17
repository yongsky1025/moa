import { useMemo, useRef, useState, type FormEvent } from 'react';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import {
  Essentials,
  Paragraph,
  Heading,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Link,
  List,
  BlockQuote,
  ClassicEditor,
  Image,
  ImageUpload,
  ImageToolbar,
  ImageCaption,
  ImageStyle,
  ImageResize,
  type EditorConfig,
} from 'ckeditor5';
import 'ckeditor5/ckeditor5.css';
import './postRichText.css';
import { pageUi } from '../pages/pageUi';
import { postImageApi } from '../api/postImageApi';

interface PostFormProps {
  defaultTitle?: string;
  defaultContent?: string;
  loading?: boolean;
  submitLabel?: string;
  onSubmit: (payload: { title: string; content: string; tempKey?: string }) => Promise<void> | void;
}

interface CkUploadLoader {
  file: Promise<File>;
}

interface CkUploadAdapter {
  upload(): Promise<{ default: string }>;
  abort(): void;
}

class PostImageUploadAdapter implements CkUploadAdapter {
  private loader: CkUploadLoader;
  private tempKey: string;
  private ord: number;
  private aborted = false;

  constructor(loader: CkUploadLoader, tempKey: string, ord: number) {
    this.loader = loader;
    this.tempKey = tempKey;
    this.ord = ord;
  }

  async upload(): Promise<{ default: string }> {
    const file = await this.loader.file;
    if (this.aborted) {
      throw new Error('Upload aborted');
    }
    const uploaded = await postImageApi.uploadTempImage(file, this.tempKey, this.ord);
    if (this.aborted) {
      throw new Error('Upload aborted');
    }
    return { default: uploaded.imageUrl };
  }

  abort() {
    this.aborted = true;
  }
}

const createTempKey = () => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `post-${crypto.randomUUID()}`;
  }
  return `post-${Date.now()}-${Math.random().toString(36).slice(2)}`;
};

const stripHtml = (value: string) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(value, 'text/html');
  return {
    text: (doc.body.textContent ?? '').replace(/\u00a0/g, ' ').trim(),
    hasImage: doc.body.querySelector('img') !== null,
  };
};

export default function PostForm({
  defaultTitle = '',
  defaultContent = '',
  loading = false,
  submitLabel = 'Save',
  onSubmit,
}: PostFormProps) {
  const [title, setTitle] = useState(defaultTitle);
  const [content, setContent] = useState(defaultContent);
  const [error, setError] = useState<string | null>(null);
  const [editorFailed, setEditorFailed] = useState(false);
  const tempKeyRef = useRef<string>(createTempKey());
  const uploadOrdRef = useRef<number>(0);
  const editorConfig = useMemo<EditorConfig>(
    () => ({
      licenseKey: 'GPL',
      plugins: [
        Essentials,
        Paragraph,
        Heading,
        Bold,
        Italic,
        Underline,
        Strikethrough,
        Link,
        List,
        BlockQuote,
        Image,
        ImageUpload,
        ImageToolbar,
        ImageCaption,
        ImageStyle,
        ImageResize,
      ],
      toolbar: [
        'undo',
        'redo',
        '|',
        'heading',
        '|',
        'bold',
        'italic',
        'underline',
        'strikethrough',
        '|',
        'link',
        'bulletedList',
        'numberedList',
        '|',
        'uploadImage',
        '|',
        'blockQuote',
      ],
      image: {
        toolbar: [
          'imageStyle:inline',
          'imageStyle:block',
          'imageStyle:side',
          '|',
          'toggleImageCaption',
          'imageTextAlternative',
        ],
      },
    }),
    [],
  );

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!title.trim()) {
      setError('Title is required.');
      return;
    }
    const { text, hasImage } = stripHtml(content);
    if (!text && !hasImage) {
      setError('Content is required.');
      return;
    }
    setError(null);
    await onSubmit({
      title: title.trim(),
      content,
      tempKey: tempKeyRef.current,
    });
  };

  return (
    <form onSubmit={handleSubmit} style={pageUi.form}>
      <label htmlFor="postTitle" style={pageUi.formLabel}>
        Title
      </label>
      <input
        id="postTitle"
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        placeholder="Post title"
        style={pageUi.input}
      />
      <label htmlFor="postContent" style={pageUi.formLabel}>
        Content
      </label>
      {editorFailed ? (
        <textarea
          id="postContent"
          value={content}
          onChange={(event) => setContent(event.target.value)}
          placeholder="Post content"
          rows={8}
          style={pageUi.textarea}
        />
      ) : (
        <div className="board-editor-shell">
          <CKEditor
            editor={ClassicEditor}
            config={editorConfig}
            data={content}
            onReady={(editor) => {
              try {
                const fileRepository = editor.plugins.get('FileRepository') as {
                  createUploadAdapter?: (loader: CkUploadLoader) => CkUploadAdapter;
                };
                if (fileRepository) {
                  fileRepository.createUploadAdapter = (loader: CkUploadLoader) => {
                    uploadOrdRef.current += 1;
                    return new PostImageUploadAdapter(loader, tempKeyRef.current, uploadOrdRef.current);
                  };
                }
              } catch {
                setEditorFailed(true);
              }
            }}
            onChange={(_, editor) => {
              setContent(editor.getData());
            }}
            onError={() => {
              setEditorFailed(true);
            }}
          />
        </div>
      )}
      {error && <p style={pageUi.errorText}>{error}</p>}
      <button
        type="submit"
        disabled={loading}
        style={loading ? pageUi.buttonPrimaryDisabled : pageUi.buttonPrimary}
      >
        {loading ? 'Saving...' : submitLabel}
      </button>
    </form>
  );
}
