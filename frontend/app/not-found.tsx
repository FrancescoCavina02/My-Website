import Link from "next/link";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";

/**
 * Custom 404 Not Found Page
 *
 * This page is automatically shown when:
 * - A user navigates to a route that doesn't exist
 * - notFound() is called in a component
 *
 * See: https://nextjs.org/docs/app/api-reference/file-conventions/not-found
 */
export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-purple-900 via-black to-indigo-900">
      <Card className="max-w-2xl w-full p-8 text-center space-y-6 backdrop-blur-lg bg-gray-900/50 border-purple-500/30">
        {/* 404 Visual */}
        <div className="space-y-4">
          <h1 className="text-9xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400 bg-clip-text text-transparent">
            404
          </h1>
          <div className="flex justify-center">
            <div className="text-6xl animate-float">🌌</div>
          </div>
        </div>

        {/* Error Message */}
        <div className="space-y-2">
          <h2 className="text-3xl font-bold text-white">Lost in the Cosmos</h2>
          <p className="text-gray-400 text-lg max-w-md mx-auto">
            This page has drifted into the void. It might have been moved, deleted, or never existed
            in this universe.
          </p>
        </div>

        {/* Navigation Options */}
        <div className="space-y-4 pt-4">
          <p className="text-gray-500 text-sm">Here are some places you might want to explore:</p>

          <div className="flex gap-3 justify-center flex-wrap">
            <Link href="/">
              <Button variant="primary" className="min-w-[120px]">
                🏠 Home
              </Button>
            </Link>
            <Link href="/notes">
              <Button variant="secondary" className="min-w-[120px]">
                📚 Notes
              </Button>
            </Link>
            <Link href="/quotes">
              <Button variant="secondary" className="min-w-[120px]">
                💭 Quotes
              </Button>
            </Link>
            <Link href="/contact">
              <Button variant="outline" className="min-w-[120px]">
                ✉️ Contact
              </Button>
            </Link>
          </div>
        </div>

        {/* Search or Report */}
        <div className="pt-6 border-t border-gray-800 space-y-3">
          <p className="text-sm text-gray-500">Looking for something specific?</p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Link href="/notes">
              <Button variant="ghost" size="sm">
                🔍 Search Notes
              </Button>
            </Link>
            <Link href="/contact">
              <Button variant="ghost" size="sm">
                📧 Report Broken Link
              </Button>
            </Link>
          </div>
        </div>

        {/* Fun Fact */}
        <div className="text-xs text-gray-600 italic pt-4">
          &quot;Not all who wander are lost... but this page definitely is.&quot;
        </div>
      </Card>
    </div>
  );
}

/**
 * Metadata for the 404 page
 */
export const metadata = {
  title: "404 - Page Not Found | Francesco Cavina",
  description: "The page you're looking for doesn't exist.",
};
