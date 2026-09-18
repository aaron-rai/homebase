import { randomBytes, createHash } from "crypto";

export function generateApiToken() {
	return `hb_${randomBytes(24).toString("hex")}`;
}

export function hashApiToken(token: string) {
	return createHash("sha256").update(token).digest("hex");
}
