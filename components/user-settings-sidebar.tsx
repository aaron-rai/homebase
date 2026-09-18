"use client";
import { useEffect, useState } from "react";
import { signOut, useSession } from "next-auth/react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { LogOut, X, Upload, Sun, Moon, Monitor, Copy } from "lucide-react";
import { useTheme } from "@/components/theme-provider";
import packageJson from "@/package.json";
import { toast } from "sonner";

interface UserSettingsSidebarProps {
	isOpen: boolean;
	onClose: () => void;
}

export default function UserSettingsSidebar({ isOpen, onClose }: UserSettingsSidebarProps) {
	const { data: session, update } = useSession();
	const user = session?.user;
	const { theme, setTheme } = useTheme();
	const [isEditing, setIsEditing] = useState(false);
	const [name, setName] = useState(user?.name || "");
	const [isSaving, setIsSaving] = useState(false);
	const [hasToken, setHasToken] = useState(false);
	const [revealedToken, setRevealedToken] = useState<string | null>(null);

	useEffect(() => {
		if (!isOpen) return;
		fetch("/api/user/token")
			.then((res) => res.json())
			.then((data) => setHasToken(data.hasToken));
	}, [isOpen]);

	const handleGenerate = async () => {
		const res = await fetch("/api/user/token", { method: "POST" });
		const data = await res.json();
		setRevealedToken(data.apiToken);
		setHasToken(true);
	};

	const handleSaveName = async () => {
		if (!name.trim()) {
			toast.error("Name cannot be empty");
			return;
		}

		setIsSaving(true);
		try {
			const response = await fetch("/api/user/profile", {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ name: name.trim() }),
			});

			if (!response.ok) {
				throw new Error("Failed to update name");
			}

			toast.success("Name updated successfully!");
			await update({ name: name.trim() });
			setIsEditing(false);
		} catch (error) {
			toast.error("Failed to update name");
			console.error(error);
		} finally {
			setIsSaving(false);
		}
	};

	const handleThemeChange = (newTheme: "light" | "dark" | "system") => {
		if (theme === newTheme) return;
		setTheme(newTheme);
		toast.success(`Theme changed to ${newTheme}`);
	};

	const handleProfilePictureUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
		// Implement profile picture upload logic here
		console.log("Profile picture uploaded, file:", event.target.files?.[0]);
	};

	if (!user) return null;

	return (
		<>
			{/* Overlay */}
			{isOpen && <div className="fixed inset-0 z-40 bg-black/50" onClick={onClose} />}
			{/* Sidebar */}
			<div
				className={`bg-background border-border fixed top-0 left-0 z-50 h-screen w-80 transform overflow-y-auto border-r shadow-lg transition-transform duration-300 ease-in-out ${
					isOpen ? "translate-x-0" : "-translate-x-full"
				}`}
			>
				<div className="space-y-4 p-4">
					{/* Close Button (Mobile) */}
					<div className="mb-4 flex items-center justify-between sm:hidden">
						<h2 className="text-xl font-bold">Settings</h2>
						<Button size="icon" variant="ghost" onClick={onClose}>
							<X className="h-4 w-4" />
						</Button>
					</div>
					{/* Profile Section */}
					<Card>
						<CardHeader>
							<CardTitle>Profile</CardTitle>
							<CardDescription>Manage your profile information</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							{/* Avatar */}
							<div className="flex flex-col items-center gap-4">
								<Avatar className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full">
									<AvatarImage />
									<AvatarFallback className="from-primary to-accent flex h-full w-full items-center justify-center bg-linear-to-br text-xl font-semibold text-white">
										{(user.name || "User")
											.split(" ")
											.map((n) => n[0])
											.join("")
											.toUpperCase()}
									</AvatarFallback>
								</Avatar>
								{/* Upload Profile Picture */}
								<label className="flex items-center gap-2">
									<input
										type="file"
										accept="image/*"
										onChange={handleProfilePictureUpload}
										className="hidden"
										disabled={true}
									/>
									<Button
										variant="outline"
										size="sm"
										className="cursor-pointer bg-transparent"
										disabled={true}
									>
										<Upload className="mr-1 h-3 w-3" />
										Upload Photo
									</Button>
								</label>
							</div>

							{/* Name Editing */}
							<div className="space-y-2">
								<label className="text-sm font-medium">Name</label>
								{isEditing ? (
									<div className="flex gap-2">
										<Input
											value={name}
											onChange={(e) => setName(e.target.value)}
											placeholder="Enter your name"
										/>
										<Button
											size="sm"
											onClick={handleSaveName}
											disabled={isSaving}
											className="bg-primary hover:bg-primary/90 cursor-pointer"
										>
											{isSaving ? "Saving..." : "Save"}
										</Button>
									</div>
								) : (
									<div className="bg-muted flex items-center justify-between rounded-md p-2">
										<span>{name}</span>
										<Button
											size="sm"
											variant="ghost"
											onClick={() => setIsEditing(true)}
											className="cursor-pointer"
										>
											Edit
										</Button>
									</div>
								)}
							</div>

							{/* Email */}
							<div className="space-y-2">
								<label className="text-sm font-medium">Email</label>
								<div className="bg-muted text-muted-foreground cursor-not-allowed rounded-md p-2 text-sm">
									{user.email}
								</div>
							</div>
						</CardContent>
					</Card>
					{/* Theme Selection */}
					<Card>
						<CardHeader>
							<CardTitle>Theme</CardTitle>
							<CardDescription>Choose how the app looks</CardDescription>
						</CardHeader>
						<CardContent className="space-y-2">
							<div className="grid grid-cols-3 gap-2 sm:grid-cols-3">
								<Button
									variant={theme === "light" ? "default" : "outline"}
									className="flex h-auto cursor-pointer flex-col gap-1 py-3"
									onClick={() => handleThemeChange("light")}
								>
									<Sun className="h-4 w-4" />
									Light
								</Button>
								<Button
									variant={theme === "dark" ? "default" : "outline"}
									className="curosor-pointer flex h-auto flex-col gap-1 py-3"
									onClick={() => handleThemeChange("dark")}
								>
									<Moon className="h-4 w-4" />
									Dark
								</Button>
								<Button
									variant={theme === "system" ? "default" : "outline"}
									className="flex h-auto cursor-pointer flex-col gap-1 py-3"
									onClick={() => handleThemeChange("system")}
								>
									<Monitor className="h-4 w-4" />
									System
								</Button>
							</div>
						</CardContent>
					</Card>
					{/* About Section */}
					<Card>
						<CardHeader>
							<CardTitle>About</CardTitle>
							<CardDescription>App version and info</CardDescription>
						</CardHeader>
						<CardContent className="space-y-2">
							<p className="text-muted-foreground text-sm">
								Member Since: {new Date(user.joinedAt).toLocaleDateString()}
							</p>
							<p className="text-muted-foreground text-sm">Version {packageJson.version}</p>
						</CardContent>
					</Card>
					{/* API Token Section */}
					<Card>
						<CardHeader>
							<CardTitle>API Token</CardTitle>
							<CardDescription>
								Use this to submit expenses from Shortcuts or other tools
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-2">
							{revealedToken ? (
								<div className="space-y-1">
									<div className="bg-muted flex items-center justify-between gap-2 rounded-md p-2">
										<span className="truncate font-mono text-sm">{revealedToken}</span>
										<Button
											size="icon"
											variant="ghost"
											onClick={() => {
												navigator.clipboard.writeText(revealedToken);
												toast.success("Copied to clipboard");
											}}
										>
											<Copy className="h-4 w-4" />
										</Button>
									</div>
									<p className="text-muted-foreground text-xs">
										Copy this now — you won&apos;t be able to see it again.
									</p>
								</div>
							) : (
								<p className="text-muted-foreground text-sm">
									{hasToken ? "Token is set (hidden)." : "No token generated yet."}
								</p>
							)}
							<Button size="sm" variant="outline" onClick={handleGenerate}>
								{hasToken ? "Regenerate Token" : "Generate Token"}
							</Button>
						</CardContent>
					</Card>
					{/* Close Button */}
					<Button
						variant={theme === "light" ? "default" : "outline"}
						className="w-full cursor-pointer justify-center"
						onClick={onClose}
					>
						Close
					</Button>
					{/* Sign Out Button */}
					<Button
						variant="destructive"
						className="w-full cursor-pointer justify-center"
						onClick={() => signOut()}
					>
						<LogOut className="mr-2 h-4 w-4" />
						Logout
					</Button>
				</div>
			</div>
		</>
	);
}
