"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Suspense } from "react";
import { Check, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "motion/react";
import Navbar from "@/app/components/layout/Navbar";
import Footer from "@/app/components/layout/Footer";
import { useAuth } from "@/app/context/AuthContext";

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

  const freeFeatures = [
    "Test series (Company and Subject wise)",
    "Resume building (Unlimited)",
    "Market updates (Newsletter)",
    "Project labs (100+ top projects)",
  ];

  const proFeatures = [
    "Real-World AI Audio & Video Interviews",
    "Infinite Resume Parsing & Scoring",
    "1-on-1 Guidance from Industry Leaders",
    "24/7 Priority Support & Onboarding",
    "Advanced Mock Interview Analytics",
  ];

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
      return { amount: "799", symbol: "₹", period: "/month" };
    }

    if (pricingContext.currency === "INR") {
      return {
        amount: String(pricingContext.pro.monthly.inr),
        symbol: "₹",
        period: "/month",
      };
    }

    return {
      amount: pricingContext.pro.monthly.usd.toFixed(2),
      symbol: "$",
      period: "/month",
    };
  }, [pricingContext]);

  const subscribeCtaLabel = useMemo(() => {
    if (authLoading || isPricingLoading) return "Checking...";
    if (isActiveProMember) return "Pro Member Active";
    if (!pricingContext?.upgradesEnabled) return "Temporarily Unavailable";
    if (!user) return "Sign in to Subscribe";
    return "Subscribe Pro";
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
          color: "#111827",
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
    <div className="min-h-screen bg-background text-foreground font-sans antialiased flex flex-col relative overflow-x-hidden">
      {/* Absolute Dotted Background Layer */}
      <div
        className="absolute inset-0 pointer-events-none z-0 opacity-40"
        style={{
          backgroundImage: 'radial-gradient(hsl(var(--primary) / 0.15) 1px, transparent 1px)',
          backgroundSize: '24px 24px'
        }}
      />
      <Navbar />
      
      <main className="flex-1 flex flex-col items-center pt-32 pb-24 px-6 z-10 w-full">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
        <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-foreground">
          Start Free
        </h1>
        <p className="text-lg text-muted-foreground">
          One clear upgrade: EMBLE Pro Member.
          <br className="hidden sm:block" />
          India sees INR, global users see USD.
        </p>
      </div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto w-full">
        
        {/* FREE PLAN */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col p-8 rounded-[32px] border border-border bg-background shadow-sm hover:shadow-md transition-shadow relative"
        >
          <div className="mb-8">
            <h3 className="text-sm font-semibold tracking-wider text-muted-foreground uppercase mb-4">
              Free
            </h3>
            <div className="flex items-baseline gap-1">
              <span className="text-6xl font-bold tracking-tighter text-foreground">$0</span>
              <span className="text-muted-foreground font-medium">/month</span>
            </div>
            <p className="text-sm text-muted-foreground mt-4">
              Free for lifetime. Keep practicing with core tools.
            </p>
          </div>

          <div className="flex-1 space-y-4 mb-8">
            {freeFeatures.map((feature, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="mt-0.5 w-5 h-5 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
                  <Check className="w-3.5 h-3.5 text-emerald-600" strokeWidth={3} />
                </div>
                <span className="text-sm text-foreground/80">{feature}</span>
              </div>
            ))}
          </div>

          <Link 
            href={user ? "/dashboard" : "/register/student"}
            className="w-full py-4 px-6 rounded-2xl border-2 border-border text-foreground font-semibold text-center hover:bg-muted/50 transition-colors"
          >
            {user ? "Go to Dashboard" : "Get Started Free"}
          </Link>
        </motion.div>

        {/* PRO PLAN */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex flex-col p-8 rounded-[32px] border-2 border-primary/30 bg-background shadow-2xl relative overflow-hidden transform md:-translate-y-4"
        >
          {/* Subtle glow / ai-elements style accent */}
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-80" />
          
          <div className="absolute top-6 right-8">
            <span className="bg-primary/10 text-primary text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest">
              Most Popular
            </span>
          </div>

          <div className="mb-8 relative z-10">
            <h3 className="text-sm font-semibold tracking-wider text-primary uppercase mb-4">
              Pro Member
            </h3>
            <div className="flex items-baseline gap-1">
              <span className="text-6xl font-bold tracking-tighter text-foreground">{displayedPrice.symbol}{displayedPrice.amount}</span>
              <span className="text-foreground/50 font-medium">{displayedPrice.period}</span>
            </div>
            <p className="text-sm text-muted-foreground mt-4">
              Everything in Free, plus all premium tools.
            </p>
            {pricingContext?.currency === "USD" && (
              <p className="text-xs text-muted-foreground mt-2">Displayed in USD for your region. Checkout is processed in INR equivalent via Razorpay.</p>
            )}
            {!pricingContext?.upgradesEnabled && !isPricingLoading && (
              <p className="text-xs text-amber-600 mt-2">Subscriptions are currently paused. Please try again later.</p>
            )}
          </div>

          <div className="flex-1 space-y-4 mb-8 relative z-10">
            {/* Added "Everything in Free" summary marker */}
            <div className="flex items-start gap-3 pb-2 border-b border-border/50 mb-4">
              <div className="mt-0.5 w-5 h-5 rounded-full bg-foreground/5 flex items-center justify-center shrink-0">
                <Check className="w-3.5 h-3.5 text-foreground/50" strokeWidth={3} />
              </div>
              <span className="text-sm font-semibold text-foreground/50">Everything in Free, plus:</span>
            </div>

            {proFeatures.map((feature, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="mt-0.5 w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Check className="w-3.5 h-3.5 text-primary" strokeWidth={3} />
                </div>
                <span className="text-sm font-medium text-foreground">{feature}</span>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={() => void handleSubscribe()}
            disabled={!canSubscribe}
            className="w-full py-4 px-6 rounded-2xl bg-foreground text-background font-semibold text-center hover:bg-foreground/90 transition-colors shadow-lg active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isCheckoutLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            {isCheckoutLoading ? "Opening Checkout..." : subscribeCtaLabel}
          </button>
        </motion.div>

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
