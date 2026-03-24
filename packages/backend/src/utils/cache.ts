import type { UserType } from "base";

const keys = {
	code: (user: Pick<UserType, "id">) => `code:${user.id}` as const,
	token: (token: string) => `token:${token}` as const,
};

export { keys };
