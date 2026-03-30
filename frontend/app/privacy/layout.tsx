import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy | EMBLE',
  description:
    'Understand how EMBLE collects, uses, and protects your data across platform features and services.',
  alternates: {
    canonical: 'https://emble.in/privacy',
  },
};

export default function PrivacyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
