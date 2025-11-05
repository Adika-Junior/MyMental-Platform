import type { Metadata } from "next";
import { Poppins, Inter } from "next/font/google";
import "./globals.css";

const poppins = Poppins({ subsets: ["latin"], weight: ["400","600","700"], variable: "--font-poppins" });
const inter = Inter({ subsets: ["latin"], weight: ["400","600","700"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "MYMENTAL - Your Mental Health Companion",
  description: "AI-powered mental health chatbot providing 24/7 support and guidance",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${poppins.variable} ${inter.variable}`}>
      <head>
        <link rel="stylesheet" href="https://use.fontawesome.com/releases/v6.4.0/css/all.css" />
      </head>
      <body className="antialiased" style={{ fontFamily: "var(--font-inter), system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial" }}>
        {/* Skip link for keyboard users */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:bg-white focus:text-black focus:p-3 focus:rounded"
        >
          Skip to main content
        </a>
        <main id="main-content" role="main" tabIndex={-1}>
          {children}
        </main>
      </body>
    </html>
  );
}
