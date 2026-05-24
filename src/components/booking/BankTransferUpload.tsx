"use client";

import { useState, useRef } from "react";
import { UploadSimple, CheckCircle, Warning, FileText, Image as ImageIcon, CircleNotch } from "@phosphor-icons/react";
import { bookingService } from "@/services/bookingService";
import { Booking } from "@/types";
import { useToast } from "@/components/ui/Toast";

interface BankTransferUploadProps {
    booking: Booking;
    onUploadSuccess: (updatedBooking: Booking) => void;
}

export default function BankTransferUpload({ booking, onUploadSuccess }: BankTransferUploadProps) {
    const { addToast } = useToast();
    const [file, setFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [reference, setReference] = useState("");
    const [uploading, setUploading] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const validateAndSetFile = (selectedFile: File) => {
        const validTypes = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
        if (!validTypes.includes(selectedFile.type)) {
            addToast("Unsupported file type. Please upload a JPG, PNG, WebP or PDF receipt.", "error");
            return;
        }
        
        const maxSize = 5 * 1024 * 1024; // 5MB
        if (selectedFile.size > maxSize) {
            addToast("Receipt size exceeds 5MB. Please upload a smaller file.", "error");
            return;
        }

        setFile(selectedFile);
        
        if (selectedFile.type.startsWith("image/")) {
            const url = URL.createObjectURL(selectedFile);
            setPreviewUrl(url);
        } else {
            setPreviewUrl(null); // PDF or other non-image
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            validateAndSetFile(e.dataTransfer.files[0]);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            validateAndSetFile(e.target.files[0]);
        }
    };

    const triggerFilePicker = () => {
        fileInputRef.current?.click();
    };

    const clearSelectedFile = () => {
        setFile(null);
        setPreviewUrl(null);
    };

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file) {
            addToast("Please select a bank receipt slip to upload.", "error");
            return;
        }
        if (!reference.trim()) {
            addToast("Please enter the transaction reference number.", "error");
            return;
        }

        setUploading(true);
        try {
            const updatedBooking = await bookingService.uploadBankTransferSlip(
                booking.id,
                file,
                reference.trim()
            );
            addToast("Bank transfer slip uploaded successfully! Venue will review it.", "success");
            onUploadSuccess(updatedBooking);
        } catch (error: any) {
            console.error(error);
            const errMsg = error.response?.data?.detail || "Failed to upload receipt slip. Please try again.";
            addToast(errMsg, "error");
        } finally {
            setUploading(false);
        }
    };

    return (
        <form onSubmit={handleUpload} className="bg-surface-raised/40 border border-default rounded-3xl p-6 md:p-8 space-y-6">
            <div>
                <h3 className="text-lg font-bold text-primary mb-1">Upload Payment Slip</h3>
                <p className="text-xs text-secondary leading-relaxed">
                    Please transfer the total booking amount and provide the transaction receipt below.
                </p>
            </div>

            {/* Dropzone */}
            <div
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                onClick={!file ? triggerFilePicker : undefined}
                className={`relative border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all duration-300 flex flex-col items-center justify-center min-h-[160px] ${
                    dragActive
                        ? "border-blue-500 bg-blue-500/5"
                        : file
                            ? "border-emerald-500/50 bg-emerald-500/5 cursor-default"
                            : "border-default hover:border-subtle hover:bg-surface-sunken/40"
                }`}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    accept=".jpg,.jpeg,.png,.webp,.pdf"
                    onChange={handleFileChange}
                    className="hidden"
                />

                {file ? (
                    <div className="w-full space-y-4 animate-in fade-in zoom-in-95">
                        {previewUrl ? (
                            <div className="relative w-32 h-32 mx-auto rounded-xl overflow-hidden border border-emerald-500/30 shadow-md">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={previewUrl}
                                    alt="Slip preview"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        ) : (
                            <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto">
                                <FileText size={32} className="text-emerald-400" />
                            </div>
                        )}
                        
                        <div className="space-y-1">
                            <p className="text-sm font-bold text-primary truncate max-w-xs mx-auto">{file.name}</p>
                            <p className="text-[10px] text-muted">{(file.size / (1024 * 1024)).toFixed(2)} MB · Ready to upload</p>
                        </div>

                        {!uploading && (
                            <button
                                type="button"
                                onClick={clearSelectedFile}
                                className="px-3 py-1 bg-surface-overlay border border-default text-xs text-secondary hover:text-primary rounded-lg transition-colors font-medium"
                            >
                                Change Receipt
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="space-y-3">
                        <div className="w-12 h-12 rounded-xl bg-surface-sunken flex items-center justify-center mx-auto border border-default">
                            <UploadSimple size={24} className="text-secondary" />
                        </div>
                        <div className="space-y-1">
                            <p className="text-sm font-bold text-primary">Drag & drop your slip here</p>
                            <p className="text-[11px] text-secondary">or <span className="text-emerald-400 font-bold hover:underline">browse files</span></p>
                        </div>
                        <p className="text-[10px] text-muted">Supports JPG, PNG, WebP, and PDF (Max 5MB)</p>
                    </div>
                )}
            </div>

            {/* Reference Number Field */}
            <div className="space-y-2">
                <label htmlFor="reference" className="block text-xs font-bold text-muted uppercase tracking-wider">
                    Transaction Reference Number
                </label>
                <input
                    id="reference"
                    type="text"
                    required
                    value={reference}
                    onChange={(e) => setReference(e.target.value)}
                    placeholder="e.g. TXN9876543210 or Bank Ref"
                    disabled={uploading}
                    className="w-full bg-surface-sunken border border-default hover:border-subtle focus:border-emerald-500 px-4 py-3 rounded-xl text-sm text-primary placeholder-faint transition-colors outline-none"
                />
            </div>

            {/* Submit Button */}
            <button
                type="submit"
                disabled={uploading || !file || !reference.trim()}
                className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-400 disabled:bg-surface-overlay disabled:text-muted disabled:border-default disabled:cursor-not-allowed border border-emerald-500 rounded-2xl text-black font-bold text-sm transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/10"
            >
                {uploading ? (
                    <>
                        <CircleNotch size={18} className="animate-spin" />
                        <span>Uploading Slip...</span>
                    </>
                ) : (
                    <span>Submit Slip & Request Verification</span>
                )}
            </button>
        </form>
    );
}
