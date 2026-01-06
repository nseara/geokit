import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "GeoKit - AI Visibility Scanner",
  description:
    "See how AI search engines view your content. Get instant insights and improve your visibility in ChatGPT, Perplexity, Claude, and Google AI.",
  keywords: [
    "GEO",
    "SEO",
    "AI search",
    "AI visibility",
    "ChatGPT SEO",
    "Perplexity optimization",
    "generative engine optimization",
  ],
  openGraph: {
    title: "GeoKit - AI Visibility Scanner",
    description:
      "See how AI search engines view your content. Get your AI visibility score in seconds.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "GeoKit - AI Visibility Scanner",
    description:
      "See how AI search engines view your content. Get your AI visibility score in seconds.",
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
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen`}
      >
        {children}
      </body>
    </html>
  );
}
