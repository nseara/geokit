import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});

const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
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
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen`}
      >
        {children}
      </body>
    </html>
  );
}
