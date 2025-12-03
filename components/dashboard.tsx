"use client";
import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import ExpenseTable from "@/components/expense-table";

interface User {
	id: string;
	name: string;
	email: string;
}

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

interface DashboardProps {
	expenses: Expense[];
	selectedUser: string | null;
	onSelectUser: (userId: string | null) => void;
	users: User[];
	dateRange: { start: string; end: string };
}

export default function Dashboard({
	expenses,
	selectedUser,
	onSelectUser,
	users,
	dateRange,
}: DashboardProps) {
	const [chartType, setChartType] = useState<"bar" | "pie" | "donut" | "radial">("bar");

	const filteredByDateExpenses = useMemo(() => {
		return expenses.filter((e) => e.date >= dateRange.start && e.date <= dateRange.end);
	}, [expenses, dateRange]);

	const stats = useMemo(() => {
		const total = filteredByDateExpenses.reduce((sum, expense) => sum + expense.amount, 0);
		const byCategory: Record<string, number> = {};

		filteredByDateExpenses.forEach((expense) => {
			byCategory[expense.category] = (byCategory[expense.category] || 0) + expense.amount;
		});

		const topCategory = Object.entries(byCategory).sort(([, a], [, b]) => b - a)[0];

		return {
			total: `$${total.toFixed(2)}`,
			period: `${new Date(dateRange.start).toLocaleDateString("en-US", { month: "short", year: "numeric" })}`,
			average: (total / filteredByDateExpenses.length).toFixed(2),
			topCategory: topCategory ? topCategory[0] : "N/A",
			transactionCount: filteredByDateExpenses.length,
		};
	}, [filteredByDateExpenses, dateRange]);

	return (
		<div className="mx-auto max-w-7xl space-y-4 p-3 sm:space-y-6 sm:p-4">
			{/* User filter buttons */}
			<div className="-mx-3 flex gap-2 overflow-x-auto px-3 pb-2 sm:-mx-4 sm:px-4">
				<Button
					variant={selectedUser === null ? "default" : "outline"}
					onClick={() => onSelectUser(null)}
					className="h-8 text-xs whitespace-nowrap sm:h-10 sm:text-sm"
				>
					All Users
				</Button>
				{users.map((user) => (
					<Button
						key={user.id}
						variant={selectedUser === user.id ? "default" : "outline"}
						onClick={() => {
							onSelectUser(user.id);
						}}
						className="h-8 text-xs whitespace-nowrap sm:h-10 sm:text-sm"
					>
						{user.name}
					</Button>
				))}
			</div>

			{/* Chart card */}
			{/* Implement Chart */}

			{/* Stats cards */}
			<div className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
				<Card className="border-0 shadow-md transition-shadow hover:shadow-lg">
					<CardHeader className="p-3 pb-2 sm:p-4 sm:pb-3">
						<CardDescription className="text-muted-foreground text-xs font-medium">
							Period Total
						</CardDescription>
						<CardTitle className="mt-1 truncate text-xl font-bold sm:mt-2 sm:text-3xl">
							{stats.total}
						</CardTitle>
						<p className="text-muted-foreground mt-1 text-xs">{stats.period}</p>{" "}
						{/* Placeholder period */}
					</CardHeader>
				</Card>
				<Card className="border-0 shadow-md transition-shadow hover:shadow-lg">
					<CardHeader className="p-3 pb-2 sm:p-4 sm:pb-3">
						<CardDescription className="text-muted-foreground text-xs font-medium">
							Avg. Transaction
						</CardDescription>
						<CardTitle className="mt-1 truncate text-xl font-bold sm:mt-2 sm:text-3xl">
							${stats.average}
						</CardTitle>
						<p className="text-accent mt-1 text-xs">Calculated</p>
					</CardHeader>
				</Card>
				<Card className="border-0 shadow-md transition-shadow hover:shadow-lg">
					<CardHeader className="p-3 pb-2 sm:p-4 sm:pb-3">
						<CardDescription className="text-muted-foreground text-xs font-medium">
							Top Category
						</CardDescription>
						<CardTitle className="mt-1 truncate text-lg font-semibold sm:mt-2">
							{stats.topCategory}
						</CardTitle>
						<p className="text-muted-foreground mt-1 text-xs">Highest spend</p>
					</CardHeader>
				</Card>
				<Card className="border-0 shadow-md transition-shadow hover:shadow-lg">
					<CardHeader className="p-3 pb-2 sm:p-4 sm:pb-3">
						<CardDescription className="text-muted-foreground text-xs font-medium">
							Transactions
						</CardDescription>
						<CardTitle className="mt-1 truncate text-xl font-bold sm:mt-2 sm:text-3xl">
							{stats.transactionCount}
						</CardTitle>
						<p className="text-muted-foreground mt-1 text-xs">This period</p>
					</CardHeader>
				</Card>
			</div>

			{/* Expenses table */}
			<div className="mx-auto max-w-7xl space-y-4 p-3 sm:space-y-6 sm:p-4">
				<Card className="overflow-hidden border-0 shadow-lg">
					<CardHeader className="pb-3 sm:pb-4">
						<CardTitle className="text-lg sm:text-xl">Recent Transactions</CardTitle>
						<CardDescription className="text-xs sm:text-sm">
							Your latest expense entries
						</CardDescription>
					</CardHeader>
					<CardContent className="p-0 sm:p-6">
						<ExpenseTable expenses={filteredByDateExpenses} />
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
