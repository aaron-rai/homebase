"use client";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";

interface DateRangePickerProps {
	startDate: string;
	endDate: string;
	onDateChange: (start: string, end: string) => void;
}

export default function DateRangePicker({
	startDate,
	endDate,
	onDateChange,
}: DateRangePickerProps) {
	const formatDate = (date: string) => {
		// Parse as local date by appending time component
		const d = new Date(date + "T00:00:00");
		return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
	};

	const toLocalDateString = (date: Date) => {
		const year = date.getFullYear();
		const month = String(date.getMonth() + 1).padStart(2, "0");
		const day = String(date.getDate()).padStart(2, "0");
		return `${year}-${month}-${day}`;
	};

	const handlePrevMonth = () => {
		const start = new Date(startDate + "T00:00:00");
		start.setMonth(start.getMonth() - 1);
		const end = new Date(endDate + "T00:00:00");
		end.setMonth(end.getMonth() - 1);
		onDateChange(toLocalDateString(start), toLocalDateString(end));
	};

	const handleNextMonth = () => {
		const start = new Date(startDate + "T00:00:00");
		start.setMonth(start.getMonth() + 1);
		const end = new Date(endDate + "T00:00:00");
		end.setMonth(end.getMonth() + 1);
		onDateChange(toLocalDateString(start), toLocalDateString(end));
	};

	const handlePrevDay = () => {
		const start = new Date(startDate + "T00:00:00");
		start.setDate(start.getDate() - 1);
		const end = new Date(endDate + "T00:00:00");
		end.setDate(end.getDate() - 1);
		onDateChange(toLocalDateString(start), toLocalDateString(end));
	};

	const handleNextDay = () => {
		const start = new Date(startDate + "T00:00:00");
		start.setDate(start.getDate() + 1);
		const end = new Date(endDate + "T00:00:00");
		end.setDate(end.getDate() + 1);
		onDateChange(toLocalDateString(start), toLocalDateString(end));
	};

	return (
		<div className="flex flex-wrap items-center gap-2 sm:flex-nowrap sm:gap-3">
			<Button
				variant="outline"
				size="sm"
				onClick={handlePrevMonth}
				className="h-8 w-8 shrink-0 bg-transparent p-0 sm:h-9 sm:w-9"
			>
				<ChevronsLeft className="h-4 w-4" />
			</Button>
			<Button
				variant="outline"
				size="sm"
				onClick={handlePrevDay}
				className="h-8 w-8 shrink-0 bg-transparent p-0 sm:h-9 sm:w-9"
			>
				<ChevronLeft className="h-4 w-4" />
			</Button>
			<div className="bg-secondary/50 border-border rounded-md border px-3 py-2 text-xs font-medium whitespace-nowrap sm:text-sm">
				{formatDate(startDate)} - {formatDate(endDate)}
			</div>
			<Button
				variant="outline"
				size="sm"
				onClick={handleNextDay}
				className="h-8 w-8 shrink-0 bg-transparent p-0 sm:h-9 sm:w-9"
			>
				<ChevronRight className="h-4 w-4" />
			</Button>
			<Button
				variant="outline"
				size="sm"
				onClick={handleNextMonth}
				className="h-8 w-8 shrink-0 bg-transparent p-0 sm:h-9 sm:w-9"
			>
				<ChevronsRight className="h-4 w-4" />
			</Button>
		</div>
	);
}
