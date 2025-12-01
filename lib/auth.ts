import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "./prisma";
import { compare } from "bcryptjs";

export const authOptions: NextAuthOptions = {
	providers: [
		CredentialsProvider({
			name: "credentials",
			credentials: {
				email: { label: "Email", type: "email" },
				password: { label: "Password", type: "password" },
			},
			async authorize(credentials) {
				if (!credentials?.email || !credentials?.password) {
					throw new Error("Email and password are required");
				}

				const user = await prisma.user.findUnique({
					where: { email: credentials.email },
				});

				if (!user || !user.passwordHash) {
					throw new Error("Invalid email or password");
				}

				const isPasswordValid = await compare(credentials.password, user.passwordHash);

				if (!isPasswordValid) {
					throw new Error("Password is incorrect!");
				}

				return {
					id: user.id,
					email: user.email,
					name: user.name,
				};
			},
		}),
	],
	session: {
		strategy: "jwt",
		maxAge: 30 * 24 * 60 * 60, // 30 days
	},
	pages: {
		signIn: "/login",
	},
	callbacks: {
		async jwt({ token, user }) {
			// On sign in, add the user ID to the token
			if (user) {
				token.sub = user.id;
			}
			return token;
		},
		async session({ session, token }) {
			// Add the user ID to the session from the token
			if (session.user) {
				session.user.id = token.sub!;
			}
			return session;
		},
	},
	secret: process.env.NEXTAUTH_SECRET,
};
