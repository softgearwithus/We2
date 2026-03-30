import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Documentation | EMBLE',
  description:
    'Explore EMBLE docs, platform guides, interview preparation playbooks, and simulation workflows.',
  alternates: {
    canonical: 'https://emble.in/docs',
  },
};

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
