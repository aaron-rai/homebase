"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast, Toaster } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
	ContextMenu,
	ContextMenuContent,
	ContextMenuItem,
	ContextMenuTrigger,
	ContextMenuShortcut,
} from "@/components/ui/context-menu";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Home, Users, User, ArrowRight, AlertCircle, MessageCircle } from "lucide-react";
import UserSettingsSidebar from "@/components/user-settings-sidebar";

type ModalType = null | "create-household" | "join-household";

interface Household {
	id: string;
	name: string;
	inviteCode: string;
	memberCount?: number;
	role?: string;
}

export default function OnboardingPage() {
	const { data: session, status } = useSession();
	const [openModal, setOpenModal] = useState<ModalType>(null);
	const [householdName, setHouseholdName] = useState("");
	const [inviteCode, setInviteCode] = useState("");
	const [error, setError] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [isSettingsSidebarOpen, setIsSettingsSidebarOpen] = useState(false);
	const [households, setHouseholds] = useState<Household[]>([]);
	const router = useRouter();
	const user = session?.user;

	const handleSelectHousehold = (householdId: string) => {
		router.push(`/?household=${householdId}`);
	};

	const fetchHouseholds = async () => {
		try {
			const response = await fetch("/api/households");
			if (!response.ok) {
				throw new Error("Failed to fetch households");
			}
			const data = await response.json();
			console.log("Fetched households:", data.households);
			setHouseholds(data.households);
		} catch (error) {
			toast.error("Error fetching households");
			console.error("Fetch households error:", error);
		} finally {
			setIsLoading(false);
		}
	};

	const handleCreateHousehold = async () => {
		if (!householdName.trim()) {
			setError("Please enter a household name");
			return;
		}

		setIsLoading(true);
		setError("");

		try {
			const response = await fetch("/api/households/create", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ name: householdName }),
			});

			const data = await response.json();
			if (!response.ok) {
				throw new Error(data.error || "Failed to create household");
			}

			toast.success("Household created successfully!");
			setOpenModal(null);
			setHouseholdName("");
			await fetchHouseholds();
		} catch (error) {
			const message = error instanceof Error ? error.message : "Failed to create household";
			setError(message);
			toast.error(message);
		} finally {
			setIsLoading(false);
		}
	};

	const handleJoinHousehold = async () => {
		if (!inviteCode.trim() || inviteCode.length !== 6) {
			setError("Please enter a valid 6-digit invite code");
			return;
		}

		setIsLoading(true);
		setError("");

		try {
			const response = await fetch("/api/households/join", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ inviteCode }),
			});
			const data = await response.json();
			if (!response.ok) {
				throw new Error(data.error || "Failed to join household");
			}

			toast.success("Successfully joined household!");
			setOpenModal(null);
			setInviteCode("");
			await fetchHouseholds();
		} catch (error) {
			const message = error instanceof Error ? error.message : "Failed to join household";
			setError(message);
			toast.error(message);
		} finally {
			setIsLoading(false);
		}
	};

	const handleDeleteHousehold = async (householdId: string) => {
		try {
			const response = await fetch("/api/households/delete", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ id: householdId }),
			});

			const data = await response.json();
			if (!response.ok) {
				toast.warning("Failed to delete household");
				throw new Error(data.error || "Failed to delete household");
			}

			toast.success("Household deleted successfully!");
			await fetchHouseholds();
		} catch (error) {
			const message = error instanceof Error ? error.message : "Failed to delete household";
			toast.error(message);
		}
	};

	const handleOpenInNewTab = (householdId: string) => {
		window.open(`/?household=${householdId}`, "_blank");
	};

	// Fetch households once authenticated
	useEffect(() => {
		if (status === "loading") return;
		if (status === "authenticated") {
			fetchHouseholds();
		} else {
			router.push("/login");
		}
	}, [status, router]);

	if (status === "loading") {
		return (
			<div className="flex min-h-screen items-center justify-center">
				<p className="text-muted-foreground">Loading...</p>
			</div>
		);
	}

	const hasHouseholds = households.length > 0;

	return (
		<>
			<div className="from-background via-background to-secondary/20 min-h-screen bg-linear-to-br">
				<Toaster position="top-right" />
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
							<h1 className="text-foreground truncate text-lg font-bold sm:text-2xl">
								HomeBase Dashboard
							</h1>
							<p className="text-muted-foreground hidden text-xs sm:block sm:text-sm">
								Smart Expense Manager
							</p>
						</div>
						<div className="flex shrink-0 gap-1 sm:gap-2">
							<Button
								size="icon"
								variant="outline"
								onClick={() => console.log("Open support chat")}
								className="h-9 w-9 cursor-pointer sm:h-10"
								disabled={true}
							>
								<MessageCircle className="h-4 w-4 sm:h-5 sm:w-5" />
							</Button>
						</div>
					</div>
				</div>
				{/* Main Content */}
				<div className="flex min-h-[calc(100vh-64px)] items-center justify-center p-4 sm:min-h-[calc(100vh-80px)]">
					<div className="w-full max-w-2xl">
						{/* Header */}
						<div className="mb-8 text-center">
							<h1 className="from-primary to-accent mb-2 bg-linear-to-r bg-clip-text text-3xl font-bold text-transparent md:text-4xl">
								Your Households
							</h1>
							<p className="text-muted-foreground mb-6">
								{hasHouseholds
									? "Select a household to manage"
									: "Get started with your first household"}
							</p>
						</div>
						{/* Existing Households Section */}
						<div className="mb-8">
							<h2 className="text-muted-foreground mb-3 text-left text-sm font-semibold tracking-wide uppercase">
								Your Households
							</h2>
							<div className="mb-6 space-y-4">
								{/* Household Options */}
								{households.map((household) => (
									<ContextMenu key={household.id}>
										<ContextMenuTrigger asChild>
											<button
												onClick={() => {
													handleSelectHousehold(household.id);
												}}
												className="group w-full text-left"
											>
												<Card className="hover:bg-primary/5 cursor-pointer border-0 shadow-lg transition-all hover:shadow-xl">
													<CardContent className="flex items-center justify-between p-4">
														<div className="flex items-center gap-3">
															<div className="bg-primary/10 rounded-lg p-2">
																{(household.memberCount ?? 1) > 1 ? (
																	<Users className="text-primary h-5 w-5" />
																) : (
																	<User className="text-primary h-5 w-5" />
																)}
															</div>
															<div>
																<p className="font-semibold">{household.name}</p>
																<p className="text-muted-foreground text-xs">
																	Manage shared finances with members
																</p>
															</div>
														</div>
														<ArrowRight className="text-muted-foreground group-hover:text-primary h-4 w-4 transition-colors" />
													</CardContent>
												</Card>
											</button>
										</ContextMenuTrigger>
										<ContextMenuContent>
											<ContextMenuItem
												onClick={() => navigator.clipboard.writeText(household.inviteCode)}
											>
												Copy Invitation Code
												<ContextMenuShortcut>⌘C</ContextMenuShortcut>
											</ContextMenuItem>
											<ContextMenuItem onClick={() => handleOpenInNewTab(household.id)}>
												Open in New Tab
												<ContextMenuShortcut>⌘Click</ContextMenuShortcut>
											</ContextMenuItem>
											{household.role === "admin" && (
												<ContextMenuItem
													className="text-red-500"
													onClick={() => handleDeleteHousehold(household.id)}
												>
													Delete
													<ContextMenuShortcut>⌘⌫</ContextMenuShortcut>
												</ContextMenuItem>
											)}
										</ContextMenuContent>
									</ContextMenu>
								))}
							</div>
						</div>

						{/* Divider */}
						<div className="relative mb-6">
							<div className="absolute inset-0 flex items-center">
								<div className="border-border w-full border-t"></div>
							</div>
							<div className="relative flex justify-center text-xs uppercase">
								<span className="bg-background text-muted-foreground px-2">Or</span>
							</div>
						</div>

						{/* Onboarding Actions */}
						<div className="grid gap-4 md:grid-cols-2">
							{/* Create Household */}
							<button
								onClick={() => {
									setOpenModal("create-household");
									setError("");
								}}
								className="group h-full text-left transition-all duration-300 hover:scale-105"
							>
								<Card className="hover:bg-primary/5 h-full cursor-pointer border-0 shadow-lg transition-all hover:shadow-xl">
									<CardContent className="flex h-full flex-col p-6">
										<div className="bg-primary/10 mb-4 w-fit rounded-xl p-3">
											<Home className="text-primary h-6 w-6" />
										</div>
										<h3 className="mb-2 text-lg font-bold">Create Household</h3>
										<p className="text-muted-foreground mb-auto text-sm">
											Create a new household and invite others
										</p>
										<div className="text-primary mt-6 flex items-center text-sm font-semibold transition-transform group-hover:translate-x-1">
											Continue <ArrowRight className="ml-2 h-4 w-4" />
										</div>
									</CardContent>
								</Card>
							</button>

							{/* Join Household */}
							<button
								onClick={() => {
									setOpenModal("join-household");
									setError("");
								}}
								className="group h-full text-left transition-all duration-300 hover:scale-105"
							>
								<Card className="hover:bg-accent/5 h-full cursor-pointer border-0 shadow-lg transition-all hover:shadow-xl">
									<CardContent className="flex h-full flex-col p-6">
										<div className="bg-accent/10 mb-4 w-fit rounded-xl p-3">
											<Users className="text-accent h-6 w-6" />
										</div>
										<h3 className="mb-2 text-lg font-bold">Join Household</h3>
										<p className="text-muted-foreground mb-auto text-sm">
											Enter a code to join an existing household
										</p>
										<div className="text-accent mt-6 flex items-center text-sm font-semibold transition-transform group-hover:translate-x-1">
											Continue <ArrowRight className="ml-2 h-4 w-4" />
										</div>
									</CardContent>
								</Card>
							</button>
						</div>
					</div>
				</div>
			</div>

			{/* Create Household Modal */}
			<Dialog
				open={openModal === "create-household"}
				onOpenChange={(open) => !open && setOpenModal(null)}
			>
				<DialogContent className="sm:max-w-md">
					<DialogHeader className="space-y-2">
						<div className="bg-primary/10 w-fit rounded-xl p-3">
							<Home className="text-primary h-6 w-6" />
						</div>
						<DialogTitle>Create a Household</DialogTitle>
						<DialogDescription>Give your household a name</DialogDescription>
					</DialogHeader>

					<div className="space-y-4">
						{error && (
							<Alert variant="destructive" className="border-destructive/50 bg-destructive/10">
								<AlertCircle className="h-4 w-4" />
								<AlertDescription>{error}</AlertDescription>
							</Alert>
						)}

						<div className="mt-2">
							<label className="text-sm font-medium">Household Name</label>
							<Input
								placeholder="e.g., My Family"
								value={householdName}
								onChange={(e) => setHouseholdName(e.target.value)}
								disabled={isLoading}
								className="h-11"
							/>
						</div>
						<Button
							onClick={handleCreateHousehold}
							disabled={isLoading}
							className="bg-primary hover:bg-primary/80 h-11 w-full"
						>
							{isLoading ? "Creating..." : "Create Household"}
						</Button>
					</div>
				</DialogContent>
			</Dialog>

			{/* Join Household Modal */}
			<Dialog
				open={openModal === "join-household"}
				onOpenChange={(open) => !open && setOpenModal(null)}
			>
				<DialogContent className="sm:max-w-md">
					<DialogHeader className="space-y-2">
						<div className="bg-accent/10 w-fit rounded-xl p-3">
							<Users className="text-accent h-6 w-6" />
						</div>
						<DialogTitle>Join a Household</DialogTitle>
						<DialogDescription>
							Enter the invite code to join an existing household
						</DialogDescription>
					</DialogHeader>

					<div className="space-y-4">
						{error && (
							<Alert variant="destructive" className="bg-destructive/10 border-destructive/50">
								<AlertCircle className="h-4 w-4" />
								<AlertDescription>{error}</AlertDescription>
							</Alert>
						)}

						<div className="mt-2">
							<label className="text-sm font-medium">Invite Code</label>
							<Input
								placeholder="Enter 6-digit code"
								value={inviteCode}
								onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
								disabled={isLoading}
								className="h-11"
								maxLength={6}
							/>
						</div>
						<Button
							onClick={handleJoinHousehold}
							disabled={isLoading}
							className="bg-accent hover:bg-accent/80 h-11 w-full"
						>
							{isLoading ? "Joining..." : "Join Household"}
						</Button>
					</div>
				</DialogContent>
			</Dialog>
			<UserSettingsSidebar
				isOpen={isSettingsSidebarOpen}
				onClose={() => setIsSettingsSidebarOpen(false)}
			/>
		</>
	);
}
