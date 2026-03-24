import type { UserType } from "base";

type SafeUser = Omit<UserType, "password">;

// biome-ignore lint/complexity/noStaticOnlyClass: ts error
class UserSanitizer {
	static removePassword(
		user: Omit<UserType, "password"> & {
			password?: UserType["password"];
		},
	): SafeUser {
		const { password, ...safeUser } = user;
		return safeUser;
	}
}

export { UserSanitizer };
