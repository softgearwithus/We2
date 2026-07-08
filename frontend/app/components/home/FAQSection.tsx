"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, Mail } from 'lucide-react';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { JsonLd } from '../seo/JsonLd';

const faqsData = {
  "General": [
    {
      q: "What is Emble?",
      a: "Emble is an integrated AI preparation ecosystem designed to help you master real-time technical interviews and access industrial-grade preparation tools."
    },
    {
      q: "Is it completely free?",
      a: "Yes! Our core tools, including the extensive company-wise Test Series, Project Labs, and predictive Market Alerts, are 100% free for lifetime access."
    },
    {
      q: "Does it work on all job boards?",
      a: "Our predictive Market Radar monitors thousands of job boards, insider pipelines, and company career pages to bring you the most relevant alerts instantly."
    },
    {
      q: "Is my data secure?",
      a: "Absolutely. We employ enterprise-grade encryption to ensure your resume data, performance metrics, and personal information are completely secure and private."
    },
    {
      q: "What platforms is it available on?",
      a: "Emble is a cloud-based web application accessible directly from your browser on any desktop or tablet device, ensuring you can prepare anywhere."
    }
  ],
  "AI Interview": [
    {
      q: "How does the AI evaluate my interview?",
      a: "Our agent uses advanced models to analyze your technical accuracy, communication clarity, and confidence in real-time, providing immediate actionable feedback."
    },
    {
      q: "Are the interview questions realistic?",
      a: "Yes, we source our questions dynamically from real, recent MNC interviews to ensure you're practicing exactly what you'll face in the actual tech loops."
    },
    {
      q: "Can I choose the difficulty level?",
      a: "Absolutely. You can customize the AI agent to act as a friendly technical recruiter, or scale it up to a rigorous, stress-testing senior engineer."
    },
    {
      q: "Does the AI support system design rounds?",
      a: "Yes! The AI can conduct both coding and system design interviews, evaluating your architectural choices, trade-offs, and scalability considerations."
    },
    {
      q: "Will I get hints if I get stuck?",
      a: "During the interview, the AI acts just like a real interviewer. It won't give you the answer directly but will offer progressive hints to guide your logic."
    },
    {
      q: "What if I lose connection during an interview?",
      a: "Your interview progress is auto-saved in real-time. You can seamlessly resume from where you left off once your connection is restored."
    }
  ]
};

type Category = keyof typeof faqsData;
const categories = Object.keys(faqsData) as Category[];

export default function FAQSection() {
  const [activeTab, setActiveTab] = useState<Category>("General");
  const [openIndex, setOpenIndex] = useState<number | null>(0); // First item open by default

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": Object.values(faqsData).flat().map((faq) => ({
      "@type": "Question",
      "name": faq.q,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.a
      }
    }))
  };

  return (
    <section className="py-16 md:py-24 bg-transparent relative overflow-hidden" id="faq">
      <JsonLd data={faqSchema} />
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24">
          
          {/* Left Side: Headings & CTA */}
          <div className="lg:col-span-5 flex flex-col items-start pt-4">
            <span className="inline-block px-3 py-1 rounded-full text-[12px] font-[600] uppercase tracking-widest border border-gray-200 text-gray-600 mb-6 bg-white/50 backdrop-blur-sm shadow-sm">
              FAQs
            </span>
            <h2 className="text-[3rem] md:text-[4rem] font-[800] text-black tracking-tighter mb-4 leading-[1.05]">
              Everything you <br className="hidden sm:block" />
              <span className="font-serif italic font-normal text-gray-400">need to know.</span>
            </h2>
            <p className="text-[18px] text-gray-500 font-[400] leading-relaxed mb-12 max-w-md">
              Explore helpful information about our AI interviews, practice drills, and the free tools available to supercharge your hiring potential.
            </p>

            <div className="bg-slate-50/50 p-8 md:p-10 border border-gray-100 shadow-sm rounded-3xl w-full max-w-md">
              <h3 className="text-[18px] font-[600] text-gray-900 mb-6 leading-snug">
                Still have questions? <br /> Our team is ready to assist.
              </h3>
              <Button asChild className="rounded-full px-8 h-12 bg-gray-900 text-white font-[500] text-[15px] hover:scale-[1.02] hover:bg-gray-800 shadow-md transition-all w-full sm:w-auto">
                <Link href="/contact">
                  Contact Support
                </Link>
              </Button>
            </div>
          </div>

          {/* Right Side: Tabs & Accordion */}
          <div className="lg:col-span-7">
            
            {/* Tabs */}
            <div className="flex flex-wrap items-center gap-2 p-1.5 mb-8 bg-slate-50/80 border border-gray-100 rounded-2xl w-max max-w-full overflow-x-auto shadow-sm backdrop-blur-sm">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => {
                    setActiveTab(cat);
                    setOpenIndex(0); // Reset accordion on tab change
                  }}
                  className={`px-5 py-2 rounded-xl text-[14px] font-[600] tracking-wide transition-all whitespace-nowrap ${
                    activeTab === cat
                      ? 'bg-white text-gray-900 shadow-sm border border-gray-200/50'
                      : 'text-gray-500 hover:text-gray-900 hover:bg-white/50 border border-transparent'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Accordion */}
            <div className="space-y-4">
              <AnimatePresence mode="popLayout">
                {faqsData[activeTab].map((faq, index) => {
                  const isOpen = openIndex === index;
                  
                  return (
                      <motion.div
                      key={faq.q}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2, delay: index * 0.05 }}
                      className={`border rounded-3xl transition-all duration-300 overflow-hidden ${isOpen ? 'bg-white border-gray-200 shadow-md' : 'bg-white/40 border-gray-100 hover:border-gray-200 hover:bg-white hover:shadow-sm'}`}
                    >
                      <button
                        onClick={() => setOpenIndex(isOpen ? null : index)}
                        className="w-full text-left px-6 py-6 flex items-center justify-between group"
                      >
                        <span className={`text-[16px] font-[600] pr-8 transition-colors ${isOpen ? 'text-gray-900' : 'text-gray-700 group-hover:text-gray-900'}`}>
                          {faq.q}
                        </span>
                        <div className={`p-2 rounded-full transition-colors shrink-0 ${isOpen ? 'bg-gray-100 text-gray-900' : 'text-gray-400 group-hover:bg-gray-50 group-hover:text-gray-900'}`}>
                          <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                            <ChevronDown className="w-5 h-5 text-current" />
                          </motion.div>
                        </div>
                      </button>
                      
                      <AnimatePresence>
                        {isOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3, ease: 'easeInOut' }}
                            className="overflow-hidden"
                          >
                            <div className="px-6 pb-6 text-gray-500 font-[400] text-[15px] leading-relaxed pt-2 border-t border-gray-50 mt-2">
                              {faq.a}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
