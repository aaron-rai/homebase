import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import OnboardingClient from "./onboarding-client";

export default async function OnboardingPage() {
	const session = await getServerSession(authOptions);

	if (!session?.user) {
		redirect("/login"); //Server-side redirect to login if not authenticated
	}

	return <OnboardingClient />;
}
