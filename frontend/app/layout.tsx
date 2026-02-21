import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from './context/AuthContext';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: {
    default: 'EMBLE | Placement Mode + Job Simulation — The #1 Career Readiness Platform',
    template: '%s | EMBLE'
  },
  description: 'Placement Mode for placement prep. Job Simulation for industry experience. Master DSA, practice with AI interviewers, and gain real-world software development experience.',
  keywords: ['EMBLE', 'Placement Mode', 'Job Simulation', 'DSA Preparation', 'Coding Interview', 'System Design', 'Industry Simulation', 'Mock Interviews', 'Full Stack Development'],
  openGraph: {
    title: 'EMBLE | Bridge the Gap Between Education and Industry',
    description: 'Placement Mode for placement prep. Job Simulation for industry experience. Transform your coding career with real-world simulations and AI-powered mentorship.',
    url: 'https://emble.in',
    siteName: 'EMBLE',
    images: [
      {
        url: 'https://emble.in/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'EMBLE Open Graph Image',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'EMBLE | Placement Mode + Job Simulation — Career Readiness Platform',
    description: 'Master coding interviews and real-world dev skills.',
    images: ['https://emble.in/twitter-image.jpg'],
  },
};

import PremiumPopup from './components/shared/PremiumPopup';

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
        <AuthProvider>
          {children}
          <PremiumPopup />
        </AuthProvider>
      </body>
    </html>
  );
}
