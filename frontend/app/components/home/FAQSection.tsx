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
    <section className="py-16 md:py-24 bg-[#efeff1] relative overflow-hidden" id="faq">
      <JsonLd data={faqSchema} />
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24">
          
          {/* Left Side: Headings & CTA */}
          <div className="lg:col-span-5 flex flex-col items-start pt-4">
            <span className="inline-block px-4 py-1.5 rounded-none border-2 border-[#202b20] text-[13px] font-bold uppercase tracking-wider text-[#202b20] mb-6 bg-[#ffa116] shadow-[2px_2px_0_0_#202b20]">
              FAQs
            </span>
            <h2 className="text-[3rem] md:text-[4.5rem] font-[800] text-[#202b20] tracking-tighter mb-6 leading-none">
              Everything you <span className="text-white bg-[#202b20] px-3 shadow-[2px_2px_0_0_#ffa116] block sm:inline-block mt-2 sm:mt-0">need</span> to know
            </h2>
            <p className="text-lg text-[#202b20]/70 leading-relaxed mb-16 max-w-md">
              Explore helpful information about our AI interviews, practice drills, and the free tools available to supercharge your hiring potential.
            </p>

            <div className="bg-[#ffa116] p-8 border-2 border-[#202b20] shadow-[2px_2px_0_0_#202b20] rounded-none w-full max-w-sm">
              <h3 className="text-xl font-bold uppercase tracking-wide text-[#202b20] mb-6">
                Still have questions? Our team is ready to assist.
              </h3>
              <Button asChild className="rounded-none px-6 py-5 bg-white text-[#202b20] border-2 border-[#202b20] font-bold shadow-[2px_2px_0_0_#202b20] hover:shadow-[2px_2px_0_0_#202b20] hover:translate-y-[2px] hover:bg-slate-50 transition-all w-full sm:w-auto">
                <Link href="/contact">
                  Contact Support
                </Link>
              </Button>
            </div>
          </div>

          {/* Right Side: Tabs & Accordion */}
          <div className="lg:col-span-7">
            
            {/* Tabs */}
            <div className="flex flex-wrap items-center gap-2 p-1.5 mb-8 bg-white border-2 border-[#202b20] rounded-none w-max max-w-full overflow-x-auto shadow-[2px_2px_0_0_#202b20]">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => {
                    setActiveTab(cat);
                    setOpenIndex(0); // Reset accordion on tab change
                  }}
                  className={`px-5 py-2.5 rounded-none text-sm font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
                    activeTab === cat 
                      ? 'bg-[#202b20] text-white border-2 border-[#202b20]' 
                      : 'text-[#202b20]/60 hover:text-[#202b20] hover:bg-slate-50 border-2 border-transparent'
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
                      className={`border-2 rounded-none transition-all duration-300 ${isOpen ? 'bg-white border-[#202b20] shadow-[2px_2px_0_0_#202b20]' : 'bg-white/50 border-[#202b20]/20 hover:border-[#202b20] hover:shadow-[2px_2px_0_0_#ffa116]'}`}
                    >
                      <button
                        onClick={() => setOpenIndex(isOpen ? null : index)}
                        className="w-full text-left px-6 py-5 flex items-center justify-between group"
                      >
                        <span className={`text-lg font-bold pr-8 transition-colors ${isOpen ? 'text-[#202b20]' : 'text-[#202b20]/70 group-hover:text-[#202b20]'}`}>
                          {faq.q}
                        </span>
                        <div className={`p-1.5 rounded-none transition-colors border-2 flex-shrink-0 ${isOpen ? 'bg-[#ffa116] border-[#202b20] text-[#202b20] shadow-[2px_2px_0_0_#202b20]' : 'text-[#202b20]/40 group-hover:bg-[#ffa116] border-transparent group-hover:border-[#202b20] group-hover:shadow-[2px_2px_0_0_#202b20] group-hover:text-[#202b20]'}`}>
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
                            <div className="px-6 pb-6 text-[#202b20]/80 font-[500] leading-relaxed pt-2 border-t-2 border-[#202b20]/10 mt-2">
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
