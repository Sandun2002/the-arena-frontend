"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { api } from "@/services/api";
import { Venue } from "@/types";
import BookingWidget from "@/components/venues/BookingWidget";
import { MapPin, Star, Trophy, Car, Zap, Droplets, User, Calendar, CheckCircle } from "lucide-react";
import Button from "@/components/ui/Button";

// -- Mock Reviews Data --
const VENUE_REVIEWS = [
  { id: 1, user: "Kamal S.", rating: 5, date: "2 days ago", comment: "Best futsal court in Colombo! The turf is well maintained." },
  { id: 2, user: "Nimali P.", rating: 4, date: "1 week ago", comment: "Great facilities, but parking can be tricky during peak hours." },
  { id: 3, user: "Dinesh K.", rating: 5, date: "2 weeks ago", comment: "Loving the new lighting system. Perfect for night games." },
];

export default function VenueDetailsPage() {
  const params = useParams();
  const [venue, setVenue] = useState<Venue | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    const loadVenue = async () => {
      if (params.id) {
        const id = Array.isArray(params.id) ? params.id[0] : params.id;
        const data = await api.getVenueById(id);
        if (data) setVenue(data);
        setLoading(false);
      }
    };
    loadVenue();
  }, [params.id]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-emerald-500"></div>
    </div>
  );

  if (!venue) return <div className="min-h-screen bg-black text-white flex items-center justify-center">Venue not found</div>;

  return (
    <main className="min-h-screen bg-black text-white pb-20 pt-24">

      {/* Background Glow */}
      <div className="fixed top-0 left-0 w-full h-[500px] bg-emerald-500/5 blur-[120px] pointer-events-none" />

      {/* 1. HEADER SECTION (Title & Price) */}
      <div className="container mx-auto px-4 mb-8 relative z-10">
        {/* Breadcrumb */}
        <div className="text-xs font-bold text-zinc-500 mb-6 flex gap-2 uppercase tracking-wider">
          <Link href="/" className="hover:text-white transition-colors">Home</Link> /
          <Link href="/venues" className="hover:text-white transition-colors">Search</Link> /
          <span className="text-emerald-500">{venue.name}</span>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div>
            <h1 className="text-4xl md:text-6xl font-black mb-4 tracking-tight uppercase">{venue.name}</h1>
            <div className="flex items-center gap-6 text-sm text-zinc-400 font-medium">
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-emerald-500" />
                {venue.location}
              </div>
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                <span className="text-white font-bold text-lg">{venue.rating}</span>
                <span className="underline decoration-zinc-700 underline-offset-4">(120 Reviews)</span>
              </div>
            </div>
          </div>

          <div className="text-right">
            <p className="text-xs text-zinc-500 font-bold uppercase tracking-wider mb-1">Starting from</p>
            <p className="text-3xl font-black text-white flex items-baseline gap-1 justify-end">
              LKR {venue.pricePerHour.toLocaleString()} <span className="text-sm font-bold text-zinc-500">/hr</span>
            </p>
          </div>
        </div>
      </div>

      {/* 2. IMAGE GALLERY (Bento Grid) */}
      <div className="container mx-auto px-4 mb-12 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 h-[400px] md:h-[500px]">
          {/* Main Large Image */}
          <div className="md:col-span-3 relative rounded-[2rem] overflow-hidden border border-zinc-800 group cursor-pointer">
            <Image src={venue.imageUrl} alt={venue.name} fill className="object-cover transition-transform duration-700 group-hover:scale-105" priority />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>

          {/* Side Stacked Images */}
          <div className="hidden md:flex flex-col gap-4">
            <div className="relative flex-1 rounded-[2rem] overflow-hidden border border-zinc-800 group cursor-pointer">
              <Image src="https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=2693&auto=format&fit=crop" alt="Detail 1" fill className="object-cover transition-transform duration-700 group-hover:scale-110" />
            </div>
            <div className="relative flex-1 rounded-[2rem] overflow-hidden border border-zinc-800 group cursor-pointer">
              <Image src="https://images.unsplash.com/photo-1626224583764-84786c71b170?q=80&w=2670&auto=format&fit=crop" alt="Detail 2" fill className="object-cover transition-transform duration-700 group-hover:scale-110" />
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm">
                <span className="text-sm font-bold text-white uppercase tracking-wider border border-white/20 px-4 py-2 rounded-full">View All</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. MAIN CONTENT GRID */}
      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

          {/* LEFT COLUMN: DETAILS */}
          <div className="lg:col-span-2 space-y-12">

            {/* About */}
            <section>
              <h3 className="text-xl font-black text-white uppercase tracking-tight mb-6 flex items-center gap-2">
                About Venue
              </h3>
              <div className="bg-zinc-900/40 p-8 rounded-[2rem] border border-zinc-800 backdrop-blur-sm">
                <p className="text-zinc-400 leading-relaxed text-lg">
                  {venue.description} The facility is equipped with state-of-the-art lighting and turf, ensuring a professional experience for every game. Ideal for tournaments, corporate events, and daily practice sessions.
                </p>
              </div>
            </section>

            {/* Quick Slots Access (New Feature) */}
            <section>
              <div className="flex justify-between items-end mb-6">
                <h3 className="text-xl font-black text-white uppercase tracking-tight">Available Slots</h3>
                <div className="flex gap-2">
                  {/* Mock Date Selector */}
                  {['Today', 'Tomorrow', 'Sat, 15 Feb'].map((day, i) => (
                    <button key={i} className={`px-4 py-2 rounded-lg text-xs font-bold border transition-all ${i === 0 ? 'bg-white text-black border-white' : 'bg-zinc-900 text-zinc-500 border-zinc-800 hover:border-zinc-600'}`}>
                      {day}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-3 md:grid-cols-4 gap-3 bg-zinc-900/40 p-6 rounded-[2rem] border border-zinc-800">
                {Array.from({ length: 8 }).map((_, i) => {
                  const time = `${i + 14}:00`;
                  const isAvailable = i !== 2 && i !== 5; // Mock availability
                  return (
                    <button
                      key={i}
                      disabled={!isAvailable}
                      className={`py-3 rounded-xl text-sm font-bold border transition-all relative overflow-hidden group
                                    ${isAvailable
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500 hover:text-black'
                          : 'bg-zinc-800/50 border-zinc-800 text-zinc-600 cursor-not-allowed opacity-50'}
                                `}
                    >
                      {time}
                      {isAvailable && <div className="absolute inset-0 bg-emerald-400/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />}
                    </button>
                  )
                })}
              </div>
            </section>

            {/* Amenities */}
            <section>
              <h3 className="text-xl font-black text-white uppercase tracking-tight mb-6">Amenities</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { icon: Trophy, label: "Pro Turf" },
                  { icon: Car, label: "Parking" },
                  { icon: Zap, label: "Floodlights" },
                  { icon: Droplets, label: "Showers" },
                ].map((item, i) => (
                  <div key={i} className="flex flex-col items-center justify-center p-6 rounded-[2rem] bg-zinc-900/40 border border-zinc-800 text-zinc-400 hover:border-emerald-500/30 hover:text-emerald-500 transition-colors group">
                    <item.icon className="h-8 w-8 mb-3 group-hover:scale-110 transition-transform duration-300" />
                    <span className="text-sm font-bold uppercase tracking-wider">{item.label}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* Reviews Section (New) */}
            <section>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-black text-white uppercase tracking-tight">Player Reviews</h3>
                <Button variant="outline" className="text-xs border-zinc-700">Write a Review</Button>
              </div>

              <div className="space-y-4">
                {VENUE_REVIEWS.map(review => (
                  <div key={review.id} className="p-6 rounded-[2rem] bg-zinc-900/40 border border-zinc-800 backdrop-blur-sm">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center font-bold text-zinc-500">
                          {review.user.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-white text-sm">{review.user}</p>
                          <p className="text-xs text-zinc-500">{review.date}</p>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`h-3 w-3 ${i < review.rating ? "text-yellow-500 fill-yellow-500" : "text-zinc-700"}`} />
                        ))}
                      </div>
                    </div>
                    <p className="text-zinc-400 text-sm italic">"{review.comment}"</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Map Section */}
            <section>
              <h3 className="text-xl font-black text-white uppercase tracking-tight mb-6">Location</h3>
              <div className="relative w-full h-[300px] rounded-[2rem] overflow-hidden border border-zinc-800 bg-zinc-900 group">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3960.902932303566!2d79.8612430745672!3d6.902210893097063!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ae25963120b1509%3A0x2db2c18a59054c66!2sRoyal%20College%20Sports%20Complex!5e0!3m2!1sen!2slk!4v1709900000000!5m2!1sen!2slk"
                  width="100%"
                  height="100%"
                  style={{ border: 0, filter: "invert(90%) hue-rotate(180deg) grayscale(80%)" }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="group-hover:grayscale-0 transition-all duration-700"
                ></iframe>

                <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end pointer-events-none">
                  <div className="bg-black/80 backdrop-blur text-white p-4 rounded-xl shadow-xl border border-zinc-800 pointer-events-auto">
                    <p className="text-xs font-bold text-emerald-500 mb-1 uppercase tracking-wider">Address</p>
                    <p className="text-sm font-bold">Royal College Sports Complex</p>
                    <p className="text-xs text-zinc-400">Colombo 07</p>
                  </div>
                </div>
              </div>
            </section>

          </div>

          {/* RIGHT COLUMN: STICKY WIDGET */}
          <div className="relative">
            <div className="sticky top-24">
              <BookingWidget venue={venue} />

              <div className="mt-8 p-6 rounded-[2rem] bg-gradient-to-br from-zinc-900 to-zinc-900/50 border border-zinc-800 text-center">
                <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-4 text-emerald-500">
                  <CheckCircle className="h-6 w-6" />
                </div>
                <h4 className="font-bold text-white mb-2">Verified Venue</h4>
                <p className="text-xs text-zinc-500">
                  This venue meets Arena's standards for quality and safety.
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}