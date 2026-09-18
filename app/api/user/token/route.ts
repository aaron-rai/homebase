import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateApiToken, hashApiToken } from "@/lib/api-token";

export async function GET() {
	const session = await getServerSession(authOptions);
	if (!session?.user.id) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const user = await prisma.user.findUnique({
		where: { id: session.user.id },
		select: { apiTokenHash: true },
	});

	return NextResponse.json({ hasToken: !!user?.apiTokenHash }, { status: 200 });
}

export async function POST() {
	const session = await getServerSession(authOptions);
	if (!session?.user.id) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const rawToken = generateApiToken();

	await prisma.user.update({
		where: { id: session.user.id },
		data: { apiTokenHash: hashApiToken(rawToken) },
	});

	return NextResponse.json({ apiToken: rawToken }, { status: 200 });
}
