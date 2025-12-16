import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
	request: Request,
	{ params }: { params: Promise<{ householdid: string }> }
) {
	const session = await getServerSession(authOptions);
	if (!session?.user?.id) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const { householdid } = await params;

	try {
		const { searchParams } = new URL(request.url);
		const startDate = searchParams.get("startDate");
		const endDate = searchParams.get("endDate");

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

		const expenses = await prisma.expenseHousehold.findMany({
			where: {
				householdId: householdid,
				...(startDate &&
					endDate && {
						expense: {
							date: {
								gte: new Date(startDate),
								lte: new Date(endDate),
							},
						},
					}),
			},
			include: {
				expense: {
					include: {
						category: true,
						user: {
							select: {
								id: true,
								name: true,
								email: true,
							},
						},
					},
				},
			},
			orderBy: {
				expense: {
					date: "desc",
				},
			},
		});

		const householdInfo = await prisma.household.findUnique({
			where: { id: householdid },
			select: {
				name: true,
			},
		});

		const formattedExpenses = expenses.map((expenseHousehold) => ({
			id: expenseHousehold.expense.id,
			amount: expenseHousehold.expense.amount,
			date: expenseHousehold.expense.date,
			description: expenseHousehold.expense.description,
			category: expenseHousehold.expense.category.name,
			categoryColor: expenseHousehold.expense.category.color,
			user: expenseHousehold.expense.user,
		}));

		return NextResponse.json(
			{ household: { name: householdInfo?.name }, expenses: formattedExpenses },
			{ status: 200 }
		);
	} catch (error) {
		console.error("Error fetching expenses:", error);
		return NextResponse.json({ error: "Failed to fetch expenses" }, { status: 500 });
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
		const body = await request.json();
		const { amount, date, description, categoryId } = body;

		if (!householdid || !amount || !date || !description || !categoryId) {
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

		const newExpense = await prisma.expense.create({
			data: {
				amount,
				date: new Date(date),
				description,
				categoryId,
				userId: session.user.id,
			},
		});

		await prisma.expenseHousehold.create({
			data: {
				expenseId: newExpense.id,
				householdId: householdid,
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
