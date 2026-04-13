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
import ProgrammaticFAQ from '@/app/components/home/ProgrammaticFAQ';
import CompareOthers from '@/app/components/home/CompareOthers';
import { JsonLd } from '@/app/components/seo/JsonLd';

interface Props {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  const altPages = getAllSeoPages().filter(page => page.category === 'alternative');
  return altPages.map((page) => ({
    slug: page.slug,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const pageData = getSeoPageBySlug(slug);
  
  if (!pageData || pageData.category !== 'alternative') {
    return { title: 'Not Found' };
  }

  return {
    title: `${pageData.title} | Emble`,
    description: pageData.subDescription,
    alternates: {
      canonical: `https://emble.in/alternative/${slug}`,
    },
    openGraph: {
      title: pageData.title,
      description: pageData.subDescription,
      url: `https://emble.in/alternative/${slug}`,
      siteName: 'Emble',
      type: 'website',
    },
  };
}

export default async function AlternativeSEOPage({ params }: Props) {
  const { slug } = await params;
  const pageData = getSeoPageBySlug(slug);

  if (!pageData || pageData.category !== 'alternative') {
    notFound();
  }

  const rawName = slug.split('-')[0];
  const competitorName = rawName.charAt(0).toUpperCase() + rawName.slice(1);

  const faqs = [
    {
      question: `Is Emble a good alternative to ${competitorName}?`,
      answer: `Yes, Emble is considered the best modern alternative to ${competitorName} because it replaces static tests with an advanced Conversational AI that evaluates true technical reasoning, providing deep Interview Intelligence.`
    },
    {
      question: `Does Emble cost less than ${competitorName}?`,
      answer: `Emble offers a much more scalable and cost-effective pricing model compared to ${competitorName}'s enterprise plans, giving you access to real-time voice AI interviews for a fraction of the cost per candidate.`
    },
    {
      question: `Can I use Emble for automated screening instead of ${competitorName}?`,
      answer: `Absolutely. While ${competitorName} provides coding environments, Emble's automated screening actively talks to the candidate, assesses their architecture choices, and provides you with a definitive hire signal without requiring your engineers to conduct the first round.`
    }
  ];

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans antialiased selection:bg-primary/20 selection:text-foreground relative overflow-x-hidden">
      <JsonLd data={faqSchema} />
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
        <ProgrammaticFAQ competitorName={competitorName} faqs={faqs} />
        <CompareOthers currentSlug={slug} />
      </div>

      <AboutUs />
      <Footer />
    </div>
  );
}
