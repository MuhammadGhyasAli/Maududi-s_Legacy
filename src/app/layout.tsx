import type { Metadata, Viewport } from "next";
import { Inter, Playfair_Display, Noto_Nastaliq_Urdu, Amiri } from "next/font/google";
import "./globals.css";
import MainShell from "../components/MainShell";
import { AuthProvider } from "../contexts/AuthContext";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  preload: true,
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
  preload: true,
});

const notoNastaliq = Noto_Nastaliq_Urdu({
  subsets: ["arabic"],
  variable: "--font-nastaliq",
  display: "swap",
});

const amiri = Amiri({
  weight: ["400", "700"],
  subsets: ["arabic"],
  variable: "--font-amiri",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL('https://maududi-legacy.vercel.app'),
  title: {
    default: "Maududi's Legacy",
    template: "%s | Maududi's Legacy",
  },
  description: "Explore the works of Sayyid Abul A'la Maududi with AI-powered chat. A digital archive preserving and providing intelligent access to his complete writings.",
  keywords: ['Maududi', 'Islamic scholarship', 'Tafheem ul Quran', 'Islamic books', 'AI chat', 'Urdu books'],
  authors: [{ name: "Maududi's Legacy Project" }],
  openGraph: {
    title: "Maududi's Legacy",
    description: "Explore the works of Sayyid Abul A'la Maududi with AI-powered chat.",
    type: 'website',
    locale: 'en_US',
    siteName: "Maududi's Legacy",
    url: 'https://maududi-legacy.vercel.app',
  },
  twitter: {
    card: 'summary_large_image',
    title: "Maududi's Legacy",
    description: "Explore the works of Sayyid Abul A'la Maududi with AI-powered chat.",
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: { icon: '/favicon.ico' },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/logo.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="mobile-web-app-capable" content="yes" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {process.env.NODE_ENV === 'development' && (
          <>
            <link rel="preconnect" href="http://localhost:8000" />
            <link rel="dns-prefetch" href="http://localhost:8000" />
          </>
        )}
      </head>
      <body className={`${inter.variable} ${playfair.variable} ${notoNastaliq.variable} ${amiri.variable}`} suppressHydrationWarning>
        <AuthProvider>
          <a href="#main-content" className="skip-link">
            Skip to main content
          </a>
          <MainShell>{children}</MainShell>
        </AuthProvider>
      </body>
    </html>
  );
}

