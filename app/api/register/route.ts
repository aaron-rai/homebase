import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
	console.log("Received registration request");

	try {
		const body = await request.json();
		console.log("Request body:", body);
		const { name, email, password } = body;

		if (!email || !password) {
			return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
		}
		const passwordHash = await bcrypt.hash(password, 12);
		const user = await prisma.user.create({
			data: {
				name,
				email,
				passwordHash,
			},
		});
		return NextResponse.json(
			{ user: { id: user.id, name: user.name, email: user.email } },
			{ status: 201 }
		);
	} catch (error: unknown) {
		if (error && typeof error === "object" && "code" in error && error.code === "P2002") {
			return NextResponse.json({ error: "User already exists" }, { status: 409 });
		}
		console.error("Registration error:", error);
		return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
	}
}
