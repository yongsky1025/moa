import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";
import "./index.css";
import { RouterProvider } from "react-router-dom";
import rootRouter from "./routes/rootRouters.ts";
import { queryClient } from "./api/queryClient.ts";
import { clearTransientNavigationStateOnReload } from "./common/utils/transientNavigationState.ts";
import { useAuthStore } from "./store/authStore.ts";

clearTransientNavigationStateOnReload();
useAuthStore.getState().restoreAuth();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={rootRouter} />
    </QueryClientProvider>
  </StrictMode>,
);
