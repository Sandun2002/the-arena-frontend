"use client";

import Link from "next/link";
import Button from "@/components/ui/Button";
import { ArrowLeft } from "lucide-react";

export default function VenueSignupPage() {
  return (
    <main className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Link href="/signup" className="mb-8 inline-flex items-center text-sm text-zinc-500 hover:text-white">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Selection
        </Link>

        <div className="rounded-3xl border border-zinc-800 bg-zinc-900/50 p-8 backdrop-blur-xl">
          <h1 className="text-3xl font-bold text-white mb-2">Venue Owner</h1>
          <p className="text-zinc-400 mb-8">Register your business.</p>

          <form className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">Venue Name</label>
              <input type="text" className="w-full rounded-xl border border-zinc-700 bg-black/50 p-3 text-white focus:border-blue-500 focus:outline-none" />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">Business Email</label>
              <input type="email" className="w-full rounded-xl border border-zinc-700 bg-black/50 p-3 text-white focus:border-blue-500 focus:outline-none" />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">Phone Number</label>
              <input type="tel" className="w-full rounded-xl border border-zinc-700 bg-black/50 p-3 text-white focus:border-blue-500 focus:outline-none" />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">Password</label>
              <input type="password" className="w-full rounded-xl border border-zinc-700 bg-black/50 p-3 text-white focus:border-blue-500 focus:outline-none" />
            </div>

            <Button className="w-full py-4 mt-4 bg-blue-500 text-white hover:bg-blue-400 font-bold border-none">
              Register Venue
            </Button>
          </form>
        </div>
      </div>
    </main>
  );
}