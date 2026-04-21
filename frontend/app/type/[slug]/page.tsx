import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getSeoPageBySlug, getAllSeoPages } from '@/app/lib/seo-pages';
import Navbar from '@/app/components/layout/Navbar';
import Hero from '@/app/components/home/Hero';
import ProblemSection from '@/app/components/home/ProblemSection';
import TargetUsers from '@/app/components/home/TargetUsers';
import HowItWorks from '@/app/components/home/HowItWorks';
import ComparisonSection from '@/app/components/home/ComparisonSection';
import Testimonials from '@/app/components/home/Testimonials';
import AboutUs from '@/app/components/home/AboutUs';
import Footer from '@/app/components/layout/Footer';

interface Props {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  const typePages = getAllSeoPages().filter(page => page.category === 'type');
  return typePages.map((page) => ({
    slug: page.slug,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const pageData = getSeoPageBySlug(slug);
  
  if (!pageData || pageData.category !== 'type') {
    return { title: 'Not Found' };
  }

  return {
    title: `${pageData.title} | Emble`,
    description: pageData.subDescription,
    alternates: {
      canonical: `https://emble.in/type/${slug}`,
    },
    openGraph: {
      title: pageData.title,
      description: pageData.subDescription,
      url: `https://emble.in/type/${slug}`,
      siteName: 'Emble',
      images: [
        {
          url: `/api/og?slug=${slug}`,
          width: 1200,
          height: 630,
          alt: pageData.title,
        },
      ],
      type: 'website',
    },
  };
}

export default async function TypeSEOPage({ params }: Props) {
  const { slug } = await params;
  const pageData = getSeoPageBySlug(slug);

  if (!pageData || pageData.category !== 'type') {
    notFound();
  }

  return (
    <div className="min-h-screen bg-background text-foreground font-sans antialiased selection:bg-primary/20 selection:text-foreground relative overflow-x-hidden">
      <div
        className="absolute inset-0 pointer-events-none z-0"
        style={{
          backgroundImage: 'radial-gradient(hsl(var(--primary) / 0.15) 1px, transparent 1px)',
          backgroundSize: '24px 24px'
        }}
      />
      <Navbar />

      <div className="relative z-10 flex flex-col">
        <Hero 
          customTitle={pageData.heroHeadline} 
          customTitleSpan={pageData.heroHeadlineSpan} 
          customSubDescription={pageData.subDescription} 
        />
        <ProblemSection />
        <HowItWorks />
        <TargetUsers />
        <ComparisonSection />
        <Testimonials />
      </div>

      <AboutUs />
      <Footer />
    </div>
  );
}
