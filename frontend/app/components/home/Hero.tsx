'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import HeroIDE from './HeroIDE';

interface HeroProps {
  customTitle?: string;
  customTitleSpan?: string;
  customSubDescription?: React.ReactNode | string;
}

export default function Hero({ customTitle, customTitleSpan, customSubDescription }: HeroProps = {}) {
  return (
    <section className="bg-transparent text-gray-900 min-h-[90vh] flex items-center pt-32 pb-16 overflow-hidden relative">
      <div className="container mx-auto px-6 relative z-10 w-full max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center max-w-7xl mx-auto">

          {/* ── Left — static, SSR-safe, instant paint ── */}
          <div className="relative flex flex-col items-start text-left sm:gap-6 gap-5 z-20">

            <h1 className="text-[3.5rem] sm:text-[4.5rem] lg:text-[5.5rem] font-bold leading-[1.05] tracking-tight text-black">
              {customTitle ? (
                <>
                  {customTitle}{' '}
                  <span className="font-serif italic font-normal text-gray-400 block mt-1">
                    {customTitleSpan}
                  </span>
                </>
              ) : (
                <>
                  Hire the best <br className="hidden lg:block" />
                  <span className="font-serif italic font-normal text-gray-400">software engineers.</span>
                </>
              )}
            </h1>

            <p className="max-w-[38rem] mt-2 leading-relaxed text-gray-500 text-[18px] sm:text-[22px] font-medium">
              {customSubDescription || (
                <>Connect your GitHub and documents to instantly generate assessments. Automate your screening with one-click invites, and interview based on true technical knowledge.</>
              )}
            </p>

            <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
              <Button asChild size="lg" className="rounded-full h-14 px-8 font-medium text-base transition-all duration-300 hover:scale-[1.02] bg-white text-black border border-gray-200 shadow-[0_4px_4px_rgba(0,0,0,0.04),0_0_1px_rgba(0,0,0,0.4)] hover:bg-gray-50 hover:text-black w-full sm:w-auto">
                <Link href="/register" className="flex items-center justify-center">
                  <span>Start Hiring Better</span>
                </Link>
              </Button>
              <Button asChild variant="ghost" size="lg" className="rounded-full h-14 px-8 font-medium text-base transition-all duration-300 hover:bg-black/5 hover:scale-[1.02] text-black w-full sm:w-auto">
                <Link href="/dashboard" className="flex items-center justify-center">
                  <span>Practice as Candidate</span>
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </div>
          </div>

          {/* ── Right — client-only card (no SSR, no hydration mismatch) ── */}
          <div className="relative group lg:ml-auto w-full max-w-[440px]">
            {/* Litmus-style giant gradient mesh behind the card */}
            <div className="absolute -inset-4 sm:-inset-10 translate-y-6 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-[3rem] blur-3xl opacity-50 transition-all duration-500 group-hover:opacity-70 z-0" />
            <HeroIDE />
          </div>

        </div>

        {/* Company Logos Strip */}
        <div className="w-full relative z-20 mt-24 sm:mt-32 pb-4 overflow-hidden text-center opacity-0 animate-[fadeIn_1s_ease-in-out_1s_forwards]">
          <p className="text-[12px] sm:text-[13px] text-gray-400 font-bold tracking-widest mb-8 sm:mb-10 uppercase">
            Simulating hundreds of <span className="text-gray-600">companies' interviews</span>
          </p>
          <div className="flex flex-wrap justify-center items-center gap-x-10 gap-y-10 sm:gap-x-16 max-w-5xl mx-auto opacity-50 grayscale hover:grayscale-0 transition-all duration-700">
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
