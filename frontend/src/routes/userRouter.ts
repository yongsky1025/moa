import LoginPage from '../users/pages/LoginPage';
import SignUpPage from '../users/pages/SignUpPage';

export const userRouter = () => [
  { path: 'login', Component: LoginPage },
  { path: 'signup', Component: SignUpPage },
];
