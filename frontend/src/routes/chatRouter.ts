import ChatListPage from '../pages/ChatListPage';
import ChatRoomPage from '../pages/ChatRoomPage';
import ChatPopupPage from '../pages/ChatPopupPage';
import ProfilePage from '../pages/ProfilePage';
import Layout from '../components/common/Layout';
import PrivateRoute from '../components/common/PrivateRoute';

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
