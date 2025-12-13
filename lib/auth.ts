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
					throw new Error("Invalid email or password");
				}

				return {
					id: user.id,
					email: user.email,
					name: user.name,
					joinedAt: user.createdAt,
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
		async jwt({ token, user, session, trigger }) {
			// On sign in, add the user ID to the token
			if (trigger === "update" && session) {
				token.name = session.name;
			}
			if (user) {
				token.sub = user.id;
				token.email = user.email;
				token.name = user.name;
				token.joinedAt = user.joinedAt;
			}
			return token;
		},
		async session({ session, token }) {
			// Add the user ID to the session from the token
			if (session.user) {
				session.user.id = token.sub!;
				session.user.email = token.email as string;
				session.user.name = token.name as string;
				session.user.joinedAt = token.joinedAt as Date;
			}
			return session;
		},
	},
	secret: process.env.NEXTAUTH_SECRET,
};
