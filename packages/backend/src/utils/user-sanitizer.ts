import type { SafeUserType, UserType } from "../types";

// biome-ignore lint/complexity/noStaticOnlyClass: ts error
class UserSanitizer {
	static removePassword<
		T extends SafeUserType & {
			password?: UserType["password"];
		},
	>(user: T): T {
		const { password, ...safeUser } = user;
		return safeUser as T;
	}
}

export { UserSanitizer };
