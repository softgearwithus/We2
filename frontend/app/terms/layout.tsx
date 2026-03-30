import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service | EMBLE',
  description:
    'Read EMBLE terms, eligibility, account responsibilities, payment terms, and acceptable usage conditions.',
  alternates: {
    canonical: 'https://emble.in/terms',
  },
};

export default function TermsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
