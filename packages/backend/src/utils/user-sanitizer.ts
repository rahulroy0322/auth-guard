import type { UserType } from "base";
import type { SafeUserType } from "../types";

// biome-ignore lint/complexity/noStaticOnlyClass: ts error
class UserSanitizer {
	static removePassword(
		user: SafeUserType & {
			password?: UserType["password"];
		},
	): SafeUserType {
		const { password, ...safeUser } = user;
		return safeUser;
	}
}

export { UserSanitizer };
