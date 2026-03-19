import { createBrowserRouter } from 'react-router-dom';
import LandingPage from '../common/LandingPage';
import OAuthCallbackPage from '../users/pages/OAuthCallbackPage';
import { userRouter } from './userRouter';
import { circleRouter } from './circleRouter';
import { boardRouter } from './boardRouter';
import { adminRouter } from './adminRouter';
import { placeRouter } from './placeRouter';
import { chatRouter } from './chatRouter';

const rootRouter = createBrowserRouter([
  {
    path: '/',
    Component: LandingPage,
  },
  { path: '/oauth2/callback', Component: OAuthCallbackPage },
  { path: '/users', children: userRouter() },
  { path: '/circle', children: circleRouter() },
  { path: '/board', children: boardRouter() },
  { path: '/admin', children: adminRouter() },
  { path: '/place', children: placeRouter() },
  { path: '/chat', children: chatRouter() },
]);

export default rootRouter;
