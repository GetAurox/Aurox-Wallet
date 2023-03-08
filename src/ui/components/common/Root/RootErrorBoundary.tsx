import React, { ErrorInfo, ReactNode } from "react";

import { trackSentry } from "./sentry";

import RootErrorBoundaryFallback from "./RootErrorBoundaryFallback";

export interface RootErrorBoundaryProps {
  children: ReactNode;
}

interface RootErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export default class RootErrorBoundary extends React.Component<RootErrorBoundaryProps, RootErrorBoundaryState> {
  state: RootErrorBoundaryState = { hasError: false };

  async componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    trackSentry(error, errorInfo);
    this.setState({ hasError: true, error });
  }

  static async getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  handleOnHideError = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      return (
        <RootErrorBoundaryFallback
          errorMessage={this.state.error?.message || "Sorry, something went wrong."}
          errorName={this.state.error?.name || "Error"}
          onHideError={this.handleOnHideError}
        />
      );
    }

    return this.props.children;
  }
}
