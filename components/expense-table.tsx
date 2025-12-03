"use client";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

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
	user: User;
	receipt?: string | null;
}

interface ExpenseTableProps {
	expenses: Expense[];
}

export default function ExpenseTable({ expenses }: ExpenseTableProps) {
	if (expenses.length === 0) {
		return (
			<div className="text-muted-foreground py-6 text-center text-xs sm:py-8">
				No expenses yet. Add one to get started!
			</div>
		);
	}

	return (
		<div className="-m-3 overflow-x-auto sm:-m-6">
			<div className="min-w-max p-3 sm:min-w-full sm:p-6">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead className="sm:text-md text-sm font-bold">Description</TableHead>
							<TableHead className="sm:text-md text-sm font-bold">Category</TableHead>
							<TableHead className="sm:text-md text-sm font-bold">Amount</TableHead>
							<TableHead className="sm:text-md text-center text-sm font-bold">Date</TableHead>
							<TableHead className="sm:text-md text-center text-sm font-bold">User</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{expenses.map((expense) => (
							<TableRow key={expense.id}>
								<TableCell className="text-xs font-medium sm:text-sm">
									{expense.description}
								</TableCell>
								<TableCell>
									<Badge className="text-xs" style={{ backgroundColor: expense.categoryColor }}>
										{expense.category}
									</Badge>
								</TableCell>
								<TableCell className="text-xs font-semibold sm:text-sm">
									${expense.amount.toFixed(2)}
								</TableCell>
								<TableCell className="text-muted-foreground text-center text-xs sm:text-sm">
									{new Date(expense.date)
										.toLocaleString("en-US", {
											year: "numeric",
											month: "2-digit",
											day: "2-digit",
											hour: "2-digit",
											minute: "2-digit",
											second: "2-digit",
											hour12: false,
										})
										.replace(",", "")}
								</TableCell>
								<TableCell className="text-center text-xs sm:text-sm">
									{expense.user.name}
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</div>
		</div>
	);
}
