import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import { ClerkProvider } from '@clerk/nextjs';
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/next";
import HelpBubble from '@/components/HelpBubble';
import "./globals.css";

const inter = Inter({ 
  subsets: ["latin"],
  variable: '--font-inter',
  display: 'swap',
});

const poppins = Poppins({ 
  weight: ['600', '700'],
  subsets: ["latin"],
  variable: '--font-poppins',
  display: 'swap',
});

export const metadata: Metadata = {
  title: "Me2You - Tiny Websites as Gifts",
  description: "Create fun, interactive mini websites as gifts for anyone. Pick a template, customize it, share a link.",
  icons: {
    icon: '/favicon.png',
    apple: '/favicon.png',
  },
  openGraph: {
    title: 'Me2You - Tiny Websites as Gifts',
    description: 'Create fun, interactive mini websites as gifts for anyone.',
    images: ['/logo.png'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider afterSignOutUrl="/">
      <html lang="en">
        <head>
          <link rel="preconnect" href="https://utfs.io" crossOrigin="anonymous" />
          <link rel="dns-prefetch" href="https://utfs.io" />
        </head>
        <body className={`${inter.variable} ${poppins.variable} antialiased`}>
          {children}
          <HelpBubble />
          <SpeedInsights />
          <Analytics />
        </body>
      </html>
    </ClerkProvider>
  );
}
