"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Avatar, AvatarImage, AvatarFallback } from "@radix-ui/react-avatar";
import { House, Plus, RotateCw, MessageCircle } from "lucide-react";
import { Toaster } from "@/components/ui/sonner";
import ExpenseFormModal from "@/components/expense-form-modal";
import Dashboard from "@/components/dashboard";
import DateRangePicker from "@/components/data-range-picker";
import UserSettingsSidebar from "@/components/user-settings-sidebar";

interface Expense {
	id: string;
	amount: number;
	date: string;
	description: string;
	category: string;
	categoryColor: string;
	categoryId: string;
	user: {
		id: string;
		name: string;
		email: string;
	};
}

interface User {
	id: string;
	name: string;
	email: string;
}

export default function HomePage() {
	const { data: session } = useSession();
	const router = useRouter();
	const searchParams = useSearchParams();
	const householdid = searchParams.get("household") || "";
	const [expenses, setExpenses] = useState<Expense[]>([]);
	const [users, setUsers] = useState<User[]>([]);
	const [selectedUser, setSelectedUser] = useState<string | null>(null);
	const [isSettingsSidebarOpen, setIsSettingsSidebarOpen] = useState(false);
	const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
	const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
	const user = session?.user;
	const [householdName, setHouseholdName] = useState<string>("");
	const [categories, setCategories] = useState<
		{ name: string; id: string; color: string; icon: string }[]
	>([]);

	const getInitialDateRange = () => {
		const now = new Date();
		const start = new Date(now.getFullYear(), now.getMonth(), 1);
		const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
		return {
			start: start.toISOString().split("T")[0],
			end: end.toISOString().split("T")[0],
		};
	};
	const [dateRange, setDateRange] = useState(getInitialDateRange());
	const fetchExpenses = useCallback(async () => {
		try {
			const response = await fetch(
				`/api/households/${householdid}/expenses?startDate=${dateRange.start}&endDate=${dateRange.end}`
			);
			if (!response.ok) {
				throw new Error("Failed to fetch expenses");
			}
			const data = await response.json();
			console.log("Fetched expenses:", data.expenses);
			setHouseholdName(data.household.name);
			return data.expenses;
		} catch (error) {
			console.error(error);
			toast.error("Error fetching expenses");
			return [];
		}
	}, [householdid, dateRange]);

	const fetchUsers = useCallback(async () => {
		try {
			const response = await fetch(`/api/households/${householdid}/members`);
			if (!response.ok) {
				throw new Error("Failed to fetch household members");
			}
			const data = await response.json();
			console.log("Fetched household members:", data.members);
			return data.members;
		} catch (error) {
			console.error(error);
			toast.error("Error fetching household members");
			return [];
		}
	}, [householdid]);

	const fetchCategories = useCallback(async () => {
		try {
			const response = await fetch("/api/categories");
			const data = await response.json();
			setCategories(data.categories);
			return data.categories;
		} catch (error) {
			console.error("Error fetching categories:", error);
			return [];
		}
	}, []);

	const filteredExpenses = selectedUser
		? expenses.filter((e) => e.user.id === selectedUser)
		: expenses;

	const handleAddExpense = async (expense: {
		amount: number;
		date: string;
		description: string;
		categoryId: string;
	}) => {
		const response = await fetch("/api/households/" + householdid + "/expenses", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(expense),
		});
		if (!response.ok) {
			toast.error("Failed to add expense");
			return;
		}
		await fetchExpenses().then(setExpenses);
		setIsExpenseModalOpen(false);
		toast.success("Expense added successfully");
	};

	const handleEditExpense = (expense: Expense) => {
		setEditingExpense(expense);
	};

	const handleUpdateExpense = async (updatedExpense: {
		amount: number;
		date: string;
		description: string;
		categoryId: string;
	}) => {
		const res = await fetch(`/api/expenses/${editingExpense?.id}`, {
			method: "PATCH",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(updatedExpense),
		});
		if (res.ok) {
			await fetchExpenses().then(setExpenses);
			setEditingExpense(null);
			toast.success("Expense updated successfully.");
		} else {
			const data = await res.json();
			const message =
				res.status === 403
					? "You can only edit your own expenses."
					: res.status === 404
						? "Expense not found."
						: res.status === 401
							? "You must be logged in to edit expenses."
							: data.error || "Failed to update expense. Please try again.";
			toast.error(message);
		}
	};

	const handleDeleteExpense = async (id: string) => {
		const res = await fetch(`/api/expenses/${id}`, { method: "DELETE" });
		if (res.ok) {
			setExpenses((prev) => prev.filter((e) => e.id !== id));
			toast.success("Expense deleted successfully.");
		} else {
			const data = await res.json();
			const message =
				res.status === 403
					? "You can only delete your own expenses."
					: res.status === 404
						? "Expense not found."
						: res.status === 401
							? "You must be logged in to delete expenses."
							: data.error || "Failed to delete expense. Please try again.";
			toast.error(message);
		}
	};

	const handleRefresh = async () => {
		toast.info("Refreshing Expenses");
		fetchExpenses().then(setExpenses);
		fetchUsers().then(setUsers);
	};

	useEffect(() => {
		const refreshData = () => {
			fetchExpenses().then(setExpenses);
			fetchUsers().then(setUsers);
			fetchCategories().then(setCategories);
		};

		refreshData(); // initial load — don't wait for the first tick
		const interval = setInterval(refreshData, 15000);
		return () => clearInterval(interval);
	}, [fetchExpenses, fetchUsers, fetchCategories]);

	return (
		<div className="bg-background min-h-screen">
			<Toaster position="top-right" />
			{/* Header */}
			<div className="bg-card border-border sticky top-0 z-50 border-b shadow-sm">
				<div className="flex items-center justify-between gap-2 p-3 sm:p-4">
					<Button
						size="icon"
						variant="ghost"
						onClick={() => {
							setIsSettingsSidebarOpen(true);
						}}
						className="hover:bg-accent/10 h-9 w-9 shrink-0 rounded-full sm:h-10 sm:w-10"
					>
						<Avatar className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full sm:h-9 sm:w-9">
							<AvatarImage />
							<AvatarFallback className="from-primary to-accent flex h-full w-full items-center justify-center bg-linear-to-br text-sm font-semibold text-white sm:text-base">
								{(user?.name || "User")
									.split(" ")
									.map((n) => n[0])
									.join("")
									.toUpperCase()}
							</AvatarFallback>
						</Avatar>
					</Button>
					<div className="min-w-0 flex-1">
						<h1 className="text-foreground text-md truncate font-bold sm:text-2xl">
							Expense Dashboard
						</h1>
						<p className="text-muted-foreground hidden text-xs sm:block sm:text-sm">
							Smart Expense Manager
						</p>
					</div>
					<div className="flex shrink-0 gap-1 sm:gap-2">
						<Button
							size="icon"
							variant="outline"
							onClick={() => router.back()}
							className="hover:bg-accent/90 h-9 w-9 cursor-pointer sm:h-10"
						>
							<House className="h-4 w-4 sm:h-5 sm:w-5" />
						</Button>
						<Button
							size="icon"
							variant="outline"
							onClick={() => console.log("Open support chat")}
							className="h-9 w-9 cursor-pointer sm:h-10"
							disabled={true}
						>
							<MessageCircle className="h-4 w-4 sm:h-5 sm:w-5" />
						</Button>
						<Button
							size="icon"
							variant="outline"
							onClick={() => handleRefresh()}
							className="h-9 w-9 cursor-pointer sm:h-10"
						>
							<RotateCw className="h-4 w-4 sm:h-5 sm:w-5" />
						</Button>
						<Button
							size="icon"
							variant="outline"
							onClick={() => setIsExpenseModalOpen(true)}
							className="hover:bg-accent/90 bg-primary dark:bg-primary-dark h-9 w-9 cursor-pointer sm:h-10"
						>
							<Plus className="h-4 w-4 sm:h-5 sm:w-5" />
						</Button>
					</div>
				</div>
			</div>
			{/* Main Content */}
			<main className="pb-8">
				<div className="bg-card border-border sticky top-14 z-40 border-b p-3 shadow-sm sm:top-16 sm:p-4">
					<div className="flex flex-row items-start justify-between gap-3 sm:flex-row sm:items-center sm:gap-4">
						<div>
							<p className="text-muted-foreground text-xs font-semibold tracking-wider uppercase sm:text-sm">
								Viewing: <span className="text-primary font-bold">{householdName}</span>
							</p>
						</div>
						<DateRangePicker
							startDate={dateRange.start}
							endDate={dateRange.end}
							onDateChange={(start, end) => setDateRange({ start, end })}
						/>
					</div>
				</div>
				<Dashboard
					expenses={filteredExpenses}
					selectedUser={selectedUser}
					onSelectUser={setSelectedUser}
					users={users}
					dateRange={dateRange}
					onDeleteExpense={handleDeleteExpense}
					onEditExpense={handleEditExpense}
				/>
			</main>
			<UserSettingsSidebar
				isOpen={isSettingsSidebarOpen}
				onClose={() => setIsSettingsSidebarOpen(false)}
			/>
			<ExpenseFormModal
				key={isExpenseModalOpen ? "open" : "closed"}
				isOpen={isExpenseModalOpen}
				onClose={() => setIsExpenseModalOpen(false)}
				onAdd={handleAddExpense}
				users={users.map((u) => u.name)}
				categories={categories}
			/>
			<ExpenseFormModal
				key={editingExpense?.id ?? "edit"}
				isOpen={!!editingExpense}
				onClose={() => setEditingExpense(null)}
				onAdd={handleUpdateExpense}
				initialData={editingExpense ?? undefined}
				users={users.map((u) => u.name)}
				categories={categories}
			/>
		</div>
	);
}
