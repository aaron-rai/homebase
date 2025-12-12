"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useSession } from "next-auth/react";

type Theme = "light" | "dark" | "system";

interface ThemeContextType {
	theme: Theme;
	setTheme: (theme: Theme) => void;
	resolvedTheme: "light" | "dark";
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
	const { data: session, status } = useSession();
	const [theme, setThemeState] = useState<Theme>("system");
	const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">("light");

	// Get system preference
	const getSystemTheme = (): "light" | "dark" => {
		if (typeof window !== "undefined") {
			return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
		}
		return "light";
	};

	// Resolve theme (convert "system" to actual theme)
	const resolveTheme = (themeValue: Theme): "light" | "dark" => {
		if (themeValue === "system") {
			return getSystemTheme();
		}
		return themeValue;
	};

	// Apply theme to DOM
	const applyTheme = (themeValue: Theme) => {
		const resolved = resolveTheme(themeValue);
		setResolvedTheme(resolved);

		if (typeof window !== "undefined") {
			const root = document.documentElement;
			root.classList.remove("light", "dark");
			root.classList.add(resolved);
			localStorage.setItem("theme", themeValue);
		}
	};

	// Set theme and save to server
	const setTheme = async (newTheme: Theme) => {
		setThemeState(newTheme);
		applyTheme(newTheme);

		// Save to server if authenticated
		if (session?.user) {
			try {
				await fetch("/api/user/theme", {
					method: "PUT",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ theme: newTheme }),
				});
			} catch (error) {
				console.error("Failed to save theme preference:", error);
			}
		}
	};

	// Fetch user's theme from server on mount
	useEffect(() => {
		if (status === "authenticated" && session?.user) {
			fetch("/api/user/theme")
				.then((res) => res.json())
				.then((data) => {
					if (data.theme) {
						setThemeState(data.theme);
						applyTheme(data.theme);
					}
				})
				.catch(() => {
					// Fallback to localStorage
					const savedTheme = localStorage.getItem("theme") as Theme | null;
					if (savedTheme) {
						setThemeState(savedTheme);
						applyTheme(savedTheme);
					}
				});
		} else {
			// Not authenticated, use localStorage
			const savedTheme = localStorage.getItem("theme") as Theme | null;
			if (savedTheme) {
				setThemeState(savedTheme);
				applyTheme(savedTheme);
			} else {
				applyTheme("system");
			}
		}
	}, [status, session]);

	// Listen for system theme changes
	useEffect(() => {
		if (theme !== "system") return;

		const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
		const handleChange = () => {
			applyTheme("system");
		};

		mediaQuery.addEventListener("change", handleChange);
		return () => mediaQuery.removeEventListener("change", handleChange);
	}, [theme]);

	return (
		<ThemeContext.Provider value={{ theme, setTheme, resolvedTheme }}>
			{children}
		</ThemeContext.Provider>
	);
}

export function useTheme() {
	const context = useContext(ThemeContext);
	if (context === undefined) {
		throw new Error("useTheme must be used within a ThemeProvider");
	}
	return context;
}
