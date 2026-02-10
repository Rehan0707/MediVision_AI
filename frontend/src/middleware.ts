import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
    function middleware(req) {
        const token = req.nextauth.token;
        const isAuth = !!token;
        const isAuthPage = req.nextUrl.pathname.startsWith("/auth");

        if (isAuthPage) {
            if (isAuth) {
                return NextResponse.redirect(new URL("/dashboard", req.url));
            }
            return null;
        }

        if (!isAuth) {
            let from = req.nextUrl.pathname;
            if (req.nextUrl.search) {
                from += req.nextUrl.search;
            }

            return NextResponse.redirect(
                new URL(`/auth?from=${encodeURIComponent(from)}`, req.url)
            );
        }

        // Role-based protection
        const role = (token as any).role?.toLowerCase();
        const path = req.nextUrl.pathname;

        if (path.startsWith("/dashboard/admin") && role !== "admin") {
            return NextResponse.redirect(new URL("/dashboard", req.url));
        }

        if (path.startsWith("/dashboard/doctor") && role !== "doctor") {
            return NextResponse.redirect(new URL("/dashboard", req.url));
        }
    },
    {
        callbacks: {
            authorized: ({ token }) => true, // Use custom logic inside middleware function
        },
    }
);

export const config = {
    matcher: ["/dashboard/:path*", "/auth"],
};
