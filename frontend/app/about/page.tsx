import { Metadata } from 'next';
import ClientAboutPage from './ClientAboutPage';

export const metadata: Metadata = {
    title: 'About Us',
    description: 'We founded EMBLE with a simple yet ambitious goal: to ensure that every talented individual has a direct pathway to their dream career.',
    alternates: {
        canonical: 'https://emble.in/about',
    },
};

export default function AboutPage() {
    return <ClientAboutPage />;
}
