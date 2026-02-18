import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function PATCH(
	request: Request,
	{ params }: { params: Promise<{ expenseId: string }> }
) {
	const session = await getServerSession(authOptions);
	if (!session?.user?.id) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const { expenseId } = await params;
	const expense = await prisma.expense.findUnique({ where: { id: expenseId } });

	if (!expense) {
		return NextResponse.json({ error: "Expense not found" }, { status: 404 });
	}

	if (expense.userId !== session.user.id) {
		return NextResponse.json({ error: "Not authorized to edit this expense" }, { status: 403 });
	}

	try {
		await prisma.expense.update({
			where: { id: expenseId },
			data: await request.json(),
		});
		return NextResponse.json({ message: "Expense updated successfully" }, { status: 200 });
	} catch (error) {
		console.error("Error updating expense:", error);
		return NextResponse.json({ error: "Failed to update expense" }, { status: 500 });
	}
}

export async function DELETE(
	request: Request,
	{ params }: { params: Promise<{ expenseId: string }> }
) {
	// 1. Get session, reject if unauthenticated
	const session = await getServerSession(authOptions);
	if (!session?.user?.id) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const { expenseId } = await params;

	const expense = await prisma.expense.findUnique({
		where: { id: expenseId },
	});

	if (!expense) {
		return NextResponse.json({ error: "Expense not found" }, { status: 404 });
	}

	if (expense?.userId === session.user.id) {
		try {
			await prisma.expense.delete({
				where: { id: expenseId },
			});
			return NextResponse.json({ message: "Expense deleted successfully" }, { status: 200 });
		} catch (error) {
			console.error("Error deleting expense:", error);
			return NextResponse.json({ error: "Failed to delete expense" }, { status: 500 });
		}
	} else {
		return NextResponse.json({ error: "Forbidden" }, { status: 403 });
	}
}
