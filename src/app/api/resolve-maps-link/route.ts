import { NextRequest, NextResponse } from "next/server";

const ALLOWED_HOSTNAMES = ["maps.app.goo.gl", "goo.gl"];

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { url } = body;

        if (!url || typeof url !== "string") {
            return NextResponse.json({ error: "Missing url" }, { status: 400 });
        }

        // Security: only resolve known Google Maps short-link domains
        let parsed: URL;
        try {
            parsed = new URL(url);
        } catch {
            return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
        }

        const allowed = ALLOWED_HOSTNAMES.some(
            (h) => parsed.hostname === h || parsed.hostname.endsWith(`.${h}`)
        );
        if (!allowed) {
            return NextResponse.json(
                { error: "Only maps.app.goo.gl or goo.gl/maps links are accepted" },
                { status: 400 }
            );
        }

        // Follow the redirect without downloading the full page body
        const response = await fetch(url, {
            method: "GET",
            redirect: "manual",
            headers: {
                "User-Agent":
                    "Mozilla/5.0 (compatible; TheArenaLocationBot/1.0)",
            },
        });

        const location =
            response.headers.get("location") ||
            response.headers.get("Location");

        if (!location) {
            return NextResponse.json(
                { error: "Could not resolve short link — no redirect found" },
                { status: 422 }
            );
        }

        return NextResponse.json({ expandedUrl: location });
    } catch (error) {
        console.error("[resolve-maps-link]", error);
        return NextResponse.json(
            { error: "Failed to resolve link" },
            { status: 500 }
        );
    }
}
