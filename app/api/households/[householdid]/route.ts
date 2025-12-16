import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function DELETE(
	_request: Request,
	{ params }: { params: Promise<{ householdid: string }> }
) {
	const session = await getServerSession(authOptions);
	if (!session?.user?.id) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	try {
		const { householdid: id } = await params;

		if (!id) {
			return NextResponse.json({ error: "Household ID is required" }, { status: 400 });
		}

		// Check if the user is a member of the household
		const membership = await prisma.householdMember.findFirst({
			where: {
				householdId: id,
				userId: session.user.id,
			},
		});

		if (!membership) {
			return NextResponse.json({ error: "Not a member of this household" }, { status: 403 });
		}

		// Only allow deletion if the user is an admin
		const isAdmin = membership.role === "admin";
		if (!isAdmin) {
			return NextResponse.json({ error: "Only admins can delete the household" }, { status: 403 });
		}

		await prisma.household.delete({
			where: {
				id,
			},
		});

		return NextResponse.json({ message: "Household deleted successfully" });
	} catch (error: unknown) {
		console.error("Household deletion error:", error);
		return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
	}
}
