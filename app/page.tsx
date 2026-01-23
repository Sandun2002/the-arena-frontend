import Hero from "@/components/home/Hero";
import FeaturedVenues from "@/components/home/FeaturedVenues";

export default function Home() {
  return (
    <main className="min-h-screen bg-black">
      <Hero />
      <FeaturedVenues />
      
      {/* Simple Trust Section */}
      <section className="py-20 border-t border-zinc-900">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold text-white mb-12">TRUSTED BY ATHLETES</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 opacity-50 grayscale">
             {/* Placeholders for partner logos */}
             <div className="text-3xl font-bold text-zinc-500">NIKE</div>
             <div className="text-3xl font-bold text-zinc-500">ADIDAS</div>
             <div className="text-3xl font-bold text-zinc-500">PUMA</div>
             <div className="text-3xl font-bold text-zinc-500">UNDER ARMOUR</div>
          </div>
        </div>
      </section>
    </main>
  );
}