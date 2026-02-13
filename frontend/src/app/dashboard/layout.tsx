import { Suspense } from "react";
import DashboardLayoutClient from "./DashboardLayoutClient";

// Force dynamic rendering to fix Vercel build error with useSearchParams
export const dynamic = "force-dynamic";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-[#00D1FF] font-black uppercase tracking-[0.3em] animate-pulse">Initializing Dashboard...</div>}>
            <DashboardLayoutClient>{children}</DashboardLayoutClient>
        </Suspense>
    );
}
