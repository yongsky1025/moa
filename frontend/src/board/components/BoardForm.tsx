import { useState, type FormEvent } from 'react';
import { pageUi } from '../pages/pageUi';

interface BoardFormProps {
  defaultName?: string;
  loading?: boolean;
  submitLabel?: string;
  onSubmit: (name: string) => Promise<void> | void;
}

export default function BoardForm({
  defaultName = '',
  loading = false,
  submitLabel = 'Save',
  onSubmit,
}: BoardFormProps) {
  const [name, setName] = useState(defaultName);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!name.trim()) {
      setError('Board name is required.');
      return;
    }
    setError(null);
    await onSubmit(name.trim());
  };

  return (
    <form onSubmit={handleSubmit} style={pageUi.form}>
      <label htmlFor="boardName" style={pageUi.formLabel}>
        Board name
      </label>
      <input
        id="boardName"
        value={name}
        onChange={(event) => setName(event.target.value)}
        placeholder="Board name"
        style={pageUi.input}
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
