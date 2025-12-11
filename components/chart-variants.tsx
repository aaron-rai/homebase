"use client";
import { useMemo } from "react";
import {
	BarChart,
	Bar,
	LineChart,
	Line,
	RadarChart,
	Radar,
	XAxis,
	YAxis,
	CartesianGrid,
	ResponsiveContainer,
	LabelList,
	PolarAngleAxis,
	PolarRadiusAxis,
	PolarGrid,
	RadialBarChart,
	RadialBar,
} from "recharts";

import {
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent,
	ChartLegend,
	ChartLegendContent,
} from "@/components/ui/chart";

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

interface ChartVariantsProps {
	expenses: Expense[];
	chartType: "bar" | "line" | "radar" | "radial";
}

const CHART_COLORS = [
	"var(--chart-1)",
	"var(--chart-2)",
	"var(--chart-3)",
	"var(--chart-4)",
	"var(--chart-5)",
];

export default function ChartVariants({ expenses, chartType }: ChartVariantsProps) {
	const chartData = useMemo(() => {
		const byCategory: Record<string, number> = {};
		expenses.forEach((expense) => {
			byCategory[expense.category] = (byCategory[expense.category] || 0) + expense.amount;
		});
		return Object.entries(byCategory)
			.map(([name, value]) => ({ name, value: Number.parseFloat(value.toFixed(2)) }))
			.sort((a, b) => b.value - a.value)
			.slice(0, 6);
	}, [expenses]);

	const radialChartData = useMemo(() => {
		const byCategory: Record<string, number> = {};
		expenses.forEach((expense) => {
			byCategory[expense.category] = (byCategory[expense.category] || 0) + expense.amount;
		});
		return Object.entries(byCategory)
			.map(([name, value], index) => ({
				name,
				value: Number.parseFloat(value.toFixed(2)),
				fill: CHART_COLORS[index % CHART_COLORS.length],
			}))
			.sort((a, b) => b.value - a.value)
			.slice(0, 5);
	}, [expenses]);

	const radialChartConfig = useMemo(() => {
		const config: Record<string, { label: string; color: string }> = {};
		radialChartData.forEach((item) => {
			config[item.name] = {
				label: item.name,
				color: item.fill,
			};
		});
		return config;
	}, [radialChartData]);

	if (chartType === "bar") {
		return (
			<ChartContainer
				config={{
					value: {
						label: "Amount Spent",
						color: "var(--chart-1)",
					},
				}}
				className="h-80 w-full"
			>
				<ResponsiveContainer width="100%" height="100%">
					<BarChart accessibilityLayer data={chartData}>
						<CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
						<XAxis dataKey="name" stroke="var(--muted-foreground)" style={{ fontSize: "12px" }} />
						<YAxis stroke="var(--muted-foreground)" style={{ fontSize: "12px" }} />
						<ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
						<Bar dataKey="value" fill="var(--chart-1)" radius={[8, 8, 0, 0]}>
							<LabelList position="top" offset={12} className="fill-foreground" fontSize={12} />
						</Bar>
					</BarChart>
				</ResponsiveContainer>
			</ChartContainer>
		);
	}

	if (chartType === "line") {
		return (
			<ChartContainer
				config={{
					value: {
						label: "Amount Spent",
						color: "var(--chart-2)",
					},
				}}
				className="h-80 w-full"
			>
				<ResponsiveContainer width="100%" height="100%">
					<LineChart accessibilityLayer data={chartData}>
						<CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
						<XAxis dataKey="name" stroke="var(--muted-foreground)" style={{ fontSize: "12px" }} />
						<YAxis stroke="var(--muted-foreground)" style={{ fontSize: "12px" }} />
						<ChartTooltip cursor={false} content={<ChartTooltipContent />} />
						<Line
							type="monotone"
							dataKey="value"
							stroke="var(--chart-2)"
							strokeWidth={2}
							dot={{ fill: "var(--chart-2)", r: 4 }}
							activeDot={{ r: 6 }}
						/>
					</LineChart>
				</ResponsiveContainer>
			</ChartContainer>
		);
	}

	if (chartType === "radar") {
		return (
			<ChartContainer
				config={{
					value: {
						label: "Amount Spent",
						color: "var(--chart-3)",
					},
				}}
				className="h-80 w-full"
			>
				<ResponsiveContainer width="100%" height="100%">
					<RadarChart accessibilityLayer data={chartData}>
						<PolarGrid stroke="var(--border)" />
						<PolarAngleAxis
							dataKey="name"
							stroke="var(--muted-foreground)"
							style={{ fontSize: "12px" }}
							tick={{ fill: "var(--muted-foreground)" }}
						/>
						<PolarRadiusAxis
							stroke="var(--border)"
							style={{ fontSize: "12px" }}
							tick={{ fill: "var(--muted-foreground)" }}
						/>
						<Radar
							name="Amount Spent"
							dataKey="value"
							stroke="var(--chart-3)"
							fill="var(--chart-3)"
							fillOpacity={0.6}
						/>
						<ChartTooltip cursor={false} content={<ChartTooltipContent />} />
					</RadarChart>
				</ResponsiveContainer>
			</ChartContainer>
		);
	}

	if (chartType === "radial") {
		return (
			<ChartContainer config={radialChartConfig} className="h-80 w-full">
				<RadialBarChart
					accessibilityLayer
					data={radialChartData}
					innerRadius={30}
					outerRadius={110}
					startAngle={90}
					endAngle={-270}
				>
					<ChartTooltip cursor={false} content={<ChartTooltipContent />} />
					<RadialBar dataKey="value" background>
						<LabelList
							position="insideStart"
							dataKey="value"
							className="fill-white capitalize mix-blend-luminosity"
							fontSize={11}
						/>
					</RadialBar>
					<ChartLegend content={<ChartLegendContent />} />
				</RadialBarChart>
			</ChartContainer>
		);
	}
}
