import type { ReactNode } from 'react';
import PostForm from '../components/PostForm';
import ActionBar from '../components/layout/ActionBar';
import PageHeader from '../components/layout/PageHeader';
import SectionCard from '../components/layout/SectionCard';
import { pageUi } from './pageUi';

interface PostFormPageProps {
  title: string;
  description?: string;
  backLabel?: string;
  onBack: () => void;
  defaultTitle?: string;
  defaultContent?: string;
  submitLabel: string;
  loading: boolean;
  error?: string | null;
  dangerAction?: ReactNode;
  onSubmit: (payload: { title: string; content: string }) => Promise<void> | void;
}

export default function PostFormPage({
  title,
  description,
  backLabel = '목록으로',
  onBack,
  defaultTitle,
  defaultContent,
  submitLabel,
  loading,
  error,
  dangerAction,
  onSubmit,
}: PostFormPageProps) {
  return (
    <section style={pageUi.pageSection}>
      <PageHeader
        title={title}
        description={description}
        actions={(
          <ActionBar>
          <button
            type="button"
            onClick={onBack}
            style={pageUi.actionButton}
          >
            {backLabel}
          </button>
          {dangerAction}
          </ActionBar>
        )}
      />

      <SectionCard>
        <PostForm
          defaultTitle={defaultTitle}
          defaultContent={defaultContent}
          submitLabel={submitLabel}
          loading={loading}
          onSubmit={onSubmit}
        />
        {error && <p style={{ ...pageUi.errorText, marginTop: 8 }}>{error}</p>}
      </SectionCard>
    </section>
  );
}
