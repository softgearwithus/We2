import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, CheckCircle2, FileText, Sparkles, Layout, Code2 } from 'lucide-react';
import CursorGrainyCloud from '../../components/shared/CursorGrainyCloud';

export const metadata: Metadata = {
    title: 'Free AI Resume Builder for Software Engineers | Emble',
    description: 'Craft ATS-friendly resumes optimized for tech roles in minutes. Our AI Resume Builder analyzes job descriptions and generates highly optimized content to land you more interviews.',
    alternates: {
        canonical: 'https://emble.in/tools/ai-resume-builder',
    },
    openGraph: {
        title: 'Free AI Resume Builder for Software Engineers | Emble',
        description: 'Craft ATS-friendly resumes optimized for tech roles in minutes.',
        url: 'https://emble.in/tools/ai-resume-builder',
        siteName: 'Emble',
        type: 'website',
    }
};

const gridStyle = {
    backgroundImage: 'linear-gradient(to right,#202b2012 1px,transparent 1px),linear-gradient(to bottom,#202b2012 1px,transparent 1px)',
    backgroundSize: '40px 40px',
} as const;

// JSON-LD Schema
const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Emble AI Resume Builder',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Any',
    offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
    },
    description: 'An AI-powered resume builder specifically designed for software engineers to bypass ATS systems and land technical interviews.',
};

export default function AIResumeBuilderPage() {
    return (
        <div className="min-h-screen bg-transparent text-foreground font-sans antialiased relative overflow-hidden">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            
            <CursorGrainyCloud />
            <div className="absolute inset-0 pointer-events-none z-0" style={gridStyle} />

            <div className="relative z-10 max-w-7xl mx-auto px-6 pt-32 pb-24 text-center">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-600 text-xs font-bold uppercase tracking-widest mb-8">
                    <Sparkles size={14} />
                    100% Free for Developers
                </div>
                
                <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 max-w-4xl mx-auto leading-tight">
                    Build an <span className="text-primary">ATS-Beating</span> Resume in Minutes
                </h1>
                
                <p className="text-xl text-foreground/70 mb-10 max-w-2xl mx-auto">
                    Stop getting auto-rejected. Our AI Resume Builder is specifically calibrated for software engineering roles, optimizing your keywords to pass any Applicant Tracking System.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Link href="/register?redirect=/dashboard/resume" className="h-14 px-8 rounded-full bg-primary text-primary-foreground font-bold text-lg flex items-center gap-2 hover:bg-primary/90 hover:scale-105 transition-all shadow-lg shadow-primary/20">
                        Start Building Free <ArrowRight size={20} />
                    </Link>
                </div>
            </div>

            <div className="relative z-10 max-w-5xl mx-auto px-6 pb-32">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="bg-card/60 backdrop-blur-sm border border-border rounded-[24px] p-8">
                        <div className="p-3 bg-blue-500/10 text-blue-500 rounded-2xl w-fit mb-6">
                            <Code2 size={24} />
                        </div>
                        <h3 className="text-xl font-bold mb-3">Tech-Specific Keywords</h3>
                        <p className="text-foreground/70">Our AI suggests the exact frameworks, languages, and tools recruiters are scanning for based on real job descriptions.</p>
                    </div>
                    <div className="bg-card/60 backdrop-blur-sm border border-border rounded-[24px] p-8">
                        <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-2xl w-fit mb-6">
                            <Layout size={24} />
                        </div>
                        <h3 className="text-xl font-bold mb-3">Industry Standard Formats</h3>
                        <p className="text-foreground/70">Choose from battle-tested templates used by engineers hired at FAANG and top-tier startups.</p>
                    </div>
                    <div className="bg-card/60 backdrop-blur-sm border border-border rounded-[24px] p-8">
                        <div className="p-3 bg-purple-500/10 text-purple-500 rounded-2xl w-fit mb-6">
                            <CheckCircle2 size={24} />
                        </div>
                        <h3 className="text-xl font-bold mb-3">Real-time ATS Scoring</h3>
                        <p className="text-foreground/70">Get instant feedback on your resume's readability, keyword density, and overall ATS compatibility before you apply.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
