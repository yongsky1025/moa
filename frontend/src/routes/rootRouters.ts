import { createBrowserRouter, redirect } from "react-router-dom";
import LandingPage from "../common/LandingPage";
import MainIndexWrapper from "./MainIndexWrapper";
import OAuthCallbackPage from "../users/pages/OAuthCallbackPage";
import { userRouter } from "./userRouter";
import { circleRouter } from "./circleRouter";
import { boardRouter } from "./boardRouter";
import { adminRouter } from "./adminRouter";
import { placeRouter } from "./placeRouter";
import { chatRouter } from "./chatRouter";
import ReportFormPage from "../admin/pages/ReportFormPage";
import PaymentSuccessPage from "../place/pages/PaymentSuccessPage";
import PaymentFailPage from "../place/pages/PaymentFailPage";
import NotFoundPage from "../common/pages/NotFoundPage";
import ErrorExamplePage from "../common/pages/ErrorExamplePage";
import UnauthorizedPage from "../common/pages/UnauthorizedPage";
import ForbiddenPage from "../common/pages/ForbiddenPage";
import DeletedPostPage from "../common/pages/DeletedPostPage";
import RouterErrorPage from "../common/pages/RouterErrorPage";

const routes = [
  {
    path: "/",
    Component: LandingPage,
  },
  {
    path: "/report-form",
    Component: ReportFormPage,
  },
  {
    path: "/login",
    loader: () => redirect("/users/login"),
  },
  {
    path: "/main",
    Component: MainIndexWrapper,
  },
  { path: "/oauth2/callback", Component: OAuthCallbackPage },
  { path: "/payment/success", Component: PaymentSuccessPage },
  { path: "/payment/fail", Component: PaymentFailPage },
  { path: "/error-example", Component: ErrorExamplePage },
  { path: "/error/401", Component: UnauthorizedPage },
  { path: "/error/403", Component: ForbiddenPage },
  { path: "/error/post-deleted", Component: DeletedPostPage },
  { path: "/users", children: userRouter() },
  { path: "/circle", children: circleRouter() },
  { path: "/board", children: boardRouter() },
  { path: "/admin", children: adminRouter() },
  { path: "/place", children: placeRouter() },
  { path: "/chat", children: chatRouter() },
  { path: "*", Component: NotFoundPage },
];

const rootRouter = createBrowserRouter(
  routes.map((route) => ({
    ...route,
    ErrorBoundary: RouterErrorPage,
  })),
);

export default rootRouter;
