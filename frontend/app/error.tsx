"use client";

import { useEffect } from "react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";

/**
 * Global Error Page
 *
 * This component is automatically used by Next.js when an error occurs
 * during rendering in app directory routes.
 *
 * See: https://nextjs.org/docs/app/api-reference/file-conventions/error
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to console in development
    console.error("Global error boundary caught:", error);

    // Optional: Log to error tracking service (e.g., Sentry)
    // logErrorToService(error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-purple-900 via-black to-indigo-900">
      <Card className="max-w-2xl w-full p-8 text-center space-y-6 backdrop-blur-lg bg-gray-900/50 border-purple-500/30">
        {/* Error Icon */}
        <div className="flex justify-center">
          <div className="w-20 h-20 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center">
            <span className="text-4xl">⚠️</span>
          </div>
        </div>

        {/* Error Message */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-red-400 to-pink-400 bg-clip-text text-transparent">
            Something Went Wrong
          </h1>
          <p className="text-gray-400 text-lg">
            An unexpected error occurred while rendering this page.
          </p>
        </div>

        {/* Error Details (Development Only) */}
        {process.env.NODE_ENV === "development" && (
          <div className="bg-gray-950/50 border border-gray-700 rounded-lg p-4 text-left">
            <p className="text-red-400 font-mono text-sm font-semibold mb-2">
              {error.message}
            </p>
            {error.digest && (
              <p className="text-gray-500 text-xs">Error Digest: {error.digest}</p>
            )}
            {error.stack && (
              <details className="mt-3">
                <summary className="text-gray-400 text-xs cursor-pointer hover:text-gray-300">
                  View Stack Trace
                </summary>
                <pre className="text-gray-600 text-xs mt-2 overflow-auto max-h-40 whitespace-pre-wrap">
                  {error.stack}
                </pre>
              </details>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-4 justify-center flex-wrap">
          <Button
            onClick={reset}
            variant="primary"
            className="min-w-[120px]"
          >
            Try Again
          </Button>
          <Button
            onClick={() => window.location.reload()}
            variant="secondary"
            className="min-w-[120px]"
          >
            Reload Page
          </Button>
          <Button
            onClick={() => (window.location.href = "/")}
            variant="outline"
            className="min-w-[120px]"
          >
            Go Home
          </Button>
        </div>

        {/* Help Text */}
        <div className="text-sm text-gray-500 pt-4 border-t border-gray-800">
          <p>
            If this error persists, please{" "}
            <a
              href="/contact"
              className="text-purple-400 hover:text-purple-300 underline transition-colors"
            >
              contact me
            </a>{" "}
            with details about what you were trying to do.
          </p>
        </div>
      </Card>
    </div>
  );
}
