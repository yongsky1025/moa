import { useState, type FormEvent } from 'react';
import { pageUi } from '../pages/pageUi';

interface PostFormProps {
  defaultTitle?: string;
  defaultContent?: string;
  loading?: boolean;
  submitLabel?: string;
  onSubmit: (payload: { title: string; content: string }) => Promise<void> | void;
}

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

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!title.trim()) {
      setError('Title is required.');
      return;
    }
    if (!content.trim()) {
      setError('Content is required.');
      return;
    }
    setError(null);
    await onSubmit({ title: title.trim(), content: content.trim() });
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
      <textarea
        id="postContent"
        value={content}
        onChange={(event) => setContent(event.target.value)}
        placeholder="Post content"
        rows={6}
        style={pageUi.textarea}
      />
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
