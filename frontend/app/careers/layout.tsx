import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Careers',
    description: 'Join the EMBLE team and help build the future of engineering education and placement.',
};

export default function CareersLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
