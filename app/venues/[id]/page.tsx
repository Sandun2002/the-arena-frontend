"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation"; 
import Image from "next/image";
import { api } from "@/services/api";
import { Venue } from "@/types";
import BookingWidget from "@/components/venues/BookingWidget";
import { MapPin, Star, Trophy, Car, Zap, Droplets } from "lucide-react";
import Link from "next/link";

export default function VenueDetailsPage() {
  const params = useParams();
  const [venue, setVenue] = useState<Venue | null>(null);
  const [loading, setLoading] = useState(true);

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

  if (loading) return <div className="min-h-screen flex items-center justify-center text-emerald-500">Loading Arena...</div>;
  if (!venue) return <div>Venue not found</div>;

  return (
    <main className="min-h-screen bg-black text-white pb-20">
      
      {/* 1. HEADER SECTION (Title & Price) */}
      <div className="container mx-auto px-4 pt-8 pb-6">
        {/* Breadcrumb */}
        <div className="text-xs text-zinc-500 mb-4 flex gap-2">
          <Link href="/">Home</Link> / <Link href="/venues">Search</Link> / <span className="text-zinc-300">{venue.name}</span>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <h1 className="text-3xl md:text-5xl font-bold mb-2 tracking-tight">{venue.name}</h1>
            <div className="flex items-center gap-4 text-sm text-zinc-400">
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4 text-emerald-500" />
                {venue.location}
              </div>
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                <span className="text-white font-bold">{venue.rating}</span> (120 Reviews)
              </div>
            </div>
          </div>

          <div className="text-right">
            <p className="text-xs text-zinc-500 mb-1">Starting from</p>
            <p className="text-3xl font-bold text-white">
              LKR {venue.pricePerHour.toLocaleString()} <span className="text-sm font-normal text-zinc-500">/hr</span>
            </p>
          </div>
        </div>
      </div>

      {/* 2. IMAGE GALLERY (Bento Grid Style) */}
      <div className="container mx-auto px-4 mb-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 h-[400px] md:h-[500px]">
          {/* Main Large Image */}
          <div className="md:col-span-3 relative rounded-2xl overflow-hidden border border-zinc-800 group">
            <Image src={venue.imageUrl} alt={venue.name} fill className="object-cover transition-transform duration-700 group-hover:scale-105" priority />
          </div>
          
          {/* Side Stacked Images */}
          <div className="hidden md:flex flex-col gap-4">
            <div className="relative flex-1 rounded-2xl overflow-hidden border border-zinc-800">
               <Image src="https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=2693&auto=format&fit=crop" alt="Detail 1" fill className="object-cover" />
            </div>
            <div className="relative flex-1 rounded-2xl overflow-hidden border border-zinc-800">
               <Image src="https://images.unsplash.com/photo-1626224583764-84786c71b170?q=80&w=2670&auto=format&fit=crop" alt="Detail 2" fill className="object-cover" />
               <div className="absolute inset-0 bg-black/50 flex items-center justify-center hover:bg-black/40 transition-colors cursor-pointer">
                 <span className="text-sm font-bold underline underline-offset-4">See All Photos</span>
               </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. MAIN CONTENT GRID (Left: Details, Right: Sticky Widget) */}
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          {/* LEFT COLUMN: SCROLLABLE CONTENT */}
          <div className="lg:col-span-2 space-y-12">
            
            {/* About */}
            <section className="bg-zinc-900/50 p-8 rounded-2xl border border-zinc-800">
              <h3 className="flex items-center gap-2 text-xl font-bold mb-4">
                <span className="text-emerald-500">ℹ️</span> About Venue
              </h3>
              <p className="text-zinc-400 leading-relaxed">
                {venue.description} The facility is equipped with state-of-the-art lighting and turf, ensuring a professional experience for every game. Ideal for tournaments, corporate events, and daily practice sessions.
              </p>
            </section>

            {/* Amenities Grid */}
            <section>
              <h3 className="text-xl font-bold mb-6">Amenities</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {/* Mock Amenities matching screenshot */}
                {[
                  { icon: Trophy, label: "Pro Turf" },
                  { icon: Car, label: "Parking" },
                  { icon: Zap, label: "Floodlights" },
                  { icon: Droplets, label: "Showers" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 p-4 rounded-xl bg-zinc-900/50 border border-zinc-800 text-zinc-300">
                    <item.icon className="h-5 w-5 text-emerald-500" />
                    <span className="text-sm font-medium">{item.label}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* Map Section */}
            <section>
              <h3 className="text-xl font-bold mb-6">Location</h3>
              <div className="relative w-full h-[300px] rounded-2xl overflow-hidden border border-zinc-800 bg-zinc-900">
                <iframe 
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3960.902932303566!2d79.8612430745672!3d6.902210893097063!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ae25963120b1509%3A0x2db2c18a59054c66!2sRoyal%20College%20Sports%20Complex!5e0!3m2!1sen!2slk!4v1709900000000!5m2!1sen!2slk" 
                  width="100%" 
                  height="100%" 
                  style={{ border: 0, filter: "invert(90%) hue-rotate(180deg)" }} 
                  allowFullScreen 
                  loading="lazy" 
                  referrerPolicy="no-referrer-when-downgrade"
                ></iframe>
                
                {/* Overlay Location Box from Screenshot */}
                <div className="absolute top-4 left-4 bg-white text-black p-3 rounded-lg shadow-xl max-w-[200px]">
                  <p className="text-xs font-bold mb-1">6°54'09.9"N 79°51'52.8"E</p>
                  <a href="#" className="text-[10px] text-blue-600 hover:underline">View larger map</a>
                </div>
              </div>
            </section>

          </div>

          {/* RIGHT COLUMN: STICKY WIDGET */}
          <div className="relative">
             <BookingWidget venue={venue} />
          </div>

        </div>
      </div>
    </main>
  );
}