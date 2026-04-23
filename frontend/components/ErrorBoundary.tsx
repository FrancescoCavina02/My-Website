"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import Button from "./ui/Button";
import Card from "./ui/Card";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * Error Boundary Component
 *
 * Catches JavaScript errors anywhere in the child component tree,
 * logs those errors, and displays a fallback UI instead of crashing.
 *
 * Usage:
 *   <ErrorBoundary>
 *     <YourComponent />
 *   </ErrorBoundary>
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error details for debugging
    console.error("Error Boundary caught an error:", error, errorInfo);

    // Update state with error details
    this.setState({
      error,
      errorInfo,
    });

    // Optional: Send error to logging service
    // logErrorToService(error, errorInfo);
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default fallback UI
      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-purple-900 via-black to-indigo-900">
          <Card className="max-w-2xl w-full p-8 text-center space-y-6">
            <div className="space-y-2">
              <h1 className="text-4xl font-bold text-red-400">
                ⚠️ Something Went Wrong
              </h1>
              <p className="text-gray-400 text-lg">
                We encountered an unexpected error. Don&apos;t worry, this has been logged.
              </p>
            </div>

            {process.env.NODE_ENV === "development" && this.state.error && (
              <div className="bg-gray-900 border border-gray-700 rounded-lg p-4 text-left overflow-auto max-h-64">
                <p className="text-red-400 font-mono text-sm font-semibold mb-2">
                  Error: {this.state.error.toString()}
                </p>
                {this.state.errorInfo && (
                  <pre className="text-gray-500 text-xs whitespace-pre-wrap">
                    {this.state.errorInfo.componentStack}
                  </pre>
                )}
              </div>
            )}

            <div className="flex gap-4 justify-center flex-wrap">
              <Button onClick={this.handleReset} variant="primary">
                Try Again
              </Button>
              <Button
                onClick={() => window.location.reload()}
                variant="secondary"
              >
                Reload Page
              </Button>
              <Button onClick={() => (window.location.href = "/")} variant="outline">
                Go Home
              </Button>
            </div>

            <p className="text-sm text-gray-500">
              If this problem persists, please{" "}
              <a href="/contact" className="text-purple-400 hover:text-purple-300 underline">
                contact me
              </a>
              .
            </p>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Functional Error Fallback Component
 *
 * Can be used as a custom fallback for ErrorBoundary
 */
export function ErrorFallback({
  error,
  resetError,
}: {
  error: Error;
  resetError: () => void;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="max-w-md w-full p-6 text-center space-y-4">
        <h2 className="text-2xl font-bold text-red-400">Error Occurred</h2>
        <p className="text-gray-400">{error.message}</p>
        <Button onClick={resetError}>Try Again</Button>
      </Card>
    </div>
  );
}
