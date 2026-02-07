"use client";

import { AuthProvider } from "@/services/authContext";
import { ReactNode } from "react";

export default function Providers({ children }: { children: ReactNode }) {
    return <AuthProvider>{children}</AuthProvider>;
}
