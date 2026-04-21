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

// Generate static parameters for all 'services' pages
export function generateStaticParams() {
  const servicesPages = getAllSeoPages().filter(page => page.category === 'services');
  return servicesPages.map((page) => ({
    slug: page.slug,
  }));
}

// Generate unique SEO Metadata per page
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const pageData = getSeoPageBySlug(slug);
  
  if (!pageData || pageData.category !== 'services') {
    return { title: 'Not Found' };
  }

  return {
    title: `${pageData.title} | Emble`,
    description: pageData.subDescription,
    alternates: {
      canonical: `https://emble.in/services/${slug}`,
    },
    openGraph: {
      title: pageData.title,
      description: pageData.subDescription,
      url: `https://emble.in/services/${slug}`,
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

export default async function ServicesLandingPage({ params }: Props) {
  const { slug } = await params;
  const pageData = getSeoPageBySlug(slug);

  if (!pageData || pageData.category !== 'services') {
    notFound();
  }

  return (
    <div className="min-h-screen bg-background text-foreground font-sans antialiased selection:bg-primary/20 selection:text-foreground relative overflow-x-hidden">
      {/* Absolute Dotted Background Layer */}
      <div
        className="absolute inset-0 pointer-events-none z-0"
        style={{
          backgroundImage: 'radial-gradient(hsl(var(--primary) / 0.15) 1px, transparent 1px)',
          backgroundSize: '24px 24px'
        }}
      />
      <Navbar />

      <div className="relative z-10 flex flex-col">
        {/* Pass the dynamic custom SEO text to the Hero */}
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
