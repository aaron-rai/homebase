import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
	console.log("Seeding database...");

	console.log("Seeding users...");
	const aaronHash = await bcrypt.hash("P@ssword1!", 10);
	const pronishaHash = await bcrypt.hash("P@ssword1!", 10);
	const aaron = await prisma.user.upsert({
		where: { email: "aaron@example.com" },
		update: {},
		create: {
			email: "aaron@example.com",
			name: "Aaron Rai",
			passwordHash: aaronHash,
			theme: "dark",
		},
	});
	const pronisha = await prisma.user.upsert({
		where: { email: "pronisha@example.com" },
		update: {},
		create: {
			email: "pronisha@example.com",
			name: "Pronisha Panta",
			passwordHash: pronishaHash,
			theme: "light",
		},
	});
	console.log("Users seeded.");

	console.log("Seeding Households...");
	const aaronHousehold = await prisma.household.upsert({
		where: { inviteCode: "12345" },
		update: {},
		create: {
			name: "Rai Family",
			inviteCode: "12345",
		},
	});
	const pronishaHousehold = await prisma.household.upsert({
		where: { inviteCode: "67890" },
		update: {},
		create: {
			name: "Panta Family",
			inviteCode: "67890",
		},
	});
	console.log("Households seeded.");

	console.log("Seeding Household Members...");
	await prisma.householdMember.createMany({
		data: [
			{
				userId: aaron.id,
				householdId: aaronHousehold.id,
				role: "admin",
			},
			{
				userId: pronisha.id,
				householdId: aaronHousehold.id,
				role: "member",
			},
			{
				userId: pronisha.id,
				householdId: pronishaHousehold.id,
				role: "admin",
			},
		],
		skipDuplicates: true,
	});
	console.log("Household Members seeded.");

	console.log("Seeding categories...");
	await prisma.category.createMany({
		data: [
			{ name: "Food", color: "#F87171" }, // Red
			{ name: "Utilities", color: "#60A5FA" }, // Blue
			{ name: "Entertainment", color: "#FBBF24" }, // Yellow
			{ name: "Transportation", color: "#34D399" }, // Green
			{ name: "Healthcare", color: "#A78BFA" }, // Purple
			{ name: "Education", color: "#F472B6" }, // Pink
			{ name: "Miscellaneous", color: "#9CA3AF" }, // Gray
		],
		skipDuplicates: true,
	});
	console.log("Categories seeded.");

	console.log("Seeding expenses and household expense relations...");
	const foodCategory = await prisma.category.findUnique({ where: { name: "Food" } });
	const utilitiesCategory = await prisma.category.findUnique({ where: { name: "Utilities" } });
	const entertainmentCategory = await prisma.category.findUnique({
		where: { name: "Entertainment" },
	});
	const transportationCategory = await prisma.category.findUnique({
		where: { name: "Transportation" },
	});
	const healthcareCategory = await prisma.category.findUnique({ where: { name: "Healthcare" } });
	const educationCategory = await prisma.category.findUnique({ where: { name: "Education" } });
	const miscellaneousCategory = await prisma.category.findUnique({
		where: { name: "Miscellaneous" },
	});
	await prisma.expense.create({
		data: {
			description: "Grocery Shopping",
			amount: 150.0,
			date: new Date(),
			categoryId: foodCategory!.id,
			userId: aaron.id,
			households: {
				create: [
					{
						householdId: aaronHousehold.id,
						isShared: true,
						splitRule: "equal",
					},
				],
			},
		},
	});

	await prisma.expense.create({
		data: {
			description: "Electricity Bill",
			amount: 75.5,
			date: new Date(),
			categoryId: utilitiesCategory!.id,
			userId: pronisha.id,
			households: {
				create: [
					{
						householdId: aaronHousehold.id,
						isShared: false,
						splitRule: "equal",
					},
				],
			},
		},
	});

	await prisma.expense.create({
		data: {
			description: "Movie Tickets",
			amount: 40.0,
			date: new Date(),
			categoryId: entertainmentCategory!.id,
			userId: aaron.id,
			households: {
				create: [
					{
						householdId: aaronHousehold.id,
						isShared: true,
						splitRule: "equal",
					},
				],
			},
		},
	});

	await prisma.expense.create({
		data: {
			description: "Bus Pass",
			amount: 60.0,
			date: new Date(),
			categoryId: transportationCategory!.id,
			userId: pronisha.id,
			households: {
				create: [
					{
						householdId: pronishaHousehold.id,
						isShared: false,
						splitRule: "equal",
					},
				],
			},
		},
	});

	await prisma.expense.create({
		data: {
			description: "Doctor Visit",
			amount: 120.0,
			date: new Date(),
			categoryId: healthcareCategory!.id,
			userId: aaron.id,
			households: {
				create: [
					{
						householdId: aaronHousehold.id,
						isShared: false,
						splitRule: "equal",
					},
				],
			},
		},
	});

	await prisma.expense.create({
		data: {
			description: "Online Course",
			amount: 200.0,
			date: new Date(),
			categoryId: educationCategory!.id,
			userId: pronisha.id,
			households: {
				create: [
					{
						householdId: pronishaHousehold.id,
						isShared: true,
						splitRule: "equal",
					},
				],
			},
		},
	});

	await prisma.expense.create({
		data: {
			description: "Gift Shopping",
			amount: 80.0,
			date: new Date(),
			categoryId: miscellaneousCategory!.id,
			userId: aaron.id,
			households: {
				create: [
					{
						householdId: pronishaHousehold.id,
						isShared: true,
						splitRule: "equal",
					},
				],
			},
		},
	});

	console.log("Seeding completed.");
}

main()
	.catch((e) => {
		console.error(e);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
