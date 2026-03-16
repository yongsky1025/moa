import type { ReactNode } from 'react';
import Footer from './Footer';
import Navbar from './Navbar';

interface PageLayoutProps extends NavbarProps {
  children: ReactNode;
}

export default function PageLayout({
  children,
  isLoggedIn,
  onToggleLogin,
  isAdmin,
}: PageLayoutProps) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        background: 'oklch(0.985 0.012 80)',
      }}
    >
      <Navbar
        isLoggedIn={isLoggedIn}
        onToggleLogin={onToggleLogin}
        isAdmin={isAdmin}
      />
      <main
        style={{
          flex: 1,
          maxWidth: '1280px',
          width: '100%',
          margin: '0 auto',
          padding: '2rem 1.5rem',
        }}
      >
        {children}
      </main>
      <Footer />
    </div>
  );
}
