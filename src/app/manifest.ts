import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "The Arena | Premium Sports Booking",
    short_name: "The Arena",
    description: "Book premium sports venues with ease.",
    start_url: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#000000",
    theme_color: "#000000",
    categories: ["sports", "lifestyle"],
    icons: [
      {
        src: "/logo.png",
        sizes: "any",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/logo.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    shortcuts: [
      {
        name: "Book a Court",
        short_name: "Book",
        description: "Browse and book sports venues",
        url: "/venues",
        icons: [{ src: "/logo.png", sizes: "96x96", type: "image/png" }],
      },
      {
        name: "My Bookings",
        short_name: "Bookings",
        description: "View your upcoming games",
        url: "/bookings",
        icons: [{ src: "/logo.png", sizes: "96x96", type: "image/png" }],
      },
    ],
  };
}
