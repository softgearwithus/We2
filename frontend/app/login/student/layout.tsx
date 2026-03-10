import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Student Portal Login | Access Job Simulations',
    description: 'Log in to your EMBLE student portal. Access your daily AI mentorship challenges, track your mock interviews, and view your top performer growth metrics.',
};

export default function StudentLoginLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
