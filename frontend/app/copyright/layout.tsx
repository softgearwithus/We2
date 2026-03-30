import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Copyright & Policies | EMBLE',
  description:
    'Learn about EMBLE copyright, acceptable usage, and intellectual property policies.',
  alternates: {
    canonical: 'https://emble.in/copyright',
  },
};

export default function CopyrightLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
