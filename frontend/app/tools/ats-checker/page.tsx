import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, CheckCircle2, ShieldAlert, Target, Zap } from 'lucide-react';
import CursorGrainyCloud from '../../components/shared/CursorGrainyCloud';

export const metadata: Metadata = {
    title: 'Free ATS Resume Checker & Scanner | Emble',
    description: 'Instantly check your resume against any job description with our free ATS Resume Scanner. Get actionable feedback on missing keywords and formatting issues.',
    alternates: {
        canonical: 'https://emble.in/tools/ats-checker',
    },
    openGraph: {
        title: 'Free ATS Resume Checker & Scanner | Emble',
        description: 'Instantly check your resume against any job description with our free ATS Resume Scanner.',
        url: 'https://emble.in/tools/ats-checker',
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
    name: 'Emble ATS Resume Checker',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Any',
    offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
    },
    description: 'A free ATS (Applicant Tracking System) resume checker that analyzes technical resumes against job descriptions to provide optimization suggestions.',
};

export default function ATSCheckerPage() {
    return (
        <div className="min-h-screen bg-transparent text-foreground font-sans antialiased relative overflow-hidden">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            
            <CursorGrainyCloud />
            <div className="absolute inset-0 pointer-events-none z-0" style={gridStyle} />

            <div className="relative z-10 max-w-7xl mx-auto px-6 pt-32 pb-24 text-center">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 text-xs font-bold uppercase tracking-widest mb-8">
                    <Target size={14} />
                    Boost Your Callback Rate
                </div>
                
                <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 max-w-4xl mx-auto leading-tight">
                    Is your resume <span className="text-emerald-500">ATS-Friendly?</span>
                </h1>
                
                <p className="text-xl text-foreground/70 mb-10 max-w-2xl mx-auto">
                    Over 75% of resumes are rejected by Applicant Tracking Systems before a human ever sees them. Upload your resume and let our AI scanner give you an instant score and actionable feedback.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Link href="/register?redirect=/dashboard/resume?view=scanner" className="h-14 px-8 rounded-full bg-emerald-500 text-white font-bold text-lg flex items-center gap-2 hover:bg-emerald-600 hover:scale-105 transition-all shadow-lg shadow-emerald-500/20">
                        Scan Resume Now <ArrowRight size={20} />
                    </Link>
                </div>
            </div>

            <div className="relative z-10 max-w-5xl mx-auto px-6 pb-32">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="bg-card/60 backdrop-blur-sm border border-border rounded-[24px] p-8">
                        <div className="p-3 bg-red-500/10 text-red-500 rounded-2xl w-fit mb-6">
                            <ShieldAlert size={24} />
                        </div>
                        <h3 className="text-xl font-bold mb-3">Formatting Checks</h3>
                        <p className="text-foreground/70">Ensure your layout, fonts, and bullet points aren't confusing the ATS parser and causing auto-rejections.</p>
                    </div>
                    <div className="bg-card/60 backdrop-blur-sm border border-border rounded-[24px] p-8">
                        <div className="p-3 bg-blue-500/10 text-blue-500 rounded-2xl w-fit mb-6">
                            <CheckCircle2 size={24} />
                        </div>
                        <h3 className="text-xl font-bold mb-3">Keyword Matching</h3>
                        <p className="text-foreground/70">Compare your resume against any job description to instantly find missing hard skills and keywords.</p>
                    </div>
                    <div className="bg-card/60 backdrop-blur-sm border border-border rounded-[24px] p-8">
                        <div className="p-3 bg-amber-500/10 text-amber-500 rounded-2xl w-fit mb-6">
                            <Zap size={24} />
                        </div>
                        <h3 className="text-xl font-bold mb-3">Actionable Insights</h3>
                        <p className="text-foreground/70">Get a clear, line-by-line breakdown of exactly what you need to change to boost your ATS score.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
