"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, Mail } from 'lucide-react';
import Link from 'next/link';

const faqsData = {
  "General": [
    {
      q: "What is Emble?",
      a: "Emble is an integrated AI placement ecosystem designed to help you master real-time technical interviews and access industrial-grade preparation tools."
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

  return (
    <section className="py-24 md:py-32 bg-background relative overflow-hidden" id="faq">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24">
          
          {/* Left Side: Headings & CTA */}
          <div className="lg:col-span-5 flex flex-col items-start pt-4">
            <span className="inline-block px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border border-primary/20 text-primary mb-6 bg-primary/5">
              FAQs
            </span>
            <h2 className="text-4xl md:text-5xl lg:text-5xl font-medium text-foreground tracking-tight mb-6 leading-tight">
              Everything you need to know
            </h2>
            <p className="text-lg text-foreground/70 leading-relaxed mb-16 max-w-md">
              Explore helpful information about our AI interviews, practice drills, and the free tools available to supercharge your hiring potential.
            </p>

            <div className="bg-secondary/50 p-8 border border-border rounded-2xl w-full max-w-sm">
              <h3 className="text-xl font-medium text-foreground mb-6">
                Still have questions? Our team is ready to assist.
              </h3>
              <Link 
                href="/contact"
                className="flex items-center justify-center gap-2 w-full h-12 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary/90 transition-colors"
              >
                <Mail className="w-5 h-5" />
                Get in Touch
              </Link>
            </div>
          </div>

          {/* Right Side: Tabs & Accordion */}
          <div className="lg:col-span-7">
            
            {/* Tabs */}
            <div className="flex flex-wrap items-center gap-2 p-1.5 mb-8 bg-secondary/50 border border-border rounded-xl w-max max-w-full overflow-x-auto">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => {
                    setActiveTab(cat);
                    setOpenIndex(0); // Reset accordion on tab change
                  }}
                  className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                    activeTab === cat 
                      ? 'bg-background border border-border text-foreground shadow-sm' 
                      : 'text-foreground/60 hover:text-foreground hover:bg-secondary'
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
                      className={`border rounded-2xl transition-colors duration-300 ${isOpen ? 'bg-secondary/30 border-primary/20 shadow-sm' : 'bg-transparent border-border hover:border-foreground/20'}`}
                    >
                      <button
                        onClick={() => setOpenIndex(isOpen ? null : index)}
                        className="w-full text-left px-6 py-5 flex items-center justify-between group"
                      >
                        <span className={`text-lg font-medium pr-8 transition-colors ${isOpen ? 'text-primary' : 'text-foreground/80 group-hover:text-foreground'}`}>
                          {faq.q}
                        </span>
                        <div className={`p-1.5 rounded-full transition-colors flex-shrink-0 ${isOpen ? 'bg-primary/10 text-primary' : 'text-foreground/40 group-hover:bg-secondary group-hover:text-foreground/80'}`}>
                          <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                            <ChevronDown className="w-5 h-5" />
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
                            <div className="px-6 pb-6 text-foreground/70 leading-relaxed pt-2 border-t border-border mt-2">
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
