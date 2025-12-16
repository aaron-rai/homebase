import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
	_request: Request,
	{ params }: { params: Promise<{ householdid: string }> }
) {
	const session = await getServerSession(authOptions);
	if (!session?.user?.id) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const { householdid } = await params;

	try {
		if (!householdid) {
			return NextResponse.json({ error: "householdId is required" }, { status: 400 });
		}

		const membership = await prisma.householdMember.findFirst({
			where: {
				householdId: householdid,
				userId: session.user.id,
			},
		});

		if (!membership) {
			return NextResponse.json({ error: "Not a member of this household" }, { status: 403 });
		}

		const recurringExpenses = await prisma.recurringExpense.findMany({
			where: {
				householdId: householdid,
			},
			select: {
				id: true,
				name: true,
				amount: true,
				frequency: true,
				categoryId: true,
				nextDueDate: true,
				isActive: true,
			},
		});

		return NextResponse.json({ recurringExpenses }, { status: 200 });
	} catch (error) {
		console.error("Error fetching recurring expenses:", error);
		return NextResponse.json(
			{ error: "An error occurred while fetching recurring expenses" },
			{ status: 500 }
		);
	}
}

export async function POST(
	request: Request,
	{ params }: { params: Promise<{ householdid: string }> }
) {
	const session = await getServerSession(authOptions);
	if (!session?.user?.id) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const { householdid } = await params;

	try {
		if (!householdid) {
			return NextResponse.json({ error: "householdId is required" }, { status: 400 });
		}
		const body = await request.json();
		const { name, amount, frequency, categoryId, nextDueDate } = body;

		if (!name || !amount || !frequency || !categoryId || !nextDueDate) {
			return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
		}

		const membership = await prisma.householdMember.findFirst({
			where: {
				householdId: householdid,
				userId: session.user.id,
			},
		});

		if (!membership) {
			return NextResponse.json({ error: "Not a member of this household" }, { status: 403 });
		}

		const newRecurringExpense = await prisma.recurringExpense.create({
			data: {
				name,
				amount,
				frequency,
				categoryId,
				householdId: householdid,
				nextDueDate: new Date(nextDueDate),
			},
		});

		return NextResponse.json({ recurringExpense: newRecurringExpense }, { status: 201 });
	} catch (error) {
		console.error("Error creating recurring expense:", error);
		return NextResponse.json(
			{ error: "An error occurred while creating recurring expense" },
			{ status: 500 }
		);
	}
}
