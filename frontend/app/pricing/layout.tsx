import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Pricing Plans | Standard & Pro Memberships',
    description: 'Compare EMBLE Standard and Pro plans. Find the perfect path for your career goals, whether you need light practice or intense interview preparation with our MNC hiring network.',
};

export default function PricingLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
