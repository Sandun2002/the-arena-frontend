import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Contact Us | The Arena",
    description:
        "Get in touch with The Arena team. Reach us by email, phone, or visit our headquarters in Dehiwala, Sri Lanka.",
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
