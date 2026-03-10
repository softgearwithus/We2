import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'How It Works | Mentorship & Job Simulation Process',
    description: 'Discover the EMBLE methodology. Learn how our 4-step process takes you from mastering fundamentals to cracking AI interviews and launching your tech career.',
};

export default function HowItWorksLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
