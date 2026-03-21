import type { Metadata, Viewport } from 'next';
import Script from 'next/script';
import { Inter, Plus_Jakarta_Sans, JetBrains_Mono } from 'next/font/google';

import { AuthProvider } from './context/AuthContext';
import PremiumPopup from './components/shared/PremiumPopup';

import './lib/api-config';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const plusJakartaSans = Plus_Jakarta_Sans({ subsets: ['latin'], display: 'swap', variable: '--font-pjs' });
const jetbrainsMono = JetBrains_Mono({ subsets: ['latin'], display: 'swap', variable: '--font-jetbrains-mono' });

export const metadata: Metadata = {
  metadataBase: new URL('https://emble.in'),
  title: {
    default: "EMBLE | Top Trending Placement & Internship Platform 2026",
    template: '%s | EMBLE'
  },
  description: 'Join EMBLE, the top trending platform for computer science placement preparation and practice. Master DSA, crack technical interviews, and gain real-world experience through advanced Job Simulations and AI Mock Interviews.',
  keywords: ['Computer Science Placement Preparation', 'CS Placement Practice', 'Top Trending Placement Platform', 'Best Coding Bootcamp', 'Job Simulation Provider', 'Crack FAANG Interviews', 'DSA Preparation', 'Software Engineering Internship', 'AI Mock Interviews', 'System Design Training', 'EMBLE'],
  authors: [{ name: 'EMBLE' }],
  openGraph: {
    title: "EMBLE | Top Trending Placement & Job Simulation Platform",
    description: 'Transform your coding career with real-world simulations and AI-powered mentorship. The ultimate shortcut to high-paying tech jobs.',
    url: 'https://emble.in',
    siteName: 'EMBLE',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'EMBLE - Top Trending Placement Platform',
      },
    ],
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "EMBLE | Top Trending Placement Platform",
    description: 'Master coding interviews and land top tech jobs with EMBLE Job Simulations.',
    images: ['/twitter-image.jpg'],
  },
  icons: {
    icon: '/icon.png',
    shortcut: '/icon.png',
    apple: '/icon.png',
    other: {
      rel: 'apple-touch-icon-precomposed',
      url: '/icon.png',
    },
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-PJVP6FBM2V"
          strategy="afterInteractive"
        />
        <Script id="google-tag" strategy="afterInteractive">
          {`window.dataLayer = window.dataLayer || []; function gtag(){dataLayer.push(arguments);} gtag('js', new Date()); gtag('config', 'G-PJVP6FBM2V');`}
        </Script>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght@300;400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={`${inter.className} ${plusJakartaSans.variable} ${jetbrainsMono.variable} font-sans font-medium text-slate-800 antialiased overflow-x-hidden w-full selection:bg-brand-orange selection:text-white`} suppressHydrationWarning>
        <AuthProvider>
          {children}
          <PremiumPopup />
        </AuthProvider>
      </body>
    </html>
  );
}
