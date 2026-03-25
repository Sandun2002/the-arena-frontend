import { redirect } from "next/navigation";

// The /dashboard page has been consolidated into the profile page.
// Redirect all traffic to /profile.
export default function DashboardPage() {
    redirect("/profile");
}
