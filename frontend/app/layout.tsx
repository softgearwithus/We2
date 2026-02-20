import type { Metadata } from 'next';
import { Inter, Outfit } from 'next/font/google';
import './globals.css';
import { AuthProvider } from './context/AuthContext';
import GlobalAiAssistant from './components/ai/GlobalAiAssistant';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const outfit = Outfit({ subsets: ['latin'], variable: '--font-outfit' });

export const metadata: Metadata = {
  title: 'Emble | Career Accelerator — Learn. Build. Work.',
  description: 'The unified career accelerator. Master DSA in the Bootcamp, then gain real-world experience in the Job Simulation.',
  keywords: ['Emble', 'Career Accelerator', 'Job Simulation', 'DSA Preparation', 'Coding Interview', 'Full Stack Development', 'Work Experience'],
  openGraph: {
    title: 'Emble | The Career Accelerator',
    description: 'Master coding interviews and real-world dev skills on one platform.',
    url: 'https://emble.in',
    siteName: 'Emble',
    images: [
      {
        url: 'https://emble.in/og-image.jpg',
        width: 1200,
        height: 630,
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Emble | Career Accelerator',
    description: 'From Learning to Leading. The complete path to your dream engineering career.',
    images: ['https://emble.in/twitter-image.jpg'],
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
      <body className={`${inter.variable} ${outfit.variable} font-sans antialiased text-slate-900 bg-white`} suppressHydrationWarning>
        <AuthProvider>
          {children}
          <GlobalAiAssistant />
        </AuthProvider>
      </body>
    </html>
  );
}
