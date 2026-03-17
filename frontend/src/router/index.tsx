import { createBrowserRouter } from 'react-router-dom';
import LoginPage from '../pages/LoginPage';
import ChatListPage from '../pages/ChatListPage';
import ChatRoomPage from '../pages/ChatRoomPage';
import ChatPopupPage from '../pages/ChatPopupPage';
import ProfilePage from '../pages/ProfilePage';
import Layout from '../components/common/Layout';
import PrivateRoute from '../components/common/PrivateRoute';

const router = createBrowserRouter(
  [
    { path: '/login', element: <LoginPage /> },
    {
      element: <PrivateRoute />,
      children: [
        { path: '/chat/popup', element: <ChatPopupPage /> },
        {
          element: <Layout />,
          children: [
            { path: '/chat', element: <ChatListPage /> },
            { path: '/chat/room/:roomId', element: <ChatRoomPage /> },
            { path: '/profile', element: <ProfilePage /> },
          ],
        },
      ],
    },
    { path: '*', element: <LoginPage /> },
  ],
  { future: { v7_startTransition: true, v7_relativeSplatPath: true } }
);

export default router;
