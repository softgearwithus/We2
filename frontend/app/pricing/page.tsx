"use client";

import { fetchApi } from '../lib/apiClient';

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
        const response = await fetchApi(`${process.env.NEXT_PUBLIC_API_URL}/admin/public/pricing-context`, {
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

      const orderResponse = await fetchApi(`${process.env.NEXT_PUBLIC_API_URL}/users/upgrade-order`, {
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
            const upgradeResponse = await fetchApi(`${process.env.NEXT_PUBLIC_API_URL}/users/upgrade`, {
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
    <div className="min-h-screen bg-background text-foreground font-sans antialiased flex flex-col relative overflow-x-hidden">
      <Navbar />
      
      <main className="flex-1 flex flex-col items-center pt-28 pb-24 px-6 z-10 w-full">
        <div className="max-w-[1100px] w-full mx-auto grid grid-cols-1 lg:grid-cols-[1fr_1.4fr] gap-12 lg:gap-16 items-center">
          
          {/* LEFT SIDE: Copy & Features */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col items-start gap-4 text-left"
          >
            <span className="px-4 py-1.5 rounded-full border border-border/80 text-[13px] font-semibold bg-white shadow-sm tracking-wide text-slate-800">
              Our Pricing
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-[56px] font-[1000] tracking-tight text-[#1a2b3b] leading-[1.1] mt-2 mb-2">
              Personalized plans <br className="hidden md:block"/> and pricing
            </h1>
            <p className="text-lg text-slate-600 font-medium leading-relaxed max-w-sm">
              Flexible pricing plans designed to fit your needs and help your career grow.
            </p>
            
            <div className="space-y-4 my-6">
              {[
                { icon: <Calendar className="w-[18px] h-[18px]" />, text: "Lifetime free access for core tools" },
                { icon: <ShieldCheck className="w-[18px] h-[18px]" />, text: "No hidden fees or conditions" },
                { icon: <RotateCcw className="w-[18px] h-[18px]" />, text: "Cancel anytime securely" },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 text-slate-600 font-medium text-[15px]">
                   <div className="text-slate-400">{item.icon}</div>
                   <span>{item.text}</span>
                </div>
              ))}
            </div>

            <div className="mt-8 pt-8 w-full border-t border-slate-100">
               <p className="text-sm text-slate-500 font-medium mb-4">Trusted by secure Payments service</p>
               <div className="flex items-center gap-6 opacity-80 mix-blend-multiply">
                  {/* Razorpay Logo Element */}
                  <div className="flex items-center gap-2 font-[1000] text-[#02042b] tracking-widest text-[17px]">
                    <svg viewBox="0 0 100 100" className="w-[22px] h-[22px] fill-[#338be2]">
                       <path d="M0,50 C0,22.3857625 22.3857625,0 50,0 C77.6142375,0 100,22.3857625 100,50 C100,77.6142375 77.6142375,100 50,100 C22.3857625,100 0,77.6142375 0,50 Z" opacity="0.1"/>
                       <path d="M72.5,35 L42.5,85 L35,85 L47.5,45 L25,45 L40,20 L62.5,20 L55,35 L72.5,35 Z" fill="#3395ff" />
                    </svg>
                    RAZORPAY
                  </div>
               </div>
            </div>
          </motion.div>

          {/* RIGHT SIDE: Cards Wrapper */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end relative w-full lg:max-w-[700px] ml-auto">
             
             {/* FREE PLAN */}
             <motion.div 
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ duration: 0.6, delay: 0.1 }}
               className="rounded-[32px] border-[1.5px] border-border bg-white p-6 lg:p-8 flex flex-col shadow-sm h-full max-h-[96%]"
             >
                <div className="mb-6">
                  <h3 className="text-[17px] font-bold text-[#1a2b3b] mb-4">Free</h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-[44px] md:text-5xl font-black tracking-tighter text-[#1a2b3b]">$0</span>
                    <span className="text-slate-500 font-medium text-sm">/mo</span>
                  </div>
                  <p className="text-[13px] text-slate-500 font-medium mt-2">
                    Lifetime free access for Core tools.
                  </p>
                </div>
                
                <div className="h-px w-full bg-slate-100 mb-6" />
                
                <div className="mb-4 text-sm font-semibold text-slate-400">What's Included</div>
                <div className="flex-1 space-y-3 mb-8">
                  {freeFeatures.map((feature, i) => (
                    <div key={i} className="flex items-start gap-2.5">
                      <Check className="w-[14px] h-[14px] text-slate-800 shrink-0 mt-[3px]" strokeWidth={3} />
                      <span className="text-[13px] text-slate-700 font-medium leading-tight">{feature}</span>
                    </div>
                  ))}
                </div>

                <Link 
                  href={user ? "/dashboard" : "/register/student"}
                  className="w-full py-3.5 rounded-2xl border-[1.5px] border-slate-200 text-slate-800 text-[14px] font-bold text-center hover:bg-slate-50 transition-colors"
                >
                  {user ? "Go to Dashboard \u2192" : "Reserve your spot \u2192"}
                </Link>
             </motion.div>
             
             {/* PRO PLAN */}
             <motion.div 
               initial={{ opacity: 0, scale: 0.95 }}
               animate={{ opacity: 1, scale: 1 }}
               transition={{ duration: 0.6, delay: 0.2 }}
               className="relative rounded-[32px] bg-[#3b82f6] p-[2px] flex flex-col shadow-2xl h-full transform lg:scale-105 z-10"
             >
                <div className="text-center py-[10px] text-white text-[11px] font-bold uppercase tracking-[0.2em]">
                   Most Popular
                </div>
                <div className="bg-white rounded-[30px] p-6 lg:p-8 flex-1 flex flex-col relative h-full">
                   <div className="flex justify-between items-start mb-4">
                      <h3 className="text-[17px] font-bold text-[#1a2b3b]">Pro Member</h3>
                      <span className="bg-blue-50 text-blue-600 text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-widest border border-blue-100">
                        29% OFF
                      </span>
                   </div>

                   {/* Pricing & Toggle Row */}
                   <div className="flex items-start justify-between">
                     <div className="flex items-baseline gap-1">
                        <span className="text-[44px] md:text-5xl font-black tracking-tighter text-[#1a2b3b]">
                           {displayedPrice.symbol}{displayedPrice.amount}
                        </span>
                        <span className="text-slate-500 font-medium text-sm">{displayedPrice.period}</span>
                     </div>
                     
                     {/* INR/USD Manual Toggle */}
                     <div className="bg-slate-100 p-1 rounded-xl flex border border-slate-200 shadow-inner mt-2">
                        <button 
                          onClick={() => setSelectedCurrency("USD")} 
                          className={cn("px-2.5 py-1 text-[11px] font-bold rounded-lg transition-colors", 
                            selectedCurrency === "USD" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
                          )}
                        >
                           USD
                        </button>
                        <button 
                          onClick={() => setSelectedCurrency("INR")} 
                          className={cn("px-2.5 py-1 text-[11px] font-bold rounded-lg transition-colors", 
                            selectedCurrency === "INR" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
                          )}
                        >
                           INR
                        </button>
                     </div>
                   </div>

                   <p className="text-[13px] text-slate-500 font-medium mt-2">
                      8 spots open till this week
                   </p>
                   
                   <div className="h-px w-full bg-slate-100 my-6" />
                   
                   <div className="mb-4 text-sm font-semibold text-slate-400">What's Included</div>
                   <div className="flex-1 space-y-3 mb-8">
                     <div className="flex flex-col gap-3 pb-2">
                       {proFeatures.slice(0, 1).map((feature, i) => (
                         <div key={i} className="flex items-start gap-2.5">
                           <Check className="w-[14px] h-[14px] text-slate-400 shrink-0 mt-[3px]" strokeWidth={3} />
                           <span className="text-[13px] text-slate-500 font-semibold leading-tight">{feature}</span>
                         </div>
                       ))}
                     </div>
                     {proFeatures.slice(1).map((feature, i) => (
                       <div key={i} className="flex items-start gap-2.5">
                         <Check className="w-[14px] h-[14px] text-blue-600 shrink-0 mt-[3px]" strokeWidth={3} />
                         <span className="text-[13px] text-slate-700 font-medium leading-tight">{feature}</span>
                       </div>
                     ))}
                   </div>

                   <button
                     type="button"
                     onClick={() => void handleSubscribe()}
                     disabled={!canSubscribe}
                     className="w-full py-3.5 rounded-2xl bg-[#0a0f29] text-white text-[14px] font-bold text-center hover:bg-[#1a2b3b] transition-colors flex items-center justify-center gap-2 shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
                   >
                     {isCheckoutLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                     {isCheckoutLoading ? "Opening Checkout..." : subscribeCtaLabel}
                   </button>
                   {!pricingContext?.upgradesEnabled && !isPricingLoading && (
                     <p className="text-[10px] text-amber-600 mt-2 text-center font-bold">Subscriptions are currently paused.</p>
                   )}
                </div>
             </motion.div>

          </div>
        </div>
      </main>

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
