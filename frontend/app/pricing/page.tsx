"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Suspense } from "react";
import { Check, Loader2, Calendar, ShieldCheck, RotateCcw } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "motion/react";
import Navbar from "@/app/components/layout/Navbar";
import Footer from "@/app/components/layout/Footer";
import { useAuth } from "@/app/context/AuthContext";
import { cn } from "@/app/lib/utils";
import TalkToSalesModal from "@/app/components/shared/TalkToSalesModal";
import PricingCard from "@/app/components/pricing/PricingCard";

const PRO_PLAN_ID = "pro_1m";
const SUBSCRIBE_INTENT_PATH = `/pricing?intent=subscribe&plan=${PRO_PLAN_ID}`;

declare global {
  interface Window {
    Razorpay: any;
  }
}

type PricingContext = {
  countryCode: string | null;
  isIndia: boolean;
  currency: "INR" | "USD";
  checkoutCurrency: "INR";
  upgradesEnabled: boolean;
  pro: {
    monthly: {
      inr: number;
      usd: number;
    };
  };
};

function PricingPageContent() {
  const { user, isLoading: authLoading, updateUser } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [pricingContext, setPricingContext] = useState<PricingContext | null>(null);
  const [isPricingLoading, setIsPricingLoading] = useState(true);
  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);
  const autoTriggeredCheckoutRef = useRef(false);
  const [selectedCurrency, setSelectedCurrency] = useState<"INR" | "USD">("USD");
  const [isSalesModalOpen, setIsSalesModalOpen] = useState(false);

  const freeFeatures = [
    "Limited Company & Subject Test Series",
    "Limited Resume Builder Templates",
    "Limited Access to Project Labs",
    "Basic Email Support",
  ];

  const proFeatures = [
    "Everything in Free, Unlocked",
    "Eo (AI audio and video interview)",
    "Unlimited Test Series & Mocks",
    "Unlimited Resume Builder & Analytics",
    "Unlimited Project Labs",
    "1-on-1 Industry Leader Guidance",
    "24/7 Priority Support",
  ];

  const enterpriseFeatures = [
    "Customized interview per candidate",
    "Bulk minutes & custom volume",
    "Advanced evaluation segments",
    "White-labeling options",
    "Dedicated account manager",
    "Custom API integrations",
  ];

  useEffect(() => {
    // Attempt timezone guess to set default currency locally
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
      if (tz.toLowerCase().includes("kolkata") || tz.toLowerCase().includes("calcutta") || tz.toLowerCase().includes("india")) {
        setSelectedCurrency("INR");
      }
    } catch(e) {}
  }, []);

  useEffect(() => {
    const loadPricingContext = async () => {
      try {
        setIsPricingLoading(true);
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/public/pricing-context`, {
          cache: "no-store",
        });
        if (!response.ok) {
          throw new Error("Failed to fetch pricing context");
        }
        const data = await response.json();
        setPricingContext(data);
      } catch {
        setPricingContext(null);
      } finally {
        setIsPricingLoading(false);
      }
    };

    void loadPricingContext();
  }, []);

  const normalizedPlan = (user?.subscriptionPlan || "").toLowerCase();
  const isProMember =
    normalizedPlan === "pro" ||
    normalizedPlan === "we2_max" ||
    normalizedPlan.includes("pro");
  const hasActiveSubscription =
    user?.subscriptionStatus === "active" &&
    (!user.subscriptionEndDate || new Date(user.subscriptionEndDate).getTime() > Date.now());
  const isActiveProMember = isProMember && hasActiveSubscription;

  const displayedPrice = useMemo(() => {
    if (!pricingContext) {
      if (selectedCurrency === "INR") {
        return { amount: "799", symbol: "₹", period: "/mo" };
      }
      return { amount: "10.00", symbol: "$", period: "/mo" };
    }

    if (selectedCurrency === "INR") {
      return {
        amount: String(pricingContext.pro.monthly.inr),
        symbol: "₹",
        period: "/mo",
      };
    }

    return {
      amount: pricingContext.pro.monthly.usd.toFixed(2),
      symbol: "$",
      period: "/mo",
    };
  }, [pricingContext, selectedCurrency]);

  const subscribeCtaLabel = useMemo(() => {
    if (authLoading || isPricingLoading) return "Checking...";
    if (isActiveProMember) return "Pro Member (Active)";
    if (!pricingContext?.upgradesEnabled) return "Temporarily Unavailable";
    if (!user) return "Reserve your spot \u2192";
    return "Reserve your spot \u2192";
  }, [authLoading, isPricingLoading, isActiveProMember, pricingContext?.upgradesEnabled, user]);

  const canSubscribe =
    !authLoading &&
    !isPricingLoading &&
    !isActiveProMember &&
    !isCheckoutLoading;

  const loadRazorpayScript = useCallback(async () => {
    if (typeof window !== "undefined" && window.Razorpay) {
      return true;
    }

    return new Promise<boolean>((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  }, []);

  const redirectToAuthForCheckout = useCallback(() => {
    router.push(`/login/student?next=${encodeURIComponent(SUBSCRIBE_INTENT_PATH)}`);
  }, [router]);

  const handleSubscribe = useCallback(async () => {
    if (authLoading || isPricingLoading) {
      return;
    }

    if (isActiveProMember) {
      return;
    }

    if (!pricingContext?.upgradesEnabled) {
      alert("Subscriptions are temporarily disabled. Please try again shortly.");
      return;
    }

    const { getActiveToken } = await import("@/app/lib/auth-storage");
    const token = getActiveToken();

    if (!user || !token) {
      redirectToAuthForCheckout();
      return;
    }

    setIsCheckoutLoading(true);
    try {
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        alert("Unable to load payment gateway. Please check your network and try again.");
        return;
      }

      const orderResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/upgrade-order`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ plan: PRO_PLAN_ID }),
      });

      if (!orderResponse.ok) {
        if (orderResponse.status === 401) {
          redirectToAuthForCheckout();
          return;
        }
        const message = await orderResponse.text();
        throw new Error(message || "Failed to initialize checkout.");
      }

      const orderData = await orderResponse.json();

      const payment = new window.Razorpay({
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: orderData.currency || "INR",
        name: "EMBLE",
        description: "EMBLE Pro Membership",
        order_id: orderData.orderId,
        prefill: {
          name: user.firstName ? `${user.firstName}${user.lastName ? ` ${user.lastName}` : ""}` : "Student",
          email: user.email || "",
        },
        theme: {
          color: "#3b82f6",
        },
        modal: {
          ondismiss: () => {
            setIsCheckoutLoading(false);
          },
        },
        handler: async (response: any) => {
          try {
            const upgradeResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/upgrade`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                plan: PRO_PLAN_ID,
                paymentId: response.razorpay_payment_id,
                orderId: response.razorpay_order_id,
                signature: response.razorpay_signature,
              }),
            });

            if (!upgradeResponse.ok) {
              const errorText = await upgradeResponse.text();
              throw new Error(errorText || "Payment succeeded but subscription update failed.");
            }

            const updatedUser = await upgradeResponse.json();
            updateUser(updatedUser);
            alert("Welcome to EMBLE Pro Member!");
            router.push("/dashboard/settings");
          } catch (error) {
            const message = error instanceof Error ? error.message : "Subscription update failed.";
            alert(message);
          } finally {
            setIsCheckoutLoading(false);
          }
        },
      });

      payment.open();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Checkout failed.";
      alert(message);
      setIsCheckoutLoading(false);
    }
  }, [
    authLoading,
    isPricingLoading,
    isActiveProMember,
    pricingContext?.upgradesEnabled,
    user,
    redirectToAuthForCheckout,
    loadRazorpayScript,
    updateUser,
    router,
  ]);

  useEffect(() => {
    const intent = searchParams.get("intent");
    const plan = searchParams.get("plan");
    const shouldAutoCheckout = intent === "subscribe" && plan === PRO_PLAN_ID;

    if (!shouldAutoCheckout || autoTriggeredCheckoutRef.current) {
      return;
    }

    if (authLoading || isPricingLoading || !user || isActiveProMember || !pricingContext?.upgradesEnabled) {
      return;
    }

    autoTriggeredCheckoutRef.current = true;
    void handleSubscribe();
  }, [
    searchParams,
    authLoading,
    isPricingLoading,
    user,
    isActiveProMember,
    pricingContext?.upgradesEnabled,
    handleSubscribe,
  ]);

  return (
    <div className="min-h-screen bg-[#efeff1] text-[#202b20] font-sans antialiased selection:bg-[#ffa116]/30 selection:text-[#202b20] flex flex-col relative pt-24">
      <Navbar />
      
      <main className="flex-1 flex flex-col items-center pt-16 pb-24 px-6 z-10 w-full">
        <div className="max-w-[1300px] w-full mx-auto grid grid-cols-1 xl:grid-cols-[minmax(350px,400px)_1fr] gap-12 xl:gap-16 items-start">
          
          {/* LEFT COLUMN: Copy & Features */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col items-start text-left gap-6 w-full sticky top-32"
          >
            <span className="px-4 py-1.5 rounded-none border-2 border-[#202b20] text-[13px] font-bold bg-[#ffa116] shadow-[4px_4px_0px_0px_#202b20] uppercase tracking-wider text-[#202b20]">
              Our Pricing
            </span>
            <h1 className="text-[3rem] md:text-[4.5rem] lg:text-[5rem] font-[800] tracking-tighter text-[#202b20] leading-[1.1]">
              Personalized plans <br className="hidden md:block"/> and pricing
            </h1>
            <p className="text-lg text-[#202b20]/80 font-[500] leading-relaxed">
              Flexible pricing plans designed to fit your needs, whether you're a candidate or building a hiring team.
            </p>
            
            <div className="flex flex-col gap-4 mt-4">
              {[
                { icon: <Calendar className="w-[18px] h-[18px]" />, text: "Lifetime free access for core tools" },
                { icon: <ShieldCheck className="w-[18px] h-[18px]" />, text: "No hidden fees or conditions" },
                { icon: <RotateCcw className="w-[18px] h-[18px]" />, text: "Cancel anytime securely" },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 text-[#202b20] font-medium text-[15px]">
                   <div className="text-[#202b20] bg-[#ffa116] p-1 border-2 border-[#202b20] shadow-[2px_2px_0px_0px_#202b20] -rotate-3">{item.icon}</div>
                   <span>{item.text}</span>
                </div>
              ))}
            </div>

            <div className="mt-8 pt-8 w-full border-t border-slate-100 flex flex-col items-start">
               <p className="text-[13px] text-slate-500 font-medium mb-4">Trusted by secure Payments service</p>
               <div className="flex items-center gap-6 opacity-80 mix-blend-multiply">
                  <div className="flex items-center gap-2 font-[1000] text-[#02042b] tracking-widest text-[17px]">
                    <svg viewBox="0 0 100 100" className="w-[20px] h-[20px] fill-[#338be2]">
                       <path d="M0,50 C0,22.3857625 22.3857625,0 50,0 C77.6142375,0 100,22.3857625 100,50 C100,77.6142375 77.6142375,100 50,100 C22.3857625,100 0,77.6142375 0,50 Z" opacity="0.1"/>
                       <path d="M72.5,35 L42.5,85 L35,85 L47.5,45 L25,45 L40,20 L62.5,20 L55,35 L72.5,35 Z" fill="#3395ff" />
                    </svg>
                    RAZORPAY
                  </div>
               </div>
            </div>
          </motion.div>

          {/* RIGHT COLUMN: CARDS GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch w-full relative pt-8">
             
             {/* FREE PLAN (Standard Card) */}
             <div className="w-full rounded-none border-2 border-[#202b20] bg-white p-6 md:p-8 flex flex-col shadow-[4px_4px_0px_0px_#202b20] h-full">
                <div className="flex flex-col min-h-[140px]">
                  <h3 className="text-[20px] font-bold text-[#202b20] uppercase tracking-wide">Free</h3>
                  <div className="flex items-baseline gap-1 mt-auto pb-4">
                    <span className="text-[40px] md:text-5xl font-[800] tracking-tighter text-[#202b20]">$0</span>
                    <span className="text-[#202b20]/60 font-medium text-[15px]">/mo</span>
                  </div>
                  <p className="text-[13px] text-slate-500 min-h-[40px]">
                    Perfect for students and individuals just getting started.
                  </p>
                </div>
                
                <div className="h-px w-full bg-slate-100 mb-6 mt-4" />
                
                <div className="mb-4 text-[13px] font-bold uppercase tracking-wider text-[#202b20]/50">What's Included</div>
                <div className="flex-1 space-y-4 mb-8">
                  {freeFeatures.map((feature, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <Check className="w-[18px] h-[18px] text-[#202b20] shrink-0 mt-[1px]" strokeWidth={3} />
                      <span className="text-[14px] text-[#202b20] font-medium leading-tight">{feature}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-auto">
                  <button 
                    onClick={() => router.push(user ? "/dashboard" : "/register/student")}
                    className="w-full py-3.5 rounded-none border-2 border-[#202b20] bg-white text-[#202b20] text-[14px] font-bold uppercase tracking-wider text-center shadow-[4px_4px_0px_0px_#202b20] hover:shadow-[2px_2px_0px_0px_#202b20] hover:translate-y-[2px] transition-all"
                  >
                    {user ? "Go to Dashboard \u2192" : "Reserve your spot \u2192"}
                  </button>
                </div>
             </div>
             
             {/* PRO PLAN (Featured Card with Blue Header) */}
             <div className="w-full rounded-none bg-[#ffa116] flex flex-col relative z-10 border-2 border-[#202b20] shadow-[4px_4px_0px_0px_#202b20] md:-mt-[40px]">
                {/* Header Banner (approx 40px height) */}
                <div className="py-2.5 text-center bg-[#202b20] text-white text-[12px] font-bold uppercase tracking-widest w-full max-h-[40px] border-b-2 border-[#202b20]">
                   Most Popular
                </div>
                
                {/* Card Body */}
                <div className="bg-[#ffa116] p-6 md:p-8 flex-1 flex flex-col relative w-full h-full">
                   
                   <div className="flex flex-col min-h-[140px]">
                       <div className="flex flex-col items-start gap-3 pt-1">
                         <h3 className="text-[20px] font-bold uppercase tracking-wide text-[#202b20] leading-none mb-1">Pro Member</h3>
                         
                         <div className="flex items-center gap-3">
                            <span className="bg-[#202b20] text-[#ffa116] text-[11px] font-bold px-2.5 py-1 rounded-none border-2 border-[#202b20] whitespace-nowrap shadow-[2px_2px_0px_0px_#202b20]">
                              29% OFF
                            </span>

                            {/* INR/USD Manual Toggle neatly placed beside the discount tag */}
                            <div className="flex bg-white/50 p-[3px] rounded-none border-2 border-[#202b20] shrink-0">
                               <button 
                                 onClick={() => setSelectedCurrency("USD")} 
                                 className={cn("px-2 py-[2px] text-[10px] font-bold uppercase tracking-wider rounded-none transition-all", 
                                   selectedCurrency === "USD" ? "bg-[#202b20] text-white" : "text-[#202b20] hover:bg-[#202b20]/10"
                                 )}
                               >
                                  USD
                               </button>
                               <button 
                                 onClick={() => setSelectedCurrency("INR")} 
                                 className={cn("px-2 py-[2px] text-[10px] font-bold uppercase tracking-wider rounded-none transition-all", 
                                   selectedCurrency === "INR" ? "bg-[#202b20] text-white" : "text-[#202b20] hover:bg-[#202b20]/10"
                                 )}
                               >
                                  INR
                               </button>
                            </div>
                         </div>
                      </div>

                      <div className="flex justify-between items-end mt-auto pb-4 pt-4">
                         <div className="flex items-baseline gap-1">
                            <span className="text-[40px] md:text-5xl font-[800] tracking-tighter text-[#202b20] truncate">
                               {displayedPrice.symbol}{displayedPrice.amount}
                            </span>
                            <span className="text-[#202b20]/60 font-medium text-[15px] shrink-0">{displayedPrice.period}</span>
                         </div>
                      </div>
                      
                      <p className="text-[13px] text-slate-500 min-h-[40px]">
                         8 spots open till this week
                      </p>
                   </div>
                   
                   <div className="h-0.5 w-full bg-[#202b20]/20 mb-6 mt-4" />
                   
                   <div className="mb-4 text-[13px] font-bold uppercase tracking-wider text-[#202b20]/60">What's Included</div>
                   <div className="flex-1 space-y-4 mb-8">
                     {proFeatures.map((feature, i) => (
                       <div key={i} className="flex items-start gap-3">
                         <Check className={cn("w-[18px] h-[18px] shrink-0 mt-[1px]", i === 0 ? "text-[#202b20]/60" : "text-[#202b20]")} strokeWidth={3} />
                         <span className={cn("text-[14px] leading-tight", i === 0 ? "text-[#202b20]/70 font-medium" : "text-[#202b20] font-bold")}>{feature}</span>
                       </div>
                     ))}
                   </div>

                   <div className="mt-auto pt-2">
                     <button
                       type="button"
                       onClick={() => void handleSubscribe()}
                       disabled={!canSubscribe}
                       className="w-full py-3.5 rounded-none border-2 border-[#202b20] bg-white text-[#202b20] text-[14px] font-bold uppercase tracking-wider text-center shadow-[4px_4px_0px_0px_#202b20] hover:shadow-[2px_2px_0px_0px_#202b20] hover:translate-y-[2px] transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                     >
                       {isCheckoutLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                       {isCheckoutLoading ? "Opening Checkout..." : subscribeCtaLabel}
                     </button>
                     {!pricingContext?.upgradesEnabled && !isPricingLoading && (
                       <div className="mt-2 text-center">
                         <p className="text-[12px] text-amber-700/80 font-medium">Subscriptions paused temporarily.</p>
                       </div>
                     )}
                   </div>
                </div>
             </div>

             {/* ENTERPRISE PLAN (Standard Card) */}
             <div className="w-full rounded-none border-2 border-[#202b20] bg-white p-6 md:p-8 flex flex-col shadow-[4px_4px_0px_0px_#202b20] h-full">
                <div className="flex flex-col min-h-[140px]">
                  <h3 className="text-[20px] font-bold text-[#202b20] uppercase tracking-wide">Enterprise</h3>
                  <div className="flex items-baseline gap-1 mt-auto pb-4">
                    <span className="text-[40px] md:text-5xl font-[800] tracking-tighter text-[#202b20]">Custom</span>
                  </div>
                  <p className="text-[13px] text-slate-500 min-h-[40px]">
                    Customized interviews charged per bundle minutes limit.
                  </p>
                </div>
                
                <div className="h-0.5 w-full bg-[#202b20]/10 mb-6 mt-4" />
                
                <div className="mb-4 text-[13px] font-bold uppercase tracking-wider text-[#202b20]/60">Everything in Pro, plus:</div>
                <div className="flex-1 space-y-4 mb-8">
                  {enterpriseFeatures.map((feature, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <Check className="w-[18px] h-[18px] text-[#202b20] shrink-0 mt-[1px]" strokeWidth={3} />
                      <span className="text-[14px] text-[#202b20] font-medium leading-tight">{feature}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-auto">
                  <button 
                    onClick={() => setIsSalesModalOpen(true)}
                    className="w-full py-3.5 rounded-none border-2 border-[#202b20] bg-white text-[#202b20] text-[14px] font-bold uppercase tracking-wider text-center shadow-[4px_4px_0px_0px_#202b20] hover:shadow-[2px_2px_0px_0px_#202b20] hover:translate-y-[2px] transition-all"
                  >
                    Talk to Sales &rarr;
                  </button>
                </div>
             </div>

          </div>
        </div>
      </main>

      <TalkToSalesModal 
        isOpen={isSalesModalOpen} 
        onClose={() => setIsSalesModalOpen(false)} 
      />

      <Footer />
    </div>
  );
}

export default function PricingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background flex items-center justify-center text-muted-foreground font-semibold">Loading pricing...</div>}>
      <PricingPageContent />
    </Suspense>
  );
}
