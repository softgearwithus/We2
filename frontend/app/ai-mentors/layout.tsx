import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'AI Mentors | 24/7 Technical & Career Coaching',
    description: 'Meet your 24/7 intelligent support. Our Technical Mentor and Career Coach AIs provide personalized guidance, code reviews, and mock interviews at scale.',
};

export default function AiMentorsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
