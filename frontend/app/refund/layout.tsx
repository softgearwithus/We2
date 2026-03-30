import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Refund Policy | EMBLE',
  description:
    'Review EMBLE refund terms, cancellation policy, upgrade rules, and billing conditions.',
  alternates: {
    canonical: 'https://emble.in/refund',
  },
};

export default function RefundLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
