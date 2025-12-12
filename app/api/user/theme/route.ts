import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const VALID_THEMES = ["light", "dark", "system"];

export async function PUT(request: Request) {
	try {
		const session = await getServerSession(authOptions);

		if (!session?.user?.id) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const { theme } = await request.json();

		if (!theme || !VALID_THEMES.includes(theme)) {
			return NextResponse.json(
				{ error: "Invalid theme. Must be 'light', 'dark', or 'system'" },
				{ status: 400 }
			);
		}

		const updatedUser = await prisma.user.update({
			where: { id: session.user.id },
			data: { theme },
			select: { id: true, theme: true },
		});

		return NextResponse.json({ theme: updatedUser.theme }, { status: 200 });
	} catch (error) {
		console.error("Error updating theme:", error);
		return NextResponse.json({ error: "Failed to update theme" }, { status: 500 });
	}
}

export async function GET() {
	try {
		const session = await getServerSession(authOptions);

		if (!session?.user?.id) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const user = await prisma.user.findUnique({
			where: { id: session.user.id },
			select: { theme: true },
		});

		if (!user) {
			return NextResponse.json({ error: "User not found" }, { status: 404 });
		}

		return NextResponse.json({ theme: user.theme }, { status: 200 });
	} catch (error) {
		console.error("Error fetching theme:", error);
		return NextResponse.json({ error: "Failed to fetch theme" }, { status: 500 });
	}
}
