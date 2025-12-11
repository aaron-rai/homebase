"use clent";

import { Button } from "@/components/ui/button";
import { ChartBarIncreasing, ChartLine, Radar, GaugeCircle } from "lucide-react";

type ChartType = "bar" | "line" | "radar" | "radial";

interface ChartSelectorProps {
	selectedChart: ChartType;
	onSelectChart: (chart: ChartType) => void;
}

export default function ChartSelector({ selectedChart, onSelectChart }: ChartSelectorProps) {
	const charts: { type: ChartType; label: string; icon: React.ReactNode }[] = [
		{ type: "bar", label: "Bar Chart", icon: <ChartBarIncreasing className="h-4 w-4" /> },
		{ type: "line", label: "Line Chart", icon: <ChartLine className="h-4 w-4" /> },
		{ type: "radar", label: "Radar Chart", icon: <Radar className="h-4 w-4" /> },
		{ type: "radial", label: "Radial Chart", icon: <GaugeCircle className="h-4 w-4" /> },
	];

	return (
		<div className="flex flex-wrap gap-2">
			{charts.map((chart) => (
				<Button
					key={chart.type}
					variant={selectedChart === chart.type ? "default" : "outline"}
					size="sm"
					onClick={() => onSelectChart(chart.type)}
					className="gap-2"
				>
					{chart.icon}
					{chart.label}
				</Button>
			))}
		</div>
	);
}
