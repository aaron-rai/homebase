import crypto from "crypto";
import { prisma } from "@/lib/prisma";

export async function generateUniqueInviteCode(): Promise<string> {
	// Generate a random 6-characer string (A-Z, 0-9)
	const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
	let inviteCode = "";
	for (let i = 0; i < 6; i++) {
		const randomIndex = crypto.randomInt(0, characters.length);
		inviteCode += characters[randomIndex];
	}
	// Check for uniqueness in the database
	const existingCode = await prisma.household.findUnique({
		where: { inviteCode },
	});

	if (existingCode) {
		return generateUniqueInviteCode(); // Recursively generate a new code if it already exists
	}

	return inviteCode;
}
