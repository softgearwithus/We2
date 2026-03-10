import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Curriculum | Full Stack & DSA Placement Syllabus',
    description: 'Explore India\'s first integrated AI placement ecosystem hub. Our curriculum combines industry-exact DSA training with deep-tech job simulations to make you Day-1 ready.',
};

export default function CurriculumLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
