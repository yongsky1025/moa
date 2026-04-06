import LoginPage from "../users/pages/LoginPage";
import SignUpPage from "../users/pages/SignUpPage";
import EmailSignUpPage from "../users/pages/EmailSignUpPage";
import OnboardingPage from "../users/pages/OnboardingPage";
import SocialSignUpPage from "../users/pages/SocialSignUpPage";
import EnergyResultPage from "../users/pages/EnergyResultPage";
import EnergyTestPage from "../users/pages/EnergyTestPage";
import UserProfilePage from "../users/pages/UserProfilePage";
import AccountPage from "../users/pages/AccountPage";
import AccountStatusPage from "../users/pages/AccountStatusPage";
import MySchedulesPage from "../schedule/pages/MySchedulesPage";
import MyPlaceReviewPage from "../place/pages/MyPlaceReviewPage";
import MyPostsPage from "../post/pages/MyPostsPage";
import MyRepliesPage from "../post/pages/MyRepliesPage";
import MyBookmarkedPostsPage from "../post/pages/MyBookmarkedPostsPage";

export const userRouter = () => [
  { path: "login", Component: LoginPage },
  { path: "signup", Component: SignUpPage },
  { path: "email-signup", Component: EmailSignUpPage },
  { path: "social-signup", Component: SocialSignUpPage },
  { path: "onboarding", Component: OnboardingPage },
  { path: "energy-test", Component: EnergyTestPage },
  { path: "energy-test/result", Component: EnergyResultPage },
  { path: "profile", Component: UserProfilePage },
  { path: "account", Component: AccountPage },
  { path: "account-status", Component: AccountStatusPage },
  { path: "my-schedules", Component: MySchedulesPage },
  { path: "my-place-reviews", Component: MyPlaceReviewPage },
  { path: "my-posts", Component: MyPostsPage },
  { path: "my-replies", Component: MyRepliesPage },
  { path: "my-bookmarked-posts", Component: MyBookmarkedPostsPage },
];
