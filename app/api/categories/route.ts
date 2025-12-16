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
		const categories = await prisma.category.findMany({
			select: {
				id: true,
				name: true,
				color: true,
				icon: true,
			},
		});
		return NextResponse.json({ categories }, { status: 200 });
	} catch (error) {
		console.error("Error fetching categories:", error);
		return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
	}
}
