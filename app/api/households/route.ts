import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
	const session = await getServerSession(authOptions);
	if (!session?.user?.id) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}
	try {
		const memberships = await prisma.householdMember.findMany({
			where: { userId: session.user.id },
			include: {
				household: {
					include: {
						_count: {
							select: { members: true },
						},
					},
				},
			},
		});
		const households = memberships.map((membership) => ({
			id: membership.household.id,
			name: membership.household.name,
			inviteCode: membership.role === "admin" ? membership.household.inviteCode : undefined,
			memberCount: membership.household._count.members,
			role: membership.role,
		}));

		return NextResponse.json({ households }, { status: 200 });
	} catch (error) {
		console.error("Error fetching households:", error);
		return NextResponse.json({ error: "Failed to fetch households" }, { status: 500 });
	}
}
