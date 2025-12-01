"use client";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { AlertCircle, Eye, EyeOff, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Label } from "@/components/ui/label";
import Link from "next/link";

export default function LoginPage() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(false);

	const handleLogin = async (e: React.FormEvent) => {
		e.preventDefault();
		setError(null);
		setIsLoading(true);

		try {
			const result = await signIn("credentials", {
				email,
				password,
				redirect: false,
			});

			if (result?.error) {
				setError(result.error);
				setIsLoading(false);
			} else if (result?.ok) {
				window.location.href = "/onboarding";
			}
		} catch (err) {
			setError("An unexpected error occurred during sign in");
			setIsLoading(false);
		}
	};

	return (
		<div className="flex min-h-screen flex-col justify-center px-4">
			<div className="">
				{/* Icon */}
				<Wallet className="text-primary bg-primary/20 mx-auto mb-4 h-12 w-12 rounded-xl p-2" />
			</div>
			<Card className="mx-auto mt-10 w-full max-w-md">
				<CardHeader>
					<CardTitle className="text-primary text-center text-2xl font-bold">
						Welcome Back
					</CardTitle>
					<CardDescription className="mb-4 text-center">
						Sign in to your HomeBase account
					</CardDescription>
				</CardHeader>
				<CardContent>
					{error && (
						<Alert variant="destructive" className="mb-4">
							<AlertCircle className="h-4 w-4" />
							<AlertDescription>{error}</AlertDescription>
						</Alert>
					)}
					<form onSubmit={handleLogin} className="space-y-4">
						<div>
							<Label htmlFor="email" className="mb-1 block">
								Email
							</Label>
							<Input
								id="email"
								type="email"
								placeholder="you@example.com"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
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
								type={showPassword ? "text" : "password"}
								placeholder="A Strong Password"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
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
						<Button
							type="submit"
							disabled={isLoading || !email || !password}
							className="bg-primary hover:bg-primary/90 text-primary-foreground h-11 w-full font-semibold"
							variant={"default"}
						>
							{isLoading ? "Signing in..." : "Sign In"}
						</Button>
						<div className="border-border/50 mt-6 border-t pt-6">
							<p className="text-muted-foreground text-center text-sm">
								Don&apos;t have an account?{" "}
								<Link
									href="/register"
									className="text-primary hover:text-primary/90 font-semibold transition-colors"
								>
									Create one
								</Link>
							</p>
						</div>
					</form>
				</CardContent>
			</Card>
		</div>
	);
}
