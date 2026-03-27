import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { RouterProvider } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import rootRouter from './routes/rootRouters.ts';
import { useAuthStore } from './store/authStore.ts';
import { queryClient } from './api/queryClient.ts';

useAuthStore.getState().restoreAuth();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={rootRouter} />
    </QueryClientProvider>
  </StrictMode>,
);
