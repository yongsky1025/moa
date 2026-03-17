import ChatListPage from '../chat/pages/ChatListPage';
import ChatRoomPage from '../chat/pages/ChatRoomPage';
import ChatPopupPage from '../chat/pages/ChatPopupPage';
import ProfilePage from '../chat/pages/ProfilePage';
import Layout from '../chat/components/Layout';
import PrivateRoute from '../chat/components/PrivateRoute';

export const chatRouter = () => {
  return [
    {
      Component: PrivateRoute,
      children: [
        { path: 'popup', Component: ChatPopupPage },
        {
          Component: Layout,
          children: [
            { index: true, Component: ChatListPage },
            { path: 'room/:roomId', Component: ChatRoomPage },
            { path: 'profile', Component: ProfilePage },
          ],
        },
      ],
    },
  ];
};
