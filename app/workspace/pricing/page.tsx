"use client";

import { useState, useContext } from "react";
import { UserDetailContext } from "@/context/UserDetailContext";
import axios from "axios";
import { toast } from "sonner";
import {
  Sparkles,
  CheckCircle2,
  ShieldCheck,
  Zap,
  Loader2,
  Workflow,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const PLANS = [
  {
    id: "basic",
    name: "Starter Pack",
    price: "₹199",
    credits: 100,
    popular: false,
    tagline: "Perfect for hobby projects",
    features: [
      "100 AI Test Credits",
      "Standard test generation speed",
      "Single repository connection",
      "Standard cloud runner speeds",
      "Email support",
    ],
  },
  {
    id: "intermediate",
    name: "Growth Plan",
    price: "₹499",
    credits: 600,
    popular: true,
    tagline: "Best value for active developers",
    features: [
      "600 AI Test Credits (100 Bonus!)",
      "Fast priority test generation",
      "Multi-repository support",
      "Resilient selector wait prioritization",
      "Custom instructions override",
      "Priority email support",
    ],
  },
  {
    id: "pro",
    name: "Enterprise Pro",
    price: "₹999",
    credits: 2000,
    popular: false,
    tagline: "Production-ready automation suite",
    features: [
      "2000 AI Test Credits (400 Bonus!)",
      "Blazing fast test generation",
      "Unlimited repositories",
      "Session video recordings enabled",
      "Complete custom runtime settings",
      "24/7 Premium Discord & Slack support",
    ],
  },
];

export default function PricingPage() {
  const [purchasingPlan, setPurchasingPlan] = useState<string | null>(null);
  const userContext = useContext(UserDetailContext);
  const userId = userContext?.userDetail?.id;
  const userEmail = userContext?.userDetail?.email;

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if ((window as any).Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePurchase = async (planId: string) => {
    if (!userId) {
      toast.error("Please sign in or wait until your session is ready.");
      return;
    }

    setPurchasingPlan(planId);
    try {
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        toast.error("Failed to load payment gateway script. Try disabling your adblocker.");
        return;
      }

      // Create order
      const res = await axios.post<{
        data: { orderId: string; amount: number; currency: string; keyId: string };
      }>("/api/razorpay/order", {
        planId,
        userId,
      });

      if (!res.data || !res.data.data) {
        toast.error("Failed to initiate checkout order.");
        return;
      }

      const { orderId, amount, currency, keyId } = res.data.data;

      const options = {
        key: keyId,
        amount: amount,
        currency: currency,
        name: "Testly AI",
        description: `${planId.toUpperCase()} Plan Subscription`,
        order_id: orderId,
        handler: async function (response: any) {
          try {
            toast.loading("Verifying payment...", { id: "verify-toast" });
            const verifyRes = await axios.post<{
              data: { totalCredits: number };
            }>("/api/razorpay/verify", {
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
              userId,
              planId,
            });

            if (verifyRes.data && verifyRes.data.data) {
              toast.success("Payment verified! Credits added successfully.", { id: "verify-toast" });
              // Refresh user details dynamically
              const userRes = await axios.post<{ data: any }>("/api/users");
              if (userContext) {
                userContext.setUserDetail(userRes.data.data);
              }
            } else {
              toast.error("Verification failed.", { id: "verify-toast" });
            }
          } catch (err) {
            console.error("Verification error:", err);
            toast.error("Payment verification failed.", { id: "verify-toast" });
          }
        },
        prefill: {
          email: userEmail ?? "",
        },
        theme: {
          color: "#6D9846",
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error("Purchase process failed:", error);
      toast.error("Failed to initiate checkout. Please try again.");
    } finally {
      setPurchasingPlan(null);
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 space-y-8 select-none">

      <div className="flex items-center justify-between">
        <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-[#6D9846]">
          Credits & Upgrades
        </span>
      </div>

      {/* Pricing Container - Full Width */}
      <section className="glass-panel hero-ring overflow-hidden rounded-4xl border border-white/80 p-6 sm:p-8">
        <div>
          <div className="mb-3 inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-[#6D9846]">
            Pricing & Top-Ups
          </div>
          <h1 className="font-brand-serif text-4xl sm:text-5xl leading-none tracking-[-0.04em] text-slate-950">
            Replenish credits to keep your autonomous QA running.
          </h1>
          <p className="mt-3 max-w-3xl text-slate-600 text-sm leading-6">
            Credits power code analysis, test generation, and seamless Playwright executions on our Browserbase headless cloud browsers. Top up instantly with local secure gateways.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3 mt-8 items-stretch">
          {PLANS.map((plan) => (
            <div
              key={plan.id}
              className={`relative flex flex-col justify-between rounded-3xl border p-5 transition hover:shadow-lg ${
                plan.popular
                  ? "border-emerald-500 bg-emerald-50/20 shadow-md scale-102"
                  : "border-slate-200 bg-white"
              }`}
            >
              {plan.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[#6D9846] px-3 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white shadow-xs">
                  Best Value
                </span>
              )}

              <div>
                <h3 className="text-sm font-bold text-slate-900">{plan.name}</h3>
                <p className="text-[10px] text-slate-400 mt-0.5 leading-relaxed">{plan.tagline}</p>
                
                <div className="my-3 flex items-baseline gap-0.5">
                  <span className="text-2xl font-extrabold tracking-tight text-slate-900">
                    {plan.price}
                  </span>
                  <span className="text-[10px] font-semibold text-slate-500">
                    / {plan.credits} credits
                  </span>
                </div>

                <div className="border-t border-slate-100 my-3" />

                <ul className="space-y-2">
                  {plan.features.map((feat) => (
                    <li key={feat} className="flex items-start gap-2 text-[10px] text-slate-600">
                      <CheckCircle2 className="h-3.5 w-3.5 text-[#6D9846] mt-0.5 shrink-0" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-5 shrink-0">
                <Button
                  onClick={() => handlePurchase(plan.id)}
                  disabled={purchasingPlan !== null}
                  className={`w-full rounded-2xl text-[10px] font-bold py-2 flex items-center justify-center gap-1.5 transition cursor-pointer ${
                    plan.popular
                      ? "bg-[#6D9846] text-white hover:bg-[#5d873d] shadow-sm"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  {purchasingPlan === plan.id ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" /> Processing
                    </>
                  ) : (
                    <>
                      Get {plan.credits} Credits
                    </>
                  )}
                </Button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 flex items-center gap-2 text-xs text-slate-400 justify-center">
          <ShieldCheck className="h-4 w-4 text-emerald-600" />
          <span>Payments are processed securely via standard Razorpay SSL gateway.</span>
        </div>
      </section>

      {/* Side-by-Side Sidebar Elements below Pricing Section */}
      <div className="grid gap-6 md:grid-cols-2">
        
        {/* Box 1: Workspace Flow Model */}
        <div className="rounded-3xl border border-slate-200 bg-slate-950 p-6 text-white shadow-xl shadow-slate-900/10 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.24em] text-emerald-200 border-b border-slate-800 pb-3">
              <Workflow className="h-4 w-4" />
              Workspace Flow Model
            </div>
            
            <div className="mt-5 space-y-5">
              {/* Step 1 */}
              <div className="flex items-start gap-4">
                <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-xs font-bold text-emerald-300 ring-1 ring-emerald-500/40">
                  1
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white flex items-center gap-1.5">
                    GitHub linked
                    <span className="rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-[10px] text-emerald-400">
                      Connected
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                    Instantly sync directories and parse repositories into highly organized metadata pipelines.
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex items-start gap-4">
                <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-xs font-bold text-emerald-300 ring-1 ring-emerald-500/40">
                  2
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white flex items-center gap-1.5">
                    Repositories ready
                    <span className="rounded-full bg-slate-800 border border-slate-700 px-2 py-0.5 text-[10px] text-slate-300">
                      3 repositories
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                    Source code is mapped, analyzed, and ready to trigger automated test scenario extractions.
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex items-start gap-4">
                <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-xs font-bold text-emerald-300 ring-1 ring-emerald-500/40">
                  3
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white flex items-center gap-1.5">
                    Execution posture
                    <span className="rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-[10px] text-emerald-400">
                      Ready for AI testing
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                    Convert descriptions into custom resilient Playwright scripts executed completely in the cloud.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Box 2: Testly Quality Engine boasting */}
        <div className="glass-panel rounded-3xl border border-white/80 p-6 shadow-lg shadow-emerald-100/30 flex flex-col justify-between">
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-[0.24em] text-slate-500 flex items-center gap-1.5 border-b border-slate-100 pb-3">
              <TrendingUp className="h-4 w-4 text-[#6D9846]" />
              Testly Quality Engine
            </h4>

            <div className="space-y-3">
              <div className="flex justify-between items-center bg-white/70 border p-3 rounded-2xl">
                <div className="flex flex-col">
                  <span className="text-[11px] font-semibold text-slate-700">Gemini 3.5 Flash QA</span>
                  <span className="text-[10px] text-slate-400">Deep codebase logic parsing</span>
                </div>
                <span className="text-xs font-mono font-bold text-[#6D9846] bg-emerald-50 border border-emerald-100 px-2 py-1 rounded-md">
                  Active
                </span>
              </div>

              <div className="flex justify-between items-center bg-white/70 border p-3 rounded-2xl">
                <div className="flex flex-col">
                  <span className="text-[11px] font-semibold text-slate-700">Browserbase Clouds</span>
                  <span className="text-[10px] text-slate-400">Zero flakiness cloud runners</span>
                </div>
                <span className="text-xs font-mono font-bold text-[#6D9846] bg-emerald-50 border border-emerald-100 px-2 py-1 rounded-md">
                  99.8% Up
                </span>
              </div>
            </div>
          </div>
          
          <div className="mt-6 space-y-2 border-t border-slate-100 pt-4">
            <p className="text-[10px] text-slate-500 text-center leading-relaxed">
              Deductions are fully granular: only **10 credits per case** generated or executed. Upgrade anytime!
            </p>
            <div className="flex items-center gap-1.5 justify-center text-[10px] text-slate-400">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              <span>Full transaction details securely audited and saved.</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
