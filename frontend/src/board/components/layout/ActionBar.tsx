import type { ReactNode } from 'react';
import { pageUi } from '../../pages/pageUi';

interface ActionBarProps {
  children: ReactNode;
}

export default function ActionBar({ children }: ActionBarProps) {
  return <div style={pageUi.actions}>{children}</div>;
}
