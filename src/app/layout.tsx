import type { Metadata, Viewport } from "next";
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
  title: "Ratefluencer AI™ — AI-Powered Influencer Intelligence Engine",
  description: "Discover, analyze, predict, rank, and match influencers based on business impact, audience authenticity, and campaign success probability rather than simple follower counts.",
  keywords: ["influencer marketing", "AI influencer finder", "fake follower audit", "campaign prediction", "influencer intelligence", "creator economy analytics"],
  authors: [{ name: "Ratefluencer AI Team" }],
  openGraph: {
    title: "Ratefluencer AI™ — AI-Powered Influencer Intelligence Engine",
    description: "Discover, analyze, predict, rank, and match influencers based on business impact, audience authenticity, and campaign success probability.",
    type: "website",
    siteName: "Ratefluencer AI",
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export const viewport: Viewport = {
  themeColor: "#050816",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full scroll-smooth antialiased`}
    >
      <body className="min-h-full flex flex-col bg-bg-deep text-[#F8FAFC]">
        {children}
      </body>
    </html>
  );
}
