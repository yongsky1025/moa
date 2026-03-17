import type { ReactNode } from 'react';
import { pageUi } from '../../pages/pageUi';

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: ReactNode;
}

export default function PageHeader({
  title,
  description,
  actions,
}: PageHeaderProps) {
  return (
    <header style={pageUi.header}>
      <div>
        <h1 style={pageUi.title}>{title}</h1>
        {description && <p style={pageUi.description}>{description}</p>}
      </div>
      {actions}
    </header>
  );
}
