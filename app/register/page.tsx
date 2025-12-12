"use client";
import { useState } from "react";
import { AlertCircle, Eye, EyeOff, Wallet, Check, XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";

export default function RegisterPage() {
	const [formData, setFormData] = useState({
		name: "",
		email: "",
		password: "",
		confirmPassword: "",
	});
	const [error, setError] = useState("");
	const [validations, setValidations] = useState({
		length: false,
		uppercase: false,
		number: false,
		special: false,
	});
	const [showPassword, setShowPassword] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const router = useRouter();

	const validatePassword = (password: string) => {
		setValidations({
			length: password.length >= 8,
			uppercase: /[A-Z]/.test(password),
			number: /[0-9]/.test(password),
			special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
		});
	};

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		setFormData((prev) => ({ ...prev, [name]: value }));
		if (name === "password") {
			validatePassword(value);
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError("");
		setIsLoading(true);

		if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
			setError("All fields are required.");
			setIsLoading(false);
			return;
		}

		if (formData.password !== formData.confirmPassword) {
			setError("Passwords do not match.");
			setIsLoading(false);
			return;
		}

		if (!Object.values(validations).every(Boolean)) {
			setError("Password does not meet requirements.");
			setIsLoading(false);
			return;
		}

		try {
			const response = await fetch("/api/register", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					name: formData.name,
					email: formData.email,
					password: formData.password,
				}),
			});

			const data = await response.json();
			if (!response.ok) {
				setError(data.error || "Registration failed. Please try again.");
			} else {
				toast.success("Account created successfully! Please log in.");
				router.push("/login");
			}
		} catch (err) {
			setError("An unexpected error occurred. Please try again.");
			console.error("Registration error:", err);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="flex min-h-screen flex-col justify-center px-4">
			<Toaster position="top-right" />
			<div className="">
				{/* Icon */}
				<Wallet className="text-primary bg-primary/20 mx-auto mb-4 h-12 w-12 rounded-xl p-2" />
			</div>
			<Card className="mx-auto mt-6 w-full max-w-md">
				<CardHeader>
					<CardTitle className="text-primary text-center text-2xl font-bold">Get Started</CardTitle>
					<CardDescription className="mb-4 text-center">
						Create your HomeBase account
					</CardDescription>
				</CardHeader>
				<CardContent>
					{error && (
						<Alert variant="destructive" className="mb-4">
							<AlertCircle className="h-4 w-4" />
							<AlertDescription>{error}</AlertDescription>
						</Alert>
					)}
					<form onSubmit={handleSubmit} className="space-y-4">
						<div>
							<Label htmlFor="name" className="mb-1 block">
								Name
							</Label>
							<Input
								id="name"
								type="text"
								placeholder="Your Full Name"
								name="name"
								value={formData.name}
								onChange={handleChange}
								className="border-border/50 bg-secondary/30 focus:bg-background h-11 transition-colors"
								disabled={isLoading}
							/>
						</div>
						<div>
							<Label htmlFor="email" className="mb-1 block">
								Email
							</Label>
							<Input
								id="email"
								type="email"
								name="email"
								placeholder="you@example.com"
								value={formData.email}
								onChange={handleChange}
								className="border-border/50 bg-secondary/30 focus:bg-background h-11 transition-colors"
								disabled={isLoading}
							/>
						</div>
						<div className="relative">
							<Label htmlFor="password" className="mb-1 block">
								Password
							</Label>
							<Input
								id="password"
								name="password"
								type={showPassword ? "text" : "password"}
								placeholder="A Strong Password"
								value={formData.password}
								onChange={handleChange}
								className="border-border/50 bg-secondary/30 focus:bg-background h-11 pr-10 transition-colors"
								disabled={isLoading}
							/>
							<button
								type="button"
								onClick={() => setShowPassword(!showPassword)}
								className="absolute top-9 right-3 text-gray-500 hover:text-gray-700 focus:outline-none"
								disabled={isLoading}
							>
								{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
							</button>
						</div>
						<div className="space-y-1">
							<p className="text-sm font-medium">Password must contain:</p>
							<div className="text-muted-foreground ml-4 list-disc text-sm">
								<div className={validations.length ? "text-green-600" : ""}>
									{validations.length ? (
										<Check className="inline h-4 w-4" />
									) : (
										<XIcon className="inline h-4 w-4" />
									)}{" "}
									At least 8 characters
								</div>
								<div className={validations.uppercase ? "text-green-600" : ""}>
									{validations.uppercase ? (
										<Check className="inline h-4 w-4" />
									) : (
										<XIcon className="inline h-4 w-4" />
									)}{" "}
									At least one uppercase letter
								</div>
								<div className={validations.number ? "text-green-600" : ""}>
									{validations.number ? (
										<Check className="inline h-4 w-4" />
									) : (
										<XIcon className="inline h-4 w-4" />
									)}{" "}
									At least one number
								</div>
								<div className={validations.special ? "text-green-600" : ""}>
									{validations.special ? (
										<Check className="inline h-4 w-4" />
									) : (
										<XIcon className="inline h-4 w-4" />
									)}{" "}
									At least one special character
								</div>
							</div>
						</div>
						<div>
							<Label htmlFor="confirmPassword" className="mb-1 block">
								Confirm Password
							</Label>
							<Input
								id="confirmPassword"
								type="password"
								placeholder="Re-enter Your Password"
								value={formData.confirmPassword}
								name="confirmPassword"
								onChange={handleChange}
								className="border-border/50 bg-secondary/30 focus:bg-background h-11 transition-colors"
								disabled={isLoading}
							/>
						</div>
						<Button
							type="submit"
							disabled={
								isLoading ||
								!formData.name ||
								!formData.email ||
								!formData.password ||
								!formData.confirmPassword
							}
							className="bg-primary hover:bg-primary/90 text-primary-foreground h-11 w-full font-semibold"
							variant={"default"}
						>
							{isLoading ? "Creating Account..." : "Create Account"}
						</Button>
						<div className="border-border/50 mt-6 border-t pt-6">
							<p className="text-muted-foreground text-center text-sm">
								Already have an account?{" "}
								<Link
									href="/login"
									className="text-primary hover:text-primary/90 font-semibold transition-colors"
								>
									Log in
								</Link>
							</p>
						</div>
					</form>
				</CardContent>
			</Card>
		</div>
	);
}
