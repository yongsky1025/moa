import { useState, type FormEvent } from 'react';

interface ReplyFormProps {
  loading?: boolean;
  submitLabel?: string;
  defaultContent?: string;
  onSubmit: (content: string) => Promise<void> | void;
}

export default function ReplyForm({
  loading = false,
  submitLabel = 'Reply',
  defaultContent = '',
  onSubmit,
}: ReplyFormProps) {
  const [content, setContent] = useState(defaultContent);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!content.trim()) {
      setError('Reply content is required.');
      return;
    }
    setError(null);
    await onSubmit(content.trim());
    setContent('');
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 8 }}>
      <textarea
        value={content}
        onChange={(event) => setContent(event.target.value)}
        rows={3}
        style={{
          border: '1px solid #ddd7ca',
          borderRadius: 8,
          padding: '10px 12px',
          fontSize: 14,
          resize: 'vertical',
        }}
      />
      {error && <p style={{ color: 'crimson' }}>{error}</p>}
      <button
        type="submit"
        disabled={loading}
        style={{
          width: 120,
          border: '1px solid #d7d1c2',
          borderRadius: 8,
          padding: '9px 12px',
          fontWeight: 600,
          background: '#fff',
          cursor: 'pointer',
        }}
      >
        {loading ? 'Saving...' : submitLabel}
      </button>
    </form>
  );
}
