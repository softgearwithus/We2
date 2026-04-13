import type { Metadata, Viewport } from 'next';
import Script from 'next/script';
import { Plus_Jakarta_Sans, JetBrains_Mono } from 'next/font/google';

import { AuthProvider } from './context/AuthContext';
import PremiumPopup from './components/shared/PremiumPopup';

import './lib/api-config';
import './globals.css';

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sans'
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-mono'
});

export const metadata: Metadata = {
  metadataBase: new URL('https://emble.in'),
  title: {
    default: "Emble | The #1 AI Interview Platform for Hiring & Preparation",
    template: '%s | Emble'
  },
  description: 'Experience the #1 AI interview platform. Emble helps top companies evaluate engineers instantly with eO, while giving candidates realistic AI mock interviews to crack technical rounds.',
  keywords: ['#1 AI Interview Platform', 'AI Mock Interviews', 'Technical Interview Evaluation', 'Developer Evaluation Tool', 'Hire Engineers Fast', 'Crack Technical Interviews', 'eO Evaluation', 'Coding Interview Practice', 'Emble'],
  authors: [{ name: 'EMBLE' }],
  openGraph: {
    title: "Emble | #1 AI Interview Platform",
    description: 'The #1 AI interview platform for engineering teams to evaluate talent, and for developers to master technical interviews through AI simulation.',
    url: 'https://emble.in',
    siteName: 'Emble',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Emble - #1 AI Interview Platform',
      },
    ],
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "Emble | #1 AI Interview Platform",
    description: 'The #1 AI interview platform. Evaluate talent instantly or practice for your next big tech interview.',
    images: ['/twitter-image.jpg'],
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
      <body className={`${plusJakartaSans.className} ${plusJakartaSans.variable} ${jetbrainsMono.variable} font-sans font-medium text-slate-800 antialiased overflow-x-hidden w-full selection:bg-brand-orange selection:text-white`} suppressHydrationWarning>
        <AuthProvider>
          {children}
          <PremiumPopup />
        </AuthProvider>
      </body>
    </html>
  );
}
