import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashApiToken } from "@/lib/api-token";

export async function POST(request: Request) {
	const authHeader = request.headers.get("authorization");
	const rawToken = authHeader?.replace("Bearer ", "");
	if (!rawToken) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const user = await prisma.user.findUnique({
		where: { apiTokenHash: hashApiToken(rawToken) },
	});

	if (!user) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	try {
		const body = await request.json();
		const { amount, description, categoryId, householdName, date } = body;

		if (!amount || !description || !categoryId || !householdName) {
			return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
		}

		const membership = await prisma.householdMember.findFirst({
			where: {
				userId: user.id,
				household: { name: { equals: householdName, mode: "insensitive" } },
			},
			select: { householdId: true },
		});

		if (!membership) {
			return NextResponse.json(
				{ error: "Household not found or you are not a member" },
				{ status: 404 }
			);
		}

		const newExpense = await prisma.expense.create({
			data: {
				amount,
				date: date ? new Date(date) : new Date(),
				description,
				categoryId,
				userId: user.id,
			},
		});

		await prisma.expenseHousehold.create({
			data: {
				expenseId: newExpense.id,
				householdId: membership.householdId,
			},
		});

		return NextResponse.json(
			{ message: "Expense added successfully", expenseId: newExpense.id },
			{ status: 201 }
		);
	} catch (error) {
		console.error("Error adding expense:", error);
		return NextResponse.json({ error: "Failed to add expense" }, { status: 500 });
	}
}
