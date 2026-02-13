"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, Mail, Lock, User, Loader2, CheckCircle, Smartphone } from "lucide-react";
import gsap from "gsap";
import Button from "@/components/ui/Button";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "", lastName: "", email: "", phone: "", password: "", confirmPassword: ""
  });

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(".signup-card",
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: "power3.out" }
      );
    }, containerRef);
    return () => ctx.revert();
  }, []);

  useEffect(() => {
    // Animate step transitions
    gsap.fromTo(".form-step",
      { x: 20, opacity: 0 },
      { x: 0, opacity: 1, duration: 0.4 }
    );
  }, [step]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleNext = () => setStep(step + 1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate API
    setTimeout(() => {
      router.push("/dashboard");
    }, 1500);
  };

  return (
    <main className="min-h-screen bg-black flex items-center justify-center relative overflow-hidden pt-20 pb-10" ref={containerRef}>

      {/* Background Gradients */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[150px] pointer-events-none" />

      <div className="w-full max-w-lg p-6 relative z-10">

        <div className="text-center mb-8">
          <h1 className="text-3xl font-black text-white uppercase tracking-tight mb-2">Join the Arena</h1>
          <p className="text-zinc-500">Create your player profile in 3 simple steps.</p>
        </div>

        <div className="signup-card bg-zinc-900/40 backdrop-blur-md border border-zinc-800 p-8 rounded-[2.5rem] shadow-2xl">

          {/* Progress Bar */}
          <div className="flex justify-between mb-8 relative">
            <div className="absolute top-1/2 left-0 w-full h-0.5 bg-zinc-800 -z-10"></div>
            {[1, 2, 3].map((s) => (
              <div key={s} className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all duration-500
                           ${step >= s ? 'bg-emerald-500 text-black shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-zinc-800 text-zinc-500'}
                       `}>
                {step > s ? <CheckCircle className="h-4 w-4" /> : s}
              </div>
            ))}
          </div>

          <form onSubmit={handleSubmit}>
            {step === 1 && (
              <div className="form-step space-y-6">
                <h3 className="text-xl font-bold text-white mb-4">Account Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-500 uppercase">First Name</label>
                    <input
                      name="firstName"
                      value={formData.firstName} onChange={handleChange}
                      className="w-full bg-black/40 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:border-emerald-500 focus:outline-none"
                      placeholder="John"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-500 uppercase">Last Name</label>
                    <input
                      name="lastName"
                      value={formData.lastName} onChange={handleChange}
                      className="w-full bg-black/40 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:border-emerald-500 focus:outline-none"
                      placeholder="Doe"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-500 uppercase">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                    <input
                      name="email" type="email"
                      value={formData.email} onChange={handleChange}
                      className="w-full bg-black/40 border border-zinc-700 rounded-xl pl-10 pr-4 py-3 text-white focus:border-emerald-500 focus:outline-none"
                      placeholder="john@example.com"
                    />
                  </div>
                </div>
                <Button type="button" onClick={handleNext} className="w-full bg-white text-black hover:bg-zinc-200 font-bold py-4">
                  Continue <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            )}

            {step === 2 && (
              <div className="form-step space-y-6">
                <h3 className="text-xl font-bold text-white mb-4">Security & Contact</h3>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-500 uppercase">Mobile Number</label>
                  <div className="relative">
                    <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                    <input
                      name="phone" type="tel"
                      value={formData.phone} onChange={handleChange}
                      className="w-full bg-black/40 border border-zinc-700 rounded-xl pl-10 pr-4 py-3 text-white focus:border-emerald-500 focus:outline-none"
                      placeholder="+94 77 123 4567"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-500 uppercase">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                    <input
                      name="password" type="password"
                      value={formData.password} onChange={handleChange}
                      className="w-full bg-black/40 border border-zinc-700 rounded-xl pl-10 pr-4 py-3 text-white focus:border-emerald-500 focus:outline-none"
                      placeholder="••••••••"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-500 uppercase">Confirm Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                    <input
                      name="confirmPassword" type="password"
                      value={formData.confirmPassword} onChange={handleChange}
                      className="w-full bg-black/40 border border-zinc-700 rounded-xl pl-10 pr-4 py-3 text-white focus:border-emerald-500 focus:outline-none"
                      placeholder="••••••••"
                    />
                  </div>
                </div>
                <Button type="button" onClick={handleNext} className="w-full bg-white text-black hover:bg-zinc-200 font-bold py-4">
                  Next Step <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            )}

            {step === 3 && (
              <div className="form-step space-y-6 text-center">
                <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-500/20 animate-pulse">
                  <CheckCircle className="h-10 w-10 text-emerald-500" />
                </div>
                <h3 className="text-2xl font-black text-white mb-2">You're All Set!</h3>
                <p className="text-zinc-400 text-sm mb-6">
                  By clicking "Create Account", you agree to our Terms of Service and Privacy Policy.
                </p>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 text-lg font-bold bg-emerald-500 hover:bg-emerald-400 text-black shadow-[0_0_30px_rgba(16,185,129,0.4)]"
                >
                  {loading ? <Loader2 className="animate-spin h-6 w-6" /> : "Create Account"}
                </Button>
              </div>
            )}
          </form>

          {step > 1 && !loading && (
            <button onClick={() => setStep(step - 1)} className="mt-6 text-zinc-500 text-sm hover:text-white block mx-auto">
              Go Back
            </button>
          )}
        </div>

        <div className="text-center mt-8">
          <p className="text-zinc-500">
            Already have an account? <Link href="/login" className="text-white font-bold hover:text-emerald-500 transition-colors">Log In</Link>
          </p>
        </div>
      </div>
    </main>
  );
}