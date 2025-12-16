"use client";

import type React from "react";
import { useState, useRef } from "react";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { toast, Toaster } from "sonner";
import { Camera, Loader2 } from "lucide-react";
import { DateTimePicker } from "./date-time-picker";

interface AddExpenseModalProps {
	isOpen: boolean;
	onClose: () => void;
	onAdd: (expense: {
		amount: number;
		date: string;
		description: string;
		categoryId: string;
	}) => void;
	users: string[];
	categories?: { name: string; id: string; color: string; icon: string }[];
}

export default function AddExpenseModal({
	isOpen,
	onClose,
	onAdd,
	users,
	categories,
}: AddExpenseModalProps) {
	const defaultUser = users[0] || "";

	const [formData, setFormData] = useState({
		description: "",
		amount: "",
		date: new Date().toISOString().split("T")[0],
		category: categories?.[0] || { name: "", id: "", color: "", icon: "" },
		user: defaultUser,
	});
	const [receipt, setReceipt] = useState<string | null>(null);
	const [isCameraLoading, setIsCameraLoading] = useState(false);
	const fileInputRef = useRef<HTMLInputElement>(null);
	const cameraInputRef = useRef<HTMLInputElement>(null);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (!formData.description || !formData.amount || !formData.category.id) {
			toast.error("Please fill in all required fields.");
			return;
		}
		onAdd({
			description: formData.description,
			amount: parseFloat(formData.amount),
			date: formData.date,
			categoryId: formData.category.id,
		});
	};

	const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			const reader = new FileReader();
			reader.onload = (event) => {
				setReceipt(event.target?.result as string);
			};
			reader.readAsDataURL(file);
		}
	};

	return (
		<Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
			<Toaster position="top-right" />
			<DialogContent className="max-wd-md w-full">
				<DialogHeader>
					<DialogTitle>Add New Expense</DialogTitle>
					<DialogDescription>Track a new expense with optional receipt </DialogDescription>
				</DialogHeader>

				<form onSubmit={handleSubmit} className="space-y-4">
					{/* Description */}
					<div className="space-y-2">
						<Label htmlFor="description">Description</Label>
						<Input
							id="description"
							placeholder="e.g., Grocery shopping"
							value={formData.description}
							onChange={(e) => setFormData({ ...formData, description: e.target.value })}
						/>
					</div>
					{/* Amount */}
					<div className="space-y-2">
						<Label htmlFor="amount">Amount</Label>
						<Input
							id="amount"
							type="number"
							step="0.01"
							placeholder="0.00"
							value={formData.amount}
							onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
						/>
					</div>
					{/* Category */}
					<div className="space-y-2">
						<Label htmlFor="category">Category</Label>
						<Select
							value={formData.category.id}
							onValueChange={(value) => {
								const selectedCategory = categories?.find((cat) => cat.id === value);
								if (selectedCategory) {
									setFormData({ ...formData, category: selectedCategory });
								}
							}}
						>
							<SelectTrigger id="category">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								{categories?.map((category) => (
									<SelectItem key={category.name} value={category.id}>
										{category.name}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					{/* User */}
					<div className="space-y-2">
						<Label htmlFor="user">User</Label>
						<Select
							value={formData.user}
							onValueChange={(value) => setFormData({ ...formData, user: value })}
						>
							<SelectTrigger id="user">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								{users.map((user) => (
									<SelectItem key={user} value={user}>
										{user}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					{/* Date and Time */}
					<div className="space-y-2">
						<DateTimePicker
							value={new Date(formData.date)}
							onChange={(date) => setFormData({ ...formData, date: date.toISOString() })}
						/>
					</div>

					{/* Receipt Upload */}
					<div className="space-y-2">
						<Label>Receipt (optional)</Label>
						<div className="flex gap-2">
							<Button
								type="button"
								variant="outline"
								className="flex-1 bg-transparent"
								onClick={() => cameraInputRef.current?.click()}
								disabled={isCameraLoading}
							>
								{isCameraLoading ? (
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
								) : (
									<Camera className="mr-2 h-4 w-4" />
								)}
								Camera
							</Button>
							<Button
								type="button"
								variant="outline"
								className="flex-1 bg-transparent"
								onClick={() => fileInputRef.current?.click()}
							>
								Upload
							</Button>
						</div>
						<input
							ref={fileInputRef}
							type="file"
							accept="image/*"
							className="hidden"
							onChange={handleFileUpload}
						/>
						<input
							ref={cameraInputRef}
							type="file"
							accept="image/*"
							capture="environment"
							className="hidden"
							onChange={handleFileUpload}
						/>
						{receipt && (
							<div className="bg-muted relative h-32 w-full overflow-hidden rounded-lg">
								<img
									src={receipt || "/placeholder.svg"}
									alt="Receipt"
									className="h-full w-full object-cover"
								/>
								<button
									type="button"
									onClick={() => setReceipt(null)}
									className="absolute top-1 right-1 rounded-full bg-red-500 p-1 text-white hover:bg-red-600"
								>
									✕
								</button>
							</div>
						)}
					</div>
					{/* Submit Buttons */}
					<div className="flex gap-2 pt-4">
						<Button
							type="button"
							variant="outline"
							className="flex-1 bg-transparent"
							onClick={onClose}
						>
							Cancel
						</Button>
						<Button type="submit" className="bg-primary hover:bg-primary/90 flex-1">
							Add Expense
						</Button>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	);
}
