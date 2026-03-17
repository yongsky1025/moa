import type { ReactNode } from 'react';
import { pageUi } from '../../pages/pageUi';

interface SectionCardProps {
  children: ReactNode;
}

export default function SectionCard({ children }: SectionCardProps) {
  return <section style={pageUi.sectionCard}>{children}</section>;
}
