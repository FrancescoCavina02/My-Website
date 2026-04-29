import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { BackendPinger } from "@/components/BackendPinger";

export const metadata: Metadata = {
  title: "Francesco Cavina — AI & Data Engineering",
  description:
    "Personal portfolio of Francesco Cavina, ex Econometrics and Data Science student at VU Amsterdam. Projects in RAG, NLP, LLMs, and full-stack development.",
  keywords: ["AI", "Machine Learning", "NLP", "RAG", "Next.js", "FastAPI", "Portfolio"],
  authors: [{ name: "Francesco Cavina" }],
  openGraph: {
    title: "Francesco Cavina — AI & Data Engineering",
    description: "AI projects, personal notes, and software engineering work.",
    url: "https://francesco-cavina.netlify.app/",
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
        <BackendPinger />
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
