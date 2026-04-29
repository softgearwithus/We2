import React from 'react';
import { blogPosts } from '@/app/lib/blog-data';
import { articleSEOMap } from '@/app/lib/blog-seo-data';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import Link from 'next/link';
import {
    ArrowLeft, Clock, Calendar, Share2, Sparkles,
    ArrowRight, CheckCircle2, Zap, TrendingUp, MessageSquare, ChevronRight
} from 'lucide-react';
import Navbar from '@/app/components/layout/Navbar';
import Footer from '@/app/components/layout/Footer';
import Script from 'next/script';

interface Props {
    params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;
    const post = blogPosts.find(p => p.slug === slug);
    if (!post) return { title: 'Post Not Found' };

    const seoData = articleSEOMap[slug];
    const faqKeywords = seoData?.faqs.flatMap(f => f.q.split(' ').filter(w => w.length > 5)).slice(0, 8) ?? [];
    const allKeywords = Array.from(new Set([
        ...post.keywords,
        'AI interviewer', 'AI interview platform', 'Emble', 'agentic hiring',
        'technical screening AI', 'automated technical interview', ...faqKeywords
    ]));

    return {
        title: `${post.title} | Emble – AI Interview Platform`,
        description: `${post.excerpt} Learn how Emble's agentic AI interview technology helps companies hire top engineers faster and more accurately.`,
        keywords: allKeywords.join(', '),
        alternates: {
            canonical: `https://emble.in/blog/${post.slug}`,
        },
        openGraph: {
            title: `${post.title} | Emble AI Interviewer`,
            description: post.excerpt,
            type: 'article',
            url: `https://emble.in/blog/${post.slug}`,
            siteName: 'Emble – The #1 AI Interview Platform',
            publishedTime: new Date(post.date).toISOString(),
            authors: ['Emble Intelligence Team'],
            tags: allKeywords,
            images: [{
                url: `/api/og?title=${encodeURIComponent(post.title)}&subtitle=${encodeURIComponent(post.category)}`,
                width: 1200,
                height: 630,
                alt: post.title,
            }],
        },
        twitter: {
            card: 'summary_large_image',
            title: `${post.title} | Emble`,
            description: post.excerpt,
            images: [`/api/og?title=${encodeURIComponent(post.title)}&subtitle=${encodeURIComponent(post.category)}`],
        },
        robots: {
            index: true,
            follow: true,
            googleBot: {
                index: true,
                follow: true,
                'max-snippet': -1,
                'max-image-preview': 'large',
            },
        },
    };
}

export async function generateStaticParams() {
    return blogPosts.map((post) => ({ slug: post.slug }));
}

