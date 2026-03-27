import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Pricing Plans | EMBLE Pro Membership',
    description: 'Upgrade from the free plan to EMBLE Pro Membership for full interview simulations, deeper analytics, and premium placement preparation.',
};

export default function PricingLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
