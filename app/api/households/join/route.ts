import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
	const session = await getServerSession(authOptions);
	if (!session?.user?.id) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	try {
		const body = await request.json();
		const { inviteCode } = body;

		if (!inviteCode) {
			return NextResponse.json({ error: "Invite code is required" }, { status: 400 });
		}
		// Find household by invite code
		const household = await prisma.household.findUnique({
			where: { inviteCode },
			include: {
				_count: {
					select: { members: true },
				},
			},
		});
		if (!household) {
			return NextResponse.json({ error: "Invalid invite code" }, { status: 404 });
		}
		// Add user to household members
		await prisma.householdMember.create({
			data: {
				householdId: household.id,
				userId: session.user.id,
				role: "member",
			},
		});

		return NextResponse.json(
			{
				household: {
					id: household.id,
					name: household.name,
					membersCount: household._count.members,
				},
			},
			{ status: 200 }
		);
	} catch (error: unknown) {
		console.error("Household join error:", error);
		return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
	}
}
