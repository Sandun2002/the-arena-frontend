
"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Plus, Trash2, Image as ImageIcon, Move, Star, Loader2, UploadCloud } from "lucide-react";
import gsap from "gsap";
import Button from "@/components/ui/Button";
import { useAuth } from "@/services/authContext";
import { centerService } from "@/services/centerService";
import { GalleryImage } from "@/types";
import { useToast } from "@/components/ui/Toast";
import { useVenue } from "@/components/venue/VenueContext";

export default function GalleryPage() {
    const { user } = useAuth();
    const { currentVenue } = useVenue();
    const { addToast } = useToast();
    const containerRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [images, setImages] = useState<GalleryImage[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    useEffect(() => {
        if (currentVenue) {
            loadGallery();
        }
    }, [currentVenue]);

    const loadGallery = async () => {
        if (!currentVenue) return;
        setIsLoading(true);
        try {
            const data = await centerService.getGallery(currentVenue.id);
            setImages(data || []);
            animateGallery();
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const animateGallery = () => {
        // Simple animation refresh
        const ctx = gsap.context(() => {
            gsap.fromTo(".gallery-item",
                { scale: 0.9, opacity: 0 },
                { scale: 1, opacity: 1, duration: 0.5, stagger: 0.05, ease: "back.out(1.5)" }
            );
        }, containerRef);
        return () => ctx.revert();
    };

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0 || !currentVenue) return;

        const file = e.target.files[0];
        // Validate size (e.g., 5MB)
        if (file.size > 5 * 1024 * 1024) {
            addToast("File is too large (max 5MB)", "error");
            return;
        }

        setIsUploading(true);
        try {
            await centerService.uploadGalleryImage(file, currentVenue.id);
            addToast("Image uploaded", "success");
            loadGallery();
        } catch (error) {
            addToast("Failed to upload image", "error");
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    const handleDelete = async (imageId: string) => {
        if (!confirm("Delete this image?")) return;
        try {
            await centerService.deleteGalleryImage(imageId);
            addToast("Image deleted", "success");
            setImages(prev => prev.filter(img => img.id !== imageId));
        } catch (error) {
            addToast("Failed to delete image", "error");
        }
    };

    if (!user) return null;

    if (!currentVenue) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
                <ImageIcon className="w-12 h-12 text-zinc-600 mb-4" />
                <h2 className="text-xl font-bold text-white mb-2">No Venue Selected</h2>
                <p className="text-zinc-400">Please select a venue to manage gallery.</p>
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-black pt-24 pb-20 relative overflow-hidden" ref={containerRef}>
            {/* Background Effects */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-pink-500/5 rounded-full blur-[150px]" />
            </div>

            <div className="container mx-auto px-4 max-w-7xl relative z-10">

                <div className="page-header flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-4">
                    <div>
                        <h1 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tight mb-2">
                            Venue <span className="text-transparent bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text">Gallery</span>
                        </h1>
                        <p className="text-zinc-400">Showcase {currentVenue.name}. High-quality images attract more players.</p>
                    </div>
                    <div>
                        <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            accept="image/png, image/jpeg, image/webp"
                            onChange={handleFileSelect}
                        />
                        <Button
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isUploading}
                            className="bg-white text-black hover:bg-zinc-200 font-bold shadow-[0_0_20px_rgba(255,255,255,0.2)]"
                        >
                            {isUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UploadCloud className="mr-2 h-4 w-4" />}
                            {isUploading ? "Uploading..." : "Upload Photos"}
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {/* Add New Placeholder handled by header button, but could be here too if empty */}

                    {isLoading ? (
                        [1, 2, 3, 4].map(i => <div key={i} className="aspect-square bg-zinc-900/50 rounded-3xl animate-pulse" />)
                    ) : images.length === 0 ? (
                        <div
                            onClick={() => fileInputRef.current?.click()}
                            className="aspect-square rounded-3xl border-2 border-dashed border-zinc-800 bg-zinc-900/20 hover:bg-zinc-900/40 hover:border-pink-500/50 transition-all flex flex-col items-center justify-center cursor-pointer group col-span-1"
                        >
                            <div className="w-16 h-16 rounded-full bg-zinc-800 group-hover:bg-pink-600/20 text-zinc-500 group-hover:text-pink-500 flex items-center justify-center mb-4 transition-colors">
                                <Plus className="h-8 w-8" />
                            </div>
                            <span className="text-sm font-bold text-zinc-400 group-hover:text-white">Add First Photo</span>
                        </div>
                    ) : (
                        images.map((img) => (
                            <div key={img.id} className="gallery-item group relative aspect-square rounded-3xl overflow-hidden bg-zinc-900 border border-zinc-800">
                                <Image
                                    src={img.url}
                                    alt="Gallery Image"
                                    fill
                                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                                    unoptimized // Depending on image source
                                />

                                {/* Overlay Gradient */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                                {/* Controls */}
                                <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 translate-y-2 group-hover:translate-y-0">
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleDelete(img.id); }}
                                        className="p-2 rounded-full bg-black/60 text-white hover:bg-red-500/80 backdrop-blur-sm transition-colors"
                                        title="Delete"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>

                                <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 translate-y-2 group-hover:translate-y-0">
                                    {img.is_cover && (
                                        <span className="bg-emerald-500 text-black text-[10px] font-bold px-2 py-1 rounded-md flex items-center gap-1 shadow-lg shadow-emerald-500/20">
                                            <Star className="h-3 w-3 fill-black" /> Cover
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <div className="mt-8 text-center">
                    <p className="text-xs text-zinc-500">
                        High resolution images (max 5MB). JPG, PNG, WEBP supported.
                    </p>
                </div>
            </div>
        </main>
    );
}
