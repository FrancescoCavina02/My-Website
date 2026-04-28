import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { ErrorBoundary } from "@/components/ErrorBoundary";

export const metadata: Metadata = {
  title: "Francesco Cavina — AI & Software Engineering",
  description:
    "Personal portfolio of Francesco Cavina, Computer Science student at [FILL IN University], MSc AI applicant at UvA. Projects in RAG, NLP, LLMs, and full-stack development.",
  keywords: ["AI", "Machine Learning", "NLP", "RAG", "Next.js", "FastAPI", "Portfolio"],
  authors: [{ name: "Francesco Cavina" }],
  openGraph: {
    title: "Francesco Cavina — AI & Software Engineering",
    description: "AI projects, personal notes, and software engineering work.",
    url: "https://[FILL IN DOMAIN].com",
    siteName: "Francesco Cavina",
    type: "website",
    locale: "en_US",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className="min-h-screen flex flex-col antialiased text-white bg-[#0e0e0f]"
        suppressHydrationWarning
      >
        <ErrorBoundary>
          <Header />
          <main id="main-content" className="flex-grow" role="main">
            {children}
          </main>
          <Footer />
        </ErrorBoundary>
      </body>
    </html>
  );
}
