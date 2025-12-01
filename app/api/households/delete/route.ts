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
		const { id } = body;

		if (!id) {
			return NextResponse.json({ error: "Household ID is required" }, { status: 400 });
		}

		await prisma.household.deleteMany({
			where: {
				id,
			},
		});

		return NextResponse.json({ message: "Households deleted successfully" });
	} catch (error: unknown) {
		console.error("Household deletion error:", error);
		return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
	}
}
