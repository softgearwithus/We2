import type { Metadata, Viewport } from 'next';
import Script from 'next/script';
import { Inter, JetBrains_Mono } from 'next/font/google';

import { AuthProvider } from './context/AuthContext';
import PremiumPopupHost from './components/shared/PremiumPopupHost';
import { JsonLd } from './components/seo/JsonLd';

import './lib/api-config';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sans',
  weight: ['300', '400', '500', '600', '700']
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-mono'
});

export const metadata: Metadata = {
  metadataBase: new URL('https://emble.in'),
  title: {
    default: "Emble | The #1 AI Interview Platform for Hiring & Preparation", // Kept trending title per user request
    template: '%s | Emble'
  },
  description: 'Emble is the #1 AI interview platform. Run automated technical screening to instantly evaluate software engineers, or practice with realistic voice AI mock interviews to crack your next big coding round.',
  keywords: ['#1 AI Interview Platform', 'AI Mock Interviews', 'Automated Technical Screening', 'Developer Evaluation Tool', 'Hire Engineers Fast', 'Crack Technical Interviews', 'System Design Simulator', 'Coding Interview Practice', 'Emble'],
  authors: [{ name: 'EMBLE' }],
  openGraph: {
    title: "Emble | The #1 AI Interview Platform for Hiring & Preparation",
    description: 'The definitive AI interview platform for engineering teams to evaluate talent at scale, and for developers to master technical interviews through hyper-realistic AI simulation.',
    url: 'https://emble.in',
    siteName: 'Emble',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Emble - The #1 AI Interview Platform',
      },
    ],
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "Emble | #1 AI Interview Platform",
    description: 'The #1 AI interview platform. Evaluate tech talent instantly or practice for your next big FAANG interview.',
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
      <body
        className={`${inter.className} ${inter.variable} ${jetbrainsMono.variable} font-sans text-slate-800 antialiased overflow-x-hidden w-full selection:bg-brand-orange selection:text-white`}
        style={{ background: 'linear-gradient(170deg,#e8edf5 0%,#f0f2f5 40%,#f5f5f3 100%)' }}
        suppressHydrationWarning
      >
        <AuthProvider>
          <JsonLd data={{
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "name": "Emble",
            "operatingSystem": "Web Application",
            "applicationCategory": "BusinessApplication",
            "description": "The #1 AI interview platform for engineering teams to evaluate talent, and for developers to master technical interviews through AI simulation.",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD"
            },
            "aggregateRating": {
              "@type": "AggregateRating",
              "ratingValue": "4.9",
              "ratingCount": "184"
            }
          }} />
          {children}
          <PremiumPopupHost />
        </AuthProvider>
      </body>
    </html>
  );
}
