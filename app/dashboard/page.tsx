"use client";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import ExpenseTable from "@/components/expense-table";

interface Expense {
	id: string;
	category: string;
	categoryColor: string;
	amount: number;
	date: string;
	description: string;
	user: {
		id: string;
		name: string;
		email: string;
	};
	receipt?: string | null;
}

export default function Dashboard() {
	const { status, data: session } = useSession();
	const user = {
		name: session?.user?.name ?? "",
		email: session?.user?.email ?? "",
		id: session?.user?.id ?? "",
	};
	const searchParams = useSearchParams();
	const householdId = searchParams.get("household");
	const [expenses, setExpenses] = useState<Expense[]>([]);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		setIsLoading(true);
		if (status === "authenticated") {
			const loadExpenses = async () => {
				const data = await fetchExpenses(householdId || "");
				setExpenses(data);
			};

			loadExpenses();
		}
	}, [status, householdId]);

	const fetchExpenses = async (householdId: string) => {
		if (!householdId) return [];

		try {
			const response = await fetch("/api/expenses?householdId=" + householdId);
			if (!response.ok) {
				console.error("Failed to fetch expenses");
				return [];
			}
			const data = await response.json();
			return data.expenses;
		} catch (error) {
			console.error("Error fetching expenses:", error);
			return [];
		} finally {
			setIsLoading(false);
		}
	};

	if (isLoading) {
		return <div className="flex min-h-screen items-center justify-center">Loading...</div>;
	}
	return (
		<div className="mx-auto max-w-7xl space-y-4 p-3 sm:space-y-6 sm:p-4">
			<Card className="overflow-hidden border-0 shadow-lg">
				<CardHeader className="pb-3 sm:pb-4">
					<CardTitle className="text-lg sm:text-xl">Recent Transactions</CardTitle>
					<CardDescription className="text-xs sm:text-sm">
						Your latest expense entries
					</CardDescription>
				</CardHeader>
				<CardContent className="p-0 sm:p-6">
					<ExpenseTable expenses={expenses} user={user} />
				</CardContent>
			</Card>
		</div>
	);
}
