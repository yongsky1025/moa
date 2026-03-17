import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { Provider } from 'react-redux';
import { RouterProvider } from 'react-router-dom';
import rootRouter from './routes/rootRouters.ts';
import { store } from './users/reducers/store.ts';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <RouterProvider router={rootRouter} />
    </Provider>
  </StrictMode>,
);
