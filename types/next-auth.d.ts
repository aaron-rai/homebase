import { DefaultSession } from "next-auth";

declare module "next-auth" {
	interface Session {
		user: {
			id: string;
			email: string;
			joinedAt: Date;
		} & DefaultSession["user"];
	}

	interface User {
		email?: string;
		joinedAt?: Date;
	}
}

declare module "next-auth/jwt" {
	interface JWT {
		email?: string;
		joinedAt?: Date;
	}
}
