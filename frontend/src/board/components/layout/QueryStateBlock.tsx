import { pageUi } from '../../pages/pageUi';

interface QueryStateBlockProps {
  loading?: boolean;
  loadingText?: string;
  error?: string | null;
  empty?: boolean;
  emptyText?: string;
}

export default function QueryStateBlock({
  loading = false,
  loadingText = 'Loading...',
  error = null,
  empty = false,
  emptyText = 'No data',
}: QueryStateBlockProps) {
  if (loading) {
    return <p>{loadingText}</p>;
  }
  if (error) {
    return <p style={pageUi.errorText}>{error}</p>;
  }
  if (empty) {
    return <p style={pageUi.mutedText}>{emptyText}</p>;
  }
  return null;
}
