import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request: Request, { params }: { params: Promise<{ householdid: string }> }) {
	const session = await getServerSession(authOptions);
	if (!session?.user?.id) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const { householdid } = await params;

	try {
		const members = await prisma.householdMember.findMany({
			where: {
				householdId: householdid,
			},
			include: {
				user: {
					select: {
						id: true,
						name: true,
						email: true,
					},
				},
			},
		});

		return NextResponse.json({ members: members.map((m) => m.user) });
	} catch (error) {
		console.error("Error fetching household members:", error);
		return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
	}
}
