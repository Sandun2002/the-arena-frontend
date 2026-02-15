
"use client";

import DashboardLayout from "@/components/venue/DashboardLayout";

export default function VenueDashboardLayoutWrapper({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <DashboardLayout>
            {children}
        </DashboardLayout>
    );
}
