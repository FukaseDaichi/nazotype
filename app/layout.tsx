import type { Metadata, Viewport } from "next";
import { Noto_Serif_JP, Shippori_Mincho, Space_Mono } from "next/font/google";

import {
  SITE_DESCRIPTION,
  SITE_KEYWORDS,
  SITE_NAME,
  SITE_THEME_COLOR,
  getMetadataBase,
} from "@/lib/site";

import "./globals.css";

const serifFont = Shippori_Mincho({
  variable: "--font-serif-family",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
  preload: false,
});

const serifFallback = Noto_Serif_JP({
  variable: "--font-serif-fallback",
  subsets: ["latin"],
  weight: ["300", "400", "700"],
  display: "swap",
  preload: false,
});

const monoFont = Space_Mono({
  variable: "--font-mono-family",
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
  preload: false,
});

export const metadata: Metadata = {
  metadataBase: getMetadataBase(),
  applicationName: SITE_NAME,
  manifest: "/manifest.webmanifest",
  title: {
    default: SITE_NAME,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  keywords: [...SITE_KEYWORDS],
  icons: {
    icon: [{ url: "/favicon.ico", sizes: "any" }],
    shortcut: ["/favicon.ico"],
    apple: [{ url: "/apple-icon.png", sizes: "180x180", type: "image/png" }],
  },
  verification: {
    google: "PL4mFXSOkoRJNiMOigMC2VmfdZ3X3nOMzuvZmMPmbmc",
  },
  formatDetection: {
    email: false,
    telephone: false,
    address: false,
  },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    locale: "ja_JP",
    url: "/",
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    images: ["/main-ogp.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    images: ["/main-ogp.png"],
  },
};

export const viewport: Viewport = {
  themeColor: SITE_THEME_COLOR,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ja"
      className={`${serifFont.variable} ${serifFallback.variable} ${monoFont.variable} h-full antialiased`}
    >
      <body className="min-h-full">{children}</body>
    </html>
  );
}
