"use client";
import { useState } from "react";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { LucideTrash, LucidePencil } from "lucide-react";
import { Button } from "./ui/button";

interface User {
	id: string;
	name: string;
	email: string;
}
interface Expense {
	id: string;
	category: string;
	categoryColor: string;
	categoryId: string;
	amount: number;
	date: string;
	description: string;
	user: User;
	receipt?: string | null;
}

interface ExpenseTableProps {
	expenses: Expense[];
	onDelete: (id: string) => Promise<void>;
	onEdit: (expense: Expense) => void;
}

const ITEMS_PER_PAGE = 20;

export default function ExpenseTable({ expenses, onDelete, onEdit }: ExpenseTableProps) {
	const [deletingId, setDeletingId] = useState<string | null>(null);

	const [currentPage, setCurrentPage] = useState(1);
	const totalPages = Math.ceil(expenses.length / ITEMS_PER_PAGE);
	const safePage = Math.min(currentPage, Math.max(1, totalPages));
	const startIndex = (safePage - 1) * ITEMS_PER_PAGE;
	const paginated = expenses.slice(startIndex, startIndex + ITEMS_PER_PAGE);

	const handleDelete = async (id: string) => {
		setDeletingId(id);
		await onDelete(id);
		setDeletingId(null);
	};

	if (expenses.length === 0) {
		return (
			<div className="text-muted-foreground py-6 text-center text-xs sm:py-8">
				No expenses yet. Add one to get started!
			</div>
		);
	}

	return (
		<div className="-m-2 overflow-x-auto sm:-m-6">
			{/* Mobile Cards */}
			<div className="space-y-3 p-4 sm:hidden">
				{paginated.map((expense) => (
					<div key={expense.id} className="bg-card rounded-xl border p-4 shadow-sm">
						{/* Top row: description + actions */}
						<div className="flex items-start justify-between gap-2">
							<span className="text-sm leading-tight font-semibold">{expense.description}</span>
							<div className="flex items-center justify-center gap-2">
								<LucidePencil
									className="h-4 w-4 cursor-pointer text-blue-500"
									onClick={() => onEdit(expense)}
								/>
								<AlertDialog>
									<AlertDialogTrigger asChild>
										<LucideTrash
											className={`mt-0.5 h-4 w-4 shrink-0 text-red-500 ${deletingId === expense.id ? "cursor-not-allowed opacity-40" : "cursor-pointer"}`}
										/>
									</AlertDialogTrigger>
									<AlertDialogContent className="max-w-md">
										<AlertDialogHeader>
											<AlertDialogTitle>Are you sure?</AlertDialogTitle>
											<AlertDialogDescription>
												This action cannot be undone. This will permanently delete the expense.
											</AlertDialogDescription>
										</AlertDialogHeader>
										<AlertDialogFooter>
											<AlertDialogCancel>Cancel</AlertDialogCancel>
											<AlertDialogAction
												onClick={() => deletingId === null && handleDelete(expense.id)}
											>
												Delete
											</AlertDialogAction>
										</AlertDialogFooter>
									</AlertDialogContent>
								</AlertDialog>
							</div>
						</div>
						{/* Middle row: amount + badge */}
						<div className="mt-2 flex items-center justify-between">
							<span className="text-lg font-bold">${expense.amount.toFixed(2)}</span>
							<Badge style={{ backgroundColor: expense.categoryColor }}>{expense.category}</Badge>
						</div>
						{/* Bottom row: user + date */}
						<div className="text-muted-foreground mt-2 flex items-center justify-between text-xs">
							<span>{expense.user.name}</span>
							<span>
								{new Date(expense.date).toLocaleDateString("en-US", {
									month: "short",
									day: "numeric",
									year: "numeric",
								})}
							</span>
						</div>
					</div>
				))}
			</div>

			{/* Desktop Table */}
			<div className="hidden min-w-max p-3 sm:block sm:min-w-full sm:p-6">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead className="sm:text-md text-sm font-bold">Description</TableHead>
							<TableHead className="sm:text-md text-sm font-bold">Category</TableHead>
							<TableHead className="sm:text-md text-sm font-bold">Amount</TableHead>
							<TableHead className="sm:text-md text-center text-sm font-bold">Date</TableHead>
							<TableHead className="sm:text-md text-center text-sm font-bold">User</TableHead>
							<TableHead className="sm:text-md text-center text-sm font-bold">Actions</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{paginated.map((expense) => (
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
								<TableCell className="text-center text-xs sm:text-sm">
									<div className="flex items-center justify-center gap-2">
										<LucidePencil
											className="h-4 w-4 cursor-pointer text-blue-500"
											onClick={() => onEdit(expense)}
										/>
										<AlertDialog>
											<AlertDialogTrigger asChild>
												<LucideTrash
													className={`h-4 w-4 text-red-500 ${deletingId === expense.id ? "cursor-not-allowed opacity-40" : "cursor-pointer"}`}
												/>
											</AlertDialogTrigger>
											<AlertDialogContent className="max-w-md">
												<AlertDialogHeader>
													<AlertDialogTitle>Are you sure?</AlertDialogTitle>
													<AlertDialogDescription>
														This action cannot be undone. This will permanently delete the expense.
													</AlertDialogDescription>
												</AlertDialogHeader>
												<AlertDialogFooter>
													<AlertDialogCancel>Cancel</AlertDialogCancel>
													<AlertDialogAction
														onClick={() => deletingId === null && handleDelete(expense.id)}
													>
														Delete
													</AlertDialogAction>
												</AlertDialogFooter>
											</AlertDialogContent>
										</AlertDialog>
									</div>
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</div>
			{/* Pagination Controls */}
			{totalPages > 1 && (
				<div className="flex items-center justify-between px-6 py-4 text-sm">
					<span className="text-muted-foreground">
						Page {safePage} of {totalPages}
					</span>
					<div className="flex gap-2">
						<Button
							variant="outline"
							size="sm"
							onClick={() => setCurrentPage((p) => p - 1)}
							disabled={safePage === 1}
						>
							Previous
						</Button>
						<Button
							variant="outline"
							size="sm"
							onClick={() => setCurrentPage((p) => p + 1)}
							disabled={safePage === totalPages}
						>
							Next
						</Button>
					</div>
				</div>
			)}
		</div>
	);
}
