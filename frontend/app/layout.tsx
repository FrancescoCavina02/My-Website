import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Francesco Cavina | Software Engineer & AI Enthusiast",
  description:
    "Personal portfolio showcasing projects, education, and insights on AI, software engineering, and technology.",
  keywords: [
    "Francesco Cavina",
    "Software Engineer",
    "AI",
    "Machine Learning",
    "Portfolio",
    "UvA",
  ],
  authors: [{ name: "Francesco Cavina" }],
  openGraph: {
    title: "Francesco Cavina | Software Engineer & AI Enthusiast",
    description:
      "Personal portfolio showcasing projects, education, and insights.",
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
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="cosmic-bg min-h-screen flex flex-col" suppressHydrationWarning>
        <Header />
        <main className="flex-grow">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
