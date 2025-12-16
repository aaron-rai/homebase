"use client";

import { useState } from "react";
import { ChevronDownIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface DateTimePickerProps {
	value?: Date;
	onChange?: (date: Date) => void;
}

export function DateTimePicker({ value, onChange }: DateTimePickerProps) {
	const [open, setOpen] = useState(false);
	const [date, setDate] = useState<Date | undefined>(value);
	const [hours, setHours] = useState(new Date().getHours());
	const [minutes, setMinutes] = useState(new Date().getMinutes());

	const combineDateTime = (newDate?: Date, newHours?: number, newMinutes?: number) => {
		const d = newDate || date;
		if (!d) return;

		const h = newHours ?? hours;
		const m = newMinutes ?? minutes;

		const combined = new Date(d);
		combined.setHours(h, m, 0, 0);
		onChange?.(combined);
	};

	return (
		<div className="flex gap-4">
			<div className="flex flex-col gap-3">
				<Label htmlFor="date-picker" className="px-1">
					Date
				</Label>
				<Popover open={open} onOpenChange={setOpen}>
					<PopoverTrigger asChild>
						<Button variant="outline" id="date-picker" className="w-32 justify-between font-normal">
							{date ? date.toLocaleDateString() : "Select date"}
							<ChevronDownIcon />
						</Button>
					</PopoverTrigger>
					<PopoverContent className="w-auto overflow-hidden p-0" align="start">
						<Calendar
							mode="single"
							selected={date}
							captionLayout="dropdown"
							onSelect={(date) => {
								setDate(date);
								setOpen(false);
								combineDateTime(date);
							}}
						/>
					</PopoverContent>
				</Popover>
			</div>
			<div className="flex flex-col gap-3">
				<Label htmlFor="time-picker" className="px-1">
					Time
				</Label>
				<Input
					type="time"
					id="time-picker"
					step="1"
					defaultValue={`${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`}
					className="bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
					onChange={(e) => {
						const [h, m] = e.target.value.split(":").map(Number);
						setHours(h);
						setMinutes(m);
						combineDateTime(undefined, h, m);
					}}
				/>
			</div>
		</div>
	);
}
