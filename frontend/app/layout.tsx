import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from './context/AuthContext';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: {
    default: 'We2 | Prep0 + We2Hub — The #1 Career Readiness Platform',
    template: '%s | We2'
  },
  description: 'Prep0 for placement prep. We2Hub for industry experience. Master DSA, practice with AI interviewers, and gain real-world software development experience.',
  keywords: ['We2', 'Prep0', 'We2Hub', 'DSA Preparation', 'Coding Interview', 'System Design', 'Industry Simulation', 'Mock Interviews', 'Full Stack Development'],
  openGraph: {
    title: 'We2 | Bridge the Gap Between Education and Industry',
    description: 'Prep0 for placement prep. We2Hub for industry experience. Transform your coding career with real-world simulations and AI-powered mentorship.',
    url: 'https://we2.in',
    siteName: 'We2',
    images: [
      {
        url: 'https://we2.in/og-image.jpg',
        width: 1200,
        height: 630,
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'We2 | Prep0 + We2Hub — Career Readiness Platform',
    description: 'Master coding interviews and real-world dev skills.',
    images: ['https://we2.in/twitter-image.jpg'],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght@300;400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={inter.className} suppressHydrationWarning>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
