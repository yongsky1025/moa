import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { RouterProvider } from "react-router-dom";
import rootRouter from "./routes/rootRouters.ts";
import { clearTransientNavigationStateOnReload } from "./common/utils/transientNavigationState.ts";
import { useAuthStore } from "./store/authStore.ts";

clearTransientNavigationStateOnReload();
useAuthStore.getState().restoreAuth();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RouterProvider router={rootRouter} />
  </StrictMode>,
);
