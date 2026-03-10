import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Frequently Asked Questions',
    description: 'Find answers to common questions about EMBLE, our preparation mode, job simulations, and more.',
};

export default function FAQLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
