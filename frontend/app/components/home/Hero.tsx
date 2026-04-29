'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import HeroCard from './HeroCard';

interface HeroProps {
  customTitle?: string;
  customTitleSpan?: string;
  customSubDescription?: React.ReactNode | string;
}

export default function Hero({ customTitle, customTitleSpan, customSubDescription }: HeroProps = {}) {
  return (
    <section className="bg-transparent text-[#202b20] min-h-[85vh] flex items-center pt-32 pb-8 md:pt-40 lg:pt-48 overflow-hidden relative">
      <div className="container mx-auto px-6 relative z-10 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center max-w-7xl mx-auto">

          {/* ── Left — static, SSR-safe, instant paint ── */}
          <div className="relative flex flex-col items-start text-left sm:gap-8 gap-6 z-20">
            <h1 className="text-[3rem] sm:text-[4rem] md:text-[5rem] lg:text-[5.5rem] font-[300] leading-[1.05] tracking-tighter text-[#202b20]">
              {customTitle ? (
                <>
                  {customTitle}{' '}
                  <span className="inline-block bg-[#ffa116] text-[#202b20] px-4 py-1 sm:py-2 border-2 border-[#202b20] shadow-[2px_2px_0_0_#202b20] mt-2 tracking-tight">
                    {customTitleSpan}
                  </span>
                </>
              ) : (
                <>
                  Intelligent layer <br className="hidden lg:block" />
                  for{' '}
                  <span className="inline-block bg-[#ffa116] text-[#202b20] px-4 py-1 sm:py-2 border-2 border-[#202b20] shadow-[2px_2px_0_0_#202b20] mt-2 sm:mt-4 lg:ml-2 tracking-tight">
                    interviews.
                  </span>
                </>
              )}
            </h1>

            <p className="max-w-[42rem] mt-2 leading-relaxed text-[#202b20]/80 text-[18px] sm:text-[20px] lg:text-[22px] font-[400]">
              {customSubDescription || (
                <>Experience the most powerful intelligent Interviewer. Automate technical screening, get deep candidate insights, and hire top talent effortlessly.</>
              )}
            </p>

            <div className="mt-6 sm:mt-8 flex flex-col items-start gap-4 w-full sm:w-auto">
              <div className="flex flex-col sm:flex-row w-full gap-4">
                <Button asChild size="lg" className="relative h-14 sm:h-16 px-8 sm:px-10 rounded-none font-bold text-base sm:text-lg transition-transform duration-200 hover:-translate-y-1 active:translate-y-[2px] active:shadow-none group bg-[#ffa116] text-[#202b20] shadow-[2px_2px_0_0_#202b20] hover:bg-[#ff9100] border-2 border-[#202b20] w-full sm:w-auto">
                  <Link href="/register" className="relative z-10 flex items-center justify-center w-full">
                    <span className="relative z-10">Start Hiring Better</span>
                    <ArrowRight className="relative z-10 w-5 h-5 ml-2 transition-transform duration-300 group-hover:translate-x-1" strokeWidth={2.5} />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="relative h-14 sm:h-16 px-8 sm:px-10 rounded-none font-bold text-base sm:text-lg transition-transform duration-200 hover:-translate-y-1 active:translate-y-[2px] active:shadow-none group border-2 border-[#202b20] bg-white text-[#202b20] hover:bg-[#202b20] hover:text-white shadow-[2px_2px_0_0_#202b20] w-full sm:w-auto">
                  <Link href="/dashboard" className="relative z-10 flex items-center justify-center w-full">
                    <span className="relative z-10">Practice as Candidate</span>
                  </Link>
                </Button>
              </div>
              <p className="text-[13px] font-medium text-slate-500 pl-4 flex items-center gap-2 mt-2">
                <span className="flex h-2 w-2 rounded-full bg-[#556B2F]" /> Includes eO evaluate &amp; exact simulations
              </p>
            </div>
          </div>

          {/* ── Right — client-only card (no SSR, no hydration mismatch) ── */}
          <HeroCard />

        </div>

        {/* Company Logos Strip */}
        <div className="w-full relative z-20 mt-20 sm:mt-28 pb-4 overflow-hidden text-center opacity-0 animate-[fadeIn_1s_ease-in-out_1s_forwards]">
          <p className="text-[14px] sm:text-[15px] text-[#202b20]/50 font-medium tracking-wide mb-8 sm:mb-10">
            Simulating hundreds of <span className="font-bold text-[#202b20]/70">companies&apos; interviews</span>
          </p>
          <div className="flex flex-wrap justify-center items-center gap-x-10 gap-y-10 sm:gap-x-16 max-w-5xl mx-auto opacity-70 grayscale hover:grayscale-0 transition-all duration-700">
            {['accenture.png', 'adobe.png', 'capegemini.png', 'cisco.jpg', 'cognizant.png',
              'oracle.png', 'salesforce.png', 'samsung.png', 'tcs.png', 'zoho.png'].map((logo, idx) => (
              <img
                key={idx}
                src={`/companies/${logo}`}
                alt={logo.split('.')[0]}
                loading="lazy"
                decoding="async"
                width={120}
                height={36}
                className="h-6 sm:h-8 lg:h-9 w-auto object-contain mix-blend-multiply opacity-70 hover:opacity-100 transition-opacity duration-300"
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
