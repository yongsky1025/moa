import { createBrowserRouter } from "react-router-dom";
import MainIndex from "../components/common/MainIndex";
import LandingPage from "../pages/LandingPage";

const rootRouter = createBrowserRouter([
  {
    path: "/",
    Component: LandingPage,
  },
  {
    path: "/main",
    Component: MainIndex,
  },
  { path: "/user" },
  { path: "/circle" },
  { path: "/board" },
  { path: "/admin" },
  { path: "/place" },
]);

export default rootRouter;
