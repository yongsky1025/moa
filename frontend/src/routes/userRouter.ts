import LoginPage from '../users/pages/LoginPage';
import SignUpPage from '../users/pages/SignUpPage';
import OnboardingPage from '../users/pages/OnboardingPage';
import SocialSignUpPage from '../users/pages/SocialSignUpPage';
import EnergyResultPage from '../users/pages/EnergyResultPage';

export const userRouter = () => [
  { path: 'login', Component: LoginPage },
  { path: 'signup', Component: SignUpPage },
  { path: 'onboarding', Component: OnboardingPage },
  { path: 'social-signup', Component: SocialSignUpPage },
  { path: 'energy-result', Component: EnergyResultPage },
];
