import { isRouteErrorResponse, useRouteError } from "react-router-dom";
import InternalServerErrorPage from "./InternalServerErrorPage";

function extractErrorDetail(error: unknown): string | undefined {
  if (!error) return undefined;

  if (isRouteErrorResponse(error)) {
    const data = error.data as { message?: string } | string | undefined;
    if (typeof data === "string" && data.trim()) return data;
    if (data && typeof data === "object" && typeof data.message === "string") return data.message;
    return `${error.status} ${error.statusText}`;
  }

  if (error instanceof Error) return error.message;
  return undefined;
}

export default function RouterErrorPage() {
  const routeError = useRouteError();
  return <InternalServerErrorPage detail={extractErrorDetail(routeError)} />;
}
