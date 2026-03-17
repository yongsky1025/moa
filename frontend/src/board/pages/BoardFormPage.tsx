import type { ReactNode } from 'react';
import BoardForm from '../components/BoardForm';
import ActionBar from '../components/layout/ActionBar';
import PageHeader from '../components/layout/PageHeader';
import SectionCard from '../components/layout/SectionCard';
import { pageUi } from './pageUi';

interface BoardFormPageProps {
  title: string;
  description?: string;
  backLabel?: string;
  onBack: () => void;
  defaultName?: string;
  submitLabel: string;
  loading: boolean;
  error?: string | null;
  dangerAction?: ReactNode;
  onSubmit: (name: string) => Promise<void> | void;
}

export default function BoardFormPage({
  title,
  description,
  backLabel = '목록으로',
  onBack,
  defaultName,
  submitLabel,
  loading,
  error,
  dangerAction,
  onSubmit,
}: BoardFormPageProps) {
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
        <BoardForm
          defaultName={defaultName}
          submitLabel={submitLabel}
          loading={loading}
          onSubmit={onSubmit}
        />
        {error && <p style={{ ...pageUi.errorText, marginTop: 8 }}>{error}</p>}
      </SectionCard>
    </section>
  );
}
