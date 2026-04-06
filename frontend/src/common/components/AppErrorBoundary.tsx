import { Component, type ErrorInfo, type ReactNode } from "react";
import InternalServerErrorPage from "../pages/InternalServerErrorPage";

type AppErrorBoundaryProps = {
  children: ReactNode;
};

type AppErrorBoundaryState = {
  hasError: boolean;
  message?: string;
};

export default class AppErrorBoundary extends Component<AppErrorBoundaryProps, AppErrorBoundaryState> {
  state: AppErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(error: Error): AppErrorBoundaryState {
    return { hasError: true, message: error.message };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("[AppErrorBoundary] uncaught error", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <InternalServerErrorPage detail={this.state.message} />;
    }
    return this.props.children;
  }
}