export default async function BlogPostPage({ params }: Props) {
    const { slug } = await params;
    const post = blogPosts.find(p => p.slug === slug);
    if (!post) notFound();

    const seoData = articleSEOMap[slug];

    // Related: same category first, then by shared keyword
    const relatedPosts = blogPosts
        .filter(p => p.slug !== post.slug)
        .sort((a, b) => {
            const aScore =
                (a.category === post.category ? 2 : 0) +
                a.keywords.filter(k => post.keywords.includes(k)).length;
            const bScore =
                (b.category === post.category ? 2 : 0) +
                b.keywords.filter(k => post.keywords.includes(k)).length;
            return bScore - aScore;
        })
        .slice(0, 3);

    // ─── Structured Data ───────────────────────────────────────────────────────
    const articleSchema = {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: post.title,
        description: post.excerpt,
        author: { '@type': 'Organization', name: 'Emble', url: 'https://emble.in' },
        publisher: {
            '@type': 'Organization',
            name: 'Emble',
            logo: { '@type': 'ImageObject', url: 'https://emble.in/logo.png' },
        },
        datePublished: new Date(post.date).toISOString(),
        dateModified: new Date(post.date).toISOString(),
        mainEntityOfPage: { '@type': 'WebPage', '@id': `https://emble.in/blog/${post.slug}` },
        keywords: [...post.keywords, 'AI interviewer', 'AI interview platform', 'Emble'].join(','),
        image: `https://emble.in/api/og?title=${encodeURIComponent(post.title)}&subtitle=${encodeURIComponent(post.category)}`,
    };

    const faqSchema = seoData ? {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: seoData.faqs.map(faq => ({
            '@type': 'Question',
            name: faq.q,
            acceptedAnswer: { '@type': 'Answer', text: faq.a },
        })),
    } : null;

    const breadcrumbSchema = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://emble.in' },
            { '@type': 'ListItem', position: 2, name: 'Intelligence Hub', item: 'https://emble.in/blog' },
            { '@type': 'ListItem', position: 3, name: post.title, item: `https://emble.in/blog/${post.slug}` },
        ],
    };

    return (
        <div className="min-h-screen bg-white font-sans">

            {/* ── JSON-LD Structured Data ───────────────────────────────────── */}
            <Script
                id={`schema-article-${post.slug}`}
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
            />
            {faqSchema && (
                <Script
                    id={`schema-faq-${post.slug}`}
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
                />
            )}
            <Script
                id={`schema-breadcrumb-${post.slug}`}
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
            />

            <Navbar />

            <article className="pt-32 pb-24">
                <div className="max-w-4xl mx-auto px-6">

                    {/* ── Breadcrumb ─────────────────────────────────────────── */}
                    <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-[#202b20]/35 mb-10 flex-wrap">
                        <Link href="/" className="hover:text-[#202b20] transition-colors">Home</Link>
                        <ChevronRight className="w-3 h-3" />
                        <Link href="/blog" className="hover:text-[#202b20] transition-colors">Intelligence Hub</Link>
                        <ChevronRight className="w-3 h-3" />
                        <span className="text-[#202b20]/60 truncate max-w-[220px]">{post.title}</span>
                    </nav>

                    {/* Back */}
                    <Link
                        href="/blog"
                        className="inline-flex items-center gap-2 text-[#202b20]/40 font-black uppercase text-[11px] tracking-widest hover:text-[#202b20] transition-colors mb-10 group"
                    >
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        Back to Intelligence Hub
                    </Link>

                    {/* ── Article Header ─────────────────────────────────────── */}
                    <header className="mb-14">
                        <div className="flex flex-wrap items-center gap-4 mb-8">
                            <span className="bg-[#ffa116] border-4 border-[#202b20] px-3 py-1 font-black uppercase text-[11px] tracking-widest shadow-[2px_2px_0_0_#202b20]">
                                {post.category}
                            </span>
                            <span className="flex items-center gap-1.5 text-[11px] font-black text-[#202b20]/40 uppercase tracking-widest">
                                <Clock className="w-3.5 h-3.5" /> {post.readTime}
                            </span>
                            <span className="flex items-center gap-1.5 text-[11px] font-black text-[#202b20]/40 uppercase tracking-widest">
                                <Calendar className="w-3.5 h-3.5" /> {post.date}
                            </span>
                        </div>

                        <h1 className="text-[2.1rem] md:text-[3.8rem] font-[300] tracking-tighter text-[#202b20] leading-[1.05] mb-10">
                            {post.title}
                        </h1>

                        {/* Featured-Snippet Target — Intelligence Summary */}
                        <div className="relative group mb-12">
                            <div className="absolute inset-0 bg-[#202b20] translate-x-2 translate-y-2 transition-all group-hover:translate-x-3 group-hover:translate-y-3" />
                            <div className="relative bg-[#ffa116] border-4 border-[#202b20] p-8 md:p-10">
                                <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-[#202b20]/70 mb-4">
                                    <Sparkles className="w-4 h-4 fill-[#202b20]/70" />
                                    The Short Answer
                                </div>
                                <p className="text-[17px] md:text-[21px] font-black italic text-[#202b20] leading-snug">
                                    {post.mainReason}
                                </p>
                            </div>
                        </div>

                        {/* Key Takeaways — article-specific */}
                        {seoData && (
                            <div className="bg-[#efeff1] border-2 border-[#202b20] p-8 shadow-[3px_3px_0_0_#202b20]">
                                <p className="text-[11px] font-black uppercase tracking-widest text-[#202b20]/50 mb-5">
                                    Three things worth remembering
                                </p>
                                <ul className="space-y-4">
                                    {seoData.keyTakeaways.map((point, i) => (
                                        <li key={i} className="flex items-start gap-3">
                                            <CheckCircle2 className="w-5 h-5 text-[#ffa116] flex-shrink-0 mt-0.5" strokeWidth={2.5} />
                                            <span className="text-[15px] md:text-[16px] font-[600] text-[#202b20] leading-snug">
                                                {point}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </header>

                    {/* ── Article Body ───────────────────────────────────────── */}
                    <div className="mb-16 space-y-7">
                        {post.content.map((paragraph, idx) => (
                            <p key={idx} className="text-[17px] md:text-[20px] text-[#202b20]/80 leading-relaxed font-[440]">
                                {paragraph}
                            </p>
                        ))}
                    </div>

                    {/* ── Inline CTA ─────────────────────────────────────────── */}
                    <div className="border-l-8 border-[#ffa116] bg-[#efeff1] p-8 mb-16">
                        <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-[#202b20]/50 mb-3">
                            <Zap className="w-3.5 h-3.5" />
                            See it for yourself
                        </div>
                        <p className="text-[19px] md:text-[22px] font-black text-[#202b20] mb-6 leading-tight">
                            Emble runs the deepest AI technical interview available — and it&apos;s ready when your candidates are.
                        </p>
                        <Link
                            href="/register"
                            className="inline-flex items-center gap-2 bg-[#202b20] text-white px-8 py-4 font-black uppercase tracking-widest text-[13px] shadow-[2px_2px_0_0_#ffa116] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all"
                        >
                            Try Emble Free <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>

                    {/* ── Why Emble — article-specific ────────────────────────── */}
                    {seoData && (
                        <section aria-label="Why Emble" className="mb-16">
                            <div className="border-t-4 border-[#202b20] pt-12">
                                <h2 className="text-[1.7rem] md:text-[2.4rem] font-black text-[#202b20] tracking-tighter mb-2 leading-tight">
                                    {seoData.whyEmble.headline}
                                </h2>
                                <div className="w-16 h-2 bg-[#ffa116] mb-6" />
                                <p className="text-[17px] md:text-[20px] text-[#202b20]/75 leading-relaxed mb-8 font-[440]">
                                    {seoData.whyEmble.body}
                                </p>

                                {/* Platform differentiators — concrete, not generic */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {[
                                        { stat: '80%', label: 'Faster time-to-hire vs industry median' },
                                        { stat: '94%', label: 'Reduction in first-round scheduling friction' },
                                        { stat: '$200k+', label: 'Avoided per bad senior engineering hire' },
                                    ].map(({ stat, label }) => (
                                        <div key={stat} className="bg-[#202b20] border-0 p-8 text-center shadow-[3px_3px_0_0_#ffa116]">
                                            <div className="text-[2.5rem] font-black text-[#ffa116] leading-none mb-2">{stat}</div>
                                            <div className="text-[12px] font-[600] text-white/60 uppercase tracking-widest leading-snug">{label}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </section>
                    )}

                    {/* ── FAQ Section — article-specific ─────────────────────── */}
                    {seoData && (
                        <section aria-label="Frequently Asked Questions" className="mb-16">
                            <div className="flex items-center gap-3 mb-8">
                                <MessageSquare className="w-5 h-5 text-[#ffa116]" />
                                <h2 className="text-[18px] md:text-[22px] font-black uppercase tracking-widest text-[#202b20]">
                                    Questions people actually ask
                                </h2>
                            </div>

                            <div className="space-y-0 border-t-2 border-[#202b20]">
                                {seoData.faqs.map((faq, i) => (
                                    <div key={i} className="border-b-2 border-[#202b20] py-8">
                                        <h3 className="text-[16px] md:text-[18px] font-black text-[#202b20] mb-4 leading-snug">
                                            {faq.q}
                                        </h3>
                                        <p className="text-[15px] md:text-[17px] text-[#202b20]/70 leading-relaxed font-[440]">
                                            {faq.a}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* ── Tags ───────────────────────────────────────────────── */}
                    <div className="flex flex-wrap gap-3 mb-20">
                        {[...post.keywords, 'AI Interviewer', 'Emble'].map(kw => (
                            <span
                                key={kw}
                                className="px-4 py-2 bg-[#efeff1] border-2 border-[#202b20] text-[11px] font-black uppercase tracking-widest shadow-[3px_3px_0_0_#202b20]"
                            >
                                #{kw}
                            </span>
                        ))}
                    </div>

                    {/* ── Related Articles ────────────────────────────────────── */}
                    {relatedPosts.length > 0 && (
                        <section aria-label="Related articles" className="mb-20">
                            <div className="flex items-center gap-3 mb-8">
                                <TrendingUp className="w-5 h-5" />
                                <h2 className="text-[18px] font-black uppercase tracking-widest text-[#202b20]">
                                    Keep reading
                                </h2>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {relatedPosts.map(related => (
                                    <Link
                                        key={related.slug}
                                        href={`/blog/${related.slug}`}
                                        className="group bg-[#efeff1] border-2 border-[#202b20] p-6 shadow-[2px_2px_0_0_#202b20] hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[2px_2px_0_0_#ffa116] transition-all"
                                    >
                                        <div className="text-[9px] font-black uppercase tracking-widest text-[#202b20]/40 mb-3">
                                            {related.category} · {related.readTime}
                                        </div>
                                        <h3 className="text-[15px] font-black text-[#202b20] leading-tight group-hover:text-[#ffa116] transition-colors">
                                            {related.title}
                                        </h3>
                                    </Link>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* ── Bottom CTA ─────────────────────────────────────────── */}
                    <footer className="pt-16 border-t-8 border-[#202b20]">
                        <div className="bg-[#202b20] p-10 md:p-16 flex flex-col md:flex-row items-center justify-between gap-10 shadow-[20px_20px_0_0_#ffa116]">
                            <div className="text-white max-w-xl text-center md:text-left">
                                <h2 className="text-[28px] md:text-[44px] font-black uppercase italic tracking-tighter mb-4 leading-none">
                                    Hire the top 1%<br />
                                    <span className="text-[#ffa116]">before the competition does.</span>
                                </h2>
                                <p className="text-white/55 text-[15px] md:text-[18px] font-[500] leading-relaxed">
                                    1,000+ companies run their technical hiring through Emble. Setup takes 10 minutes.
                                </p>
                            </div>
                            <div className="flex flex-col gap-4 text-center">
                                <Link href="/register" className="group relative inline-block">
                                    <div className="absolute inset-0 bg-white translate-x-2 translate-y-2 group-hover:translate-x-0 group-hover:translate-y-0 transition-all" />
                                    <div className="relative bg-[#ffa116] text-[#202b20] px-12 py-6 font-black uppercase tracking-widest text-[16px] border-4 border-[#202b20]">
                                        Start Free
                                    </div>
                                </Link>
                                <Link href="/blog" className="text-white/40 text-[11px] font-black uppercase tracking-widest hover:text-white transition-colors">
                                    ← More Articles
                                </Link>
                            </div>
                        </div>

                        <div className="mt-8 flex flex-col sm:flex-row justify-between items-center bg-[#efeff1] border-4 border-[#202b20] p-6 gap-6">
                            <button className="flex items-center gap-2 text-[11px] font-black uppercase text-[#202b20] hover:text-[#ffa116] transition-colors group">
                                <Share2 className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                                Share This Article
                            </button>
                            <Link
                                href="/blog"
                                className="text-[11px] font-black uppercase text-[#202b20] hover:bg-[#ffa116] border-2 border-transparent hover:border-[#202b20] px-3 py-1.5 transition-all"
                            >
                                Explore All Reports →
                            </Link>
                        </div>
                    </footer>

                </div>
            </article>

            <Footer />
        </div>
    );
}
