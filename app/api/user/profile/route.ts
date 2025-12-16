import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(request: Request) {
	try {
		const session = await getServerSession(authOptions);

		if (!session?.user?.id) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const { name } = await request.json();

		if (!name || typeof name !== "string" || name.trim().length === 0) {
			return NextResponse.json({ error: "Name is required" }, { status: 400 });
		}

		const updatedUser = await prisma.user.update({
			where: { id: session.user.id },
			data: { name: name.trim() },
			select: { id: true, name: true, email: true },
		});

		return NextResponse.json({ user: updatedUser }, { status: 200 });
	} catch (error) {
		console.error("Error updating user profile:", error);
		return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
	}
}
