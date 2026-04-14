"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { ArrowLeft, Save, Loader2, Camera, Upload, X } from "lucide-react";
import Button from "@/components/ui/Button";
import { useAuth } from "@/services/authContext";
import { playerService } from "@/services/playerService";
import TierFrame from "@/components/ui/TierFrame";
import { getTierFromXp } from "@/lib/tierUtils";
import { useToast } from "@/components/ui/Toast";

type FormData = {
    full_name: string;
    phone_number: string;
    bio: string;
};

export default function ProfileSettingsPage() {
    const router = useRouter();
    const { user, login } = useAuth();
    const { addToast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [previewImage, setPreviewImage] = useState<string | null>(user?.profile_image || null);
    const [uploadingAvatar, setUploadingAvatar] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);

    const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
        defaultValues: {
            full_name: user?.full_name || "",
            phone_number: user?.phone_number || "",
            bio: user?.bio || "",
        }
    });

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !user) return;

        // Simulate upload
        const objectUrl = URL.createObjectURL(file);
        setPreviewImage(objectUrl); // Immediate preview
        setUploadingAvatar(true);

        try {
            await playerService.updateAvatar(file);
            addToast("Avatar updated successfully", "success");
        } catch (error) {
            addToast("Failed to update avatar", "error");
            setPreviewImage(user.profile_image); // Revert
        } finally {
            setUploadingAvatar(false);
        }
    };

    const onSubmit = async (data: FormData) => {
        if (!user) return;
        setIsSubmitting(true);
        try {
            await playerService.updateProfile(data);
            addToast("Profile updated successfully", "success");
            router.refresh();
            setTimeout(() => router.push("/profile"), 500);
        } catch (error) {
            addToast("Failed to update profile", "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!user) return null;

    return (
        <main className="min-h-screen bg-black pt-24 pb-12 px-4 selection:bg-emerald-500/30">
            <div className="container mx-auto max-w-2xl">

                <Link href="/profile" className="inline-flex items-center text-sm font-medium text-zinc-500 hover:text-white mb-8 transition-colors group">
                    <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" /> Back to Profile
                </Link>

                <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-8 backdrop-blur-md shadow-2xl">
                    <h1 className="text-2xl font-bold text-white mb-8 flex items-center gap-3">
                        <span className="bg-emerald-500/10 p-2 rounded-xl text-emerald-500"><Edit2Icon className="w-6 h-6" /></span>
                        Edit Profile
                    </h1>

                    {/* Avatar Upload */}
                    <div className="flex items-center gap-6 mb-10 pb-10 border-b border-zinc-800/50">
                        <div
                            className="relative group cursor-pointer"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <TierFrame
                                tier={getTierFromXp(user.xp ?? 0)}
                                level={user.level ?? 1}
                                src={previewImage}
                                size="lg"
                                alt="Avatar"
                            />
                            {uploadingAvatar && (
                                <div className="absolute inset-0 rounded-full bg-black/60 flex items-center justify-center z-30">
                                    <Loader2 className="w-6 h-6 text-emerald-500 animate-spin" />
                                </div>
                            )}
                            <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-30">
                                <Upload className="w-8 h-8 text-white" />
                            </div>
                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                accept="image/*"
                                onChange={handleFileChange}
                            />
                        </div>
                        <div>
                            <p className="text-white font-bold mb-1">Profile Photo</p>
                            <p className="text-zinc-500 text-xs mb-3">Recommended 400x400px. JPG or PNG.</p>
                            <Button size="sm" variant="outline" onClick={() => fileInputRef.current?.click()}>
                                Change Photo
                            </Button>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Full Name</label>
                                <input
                                    {...register("full_name", { required: "Name is required" })}
                                    className="w-full bg-black/50 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50 outline-none transition-all"
                                    placeholder="e.g. Dilshan Perera"
                                />
                                {errors.full_name && <p className="text-red-500 text-xs mt-1">{errors.full_name.message}</p>}
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Phone Number</label>
                                <input
                                    {...register("phone_number", {
                                        pattern: { value: /^(?:\+94|0)[0-9]{2}[0-9]{7}$/, message: "Invalid SL phone format" }
                                    })}
                                    className="w-full bg-black/50 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50 outline-none transition-all"
                                    placeholder="+94 7X XXX XXXX"
                                />
                                {errors.phone_number && <p className="text-red-500 text-xs mt-1">{errors.phone_number.message}</p>}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Bio</label>
                            <textarea
                                {...register("bio")}
                                rows={5}
                                className="w-full bg-black/50 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50 outline-none transition-all resize-none"
                                placeholder="Tell other players about your favorite sports, skill level, and availability..."
                            />
                            <p className="text-xs text-zinc-600 text-right">Write a short bio to display on your profile.</p>
                        </div>

                        <div className="pt-6 flex items-center justify-end gap-4 border-t border-zinc-800/50 mt-8">
                            <Link href="/profile">
                                <Button type="button" variant="ghost" className="hover:bg-zinc-800 text-zinc-400 hover:text-white">Cancel</Button>
                            </Link>
                            <Button
                                type="submit"
                                disabled={isSubmitting}
                                className="bg-emerald-500 hover:bg-emerald-400 text-black font-bold px-8 shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_25px_rgba(16,185,129,0.5)] transition-all"
                            >
                                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                                Save Changes
                            </Button>
                        </div>

                    </form>
                </div>
            </div>
        </main>
    );
}

function Edit2Icon(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
        </svg>
    )
}
