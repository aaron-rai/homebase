import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { generateUniqueInviteCode } from "@/lib/invite-code";

export async function POST(request: Request) {
	const session = await getServerSession(authOptions);
	if (!session?.user?.id) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	try {
		const body = await request.json();
		const { name } = body;

		if (!name) {
			return NextResponse.json({ error: "Household name is required" }, { status: 400 });
		}

		const inviteCode = await generateUniqueInviteCode();
		const newHousehold = await prisma.household.create({
			data: {
				name,
				inviteCode,
				members: {
					create: {
						userId: session.user.id,
						role: "admin",
					},
				},
			},
		});

		return NextResponse.json(
			{
				household: {
					id: newHousehold.id,
					name: newHousehold.name,
					inviteCode: newHousehold.inviteCode,
				},
			},
			{ status: 201 }
		);
	} catch (error: unknown) {
		console.error("Household creation error:", error);
		return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
	}
}
