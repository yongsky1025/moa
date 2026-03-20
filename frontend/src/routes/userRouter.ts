import LoginPage from "../users/pages/LoginPage";
import SignUpPage from "../users/pages/SignUpPage";
import OnboardingPage from "../users/pages/OnboardingPage";
import SocialSignUpPage from "../users/pages/SocialSignUpPage";
import EnergyResultPage from "../users/pages/EnergyResultPage";
import EnergyTestPage from "../users/pages/EnergyTestPage";

export const userRouter = () => [
  { path: "login", Component: LoginPage },
  { path: "signup", Component: SignUpPage },
  { path: "social-signup", Component: SocialSignUpPage },
  { path: "onboarding", Component: OnboardingPage },
  { path: "energy-test", Component: EnergyTestPage },
  { path: "energy-test/result", Component: EnergyResultPage },
];
