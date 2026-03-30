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

const rootRouter = createBrowserRouter([
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
  { path: "/users", children: userRouter() },
  { path: "/circle", children: circleRouter() },
  { path: "/board", children: boardRouter() },
  { path: "/admin", children: adminRouter() },
  { path: "/place", children: placeRouter() },
  { path: "/chat", children: chatRouter() },
]);

export default rootRouter;
