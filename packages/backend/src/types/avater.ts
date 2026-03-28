import type { IncomingMessage } from "node:http";
import type { AvatarType } from "base";
import type { SafeUserType } from "./auth";

type AvatarModelType = {
	findActiveByUserId: (
		userId: AvatarType["userId"],
	) => Promise<AvatarType | null>;

	create: (
		data: Pick<AvatarType, "active" | "src" | "userId">,
	) => Promise<AvatarType | null>;

	updateById: (
		id: AvatarType["id"],
		data: Partial<AvatarType>,
	) => Promise<AvatarType | null>;
};

type NewAvatarReturnType = Omit<{ user: SafeUserType }, "token">;
type NewAvatarType = (
	req: IncomingMessage,
	data: { url: string },
) => Promise<NewAvatarReturnType>;

type RemoveAvatarReturnType = NewAvatarReturnType;
type RemoveAvatarType = (
	req: IncomingMessage,
) => Promise<RemoveAvatarReturnType>;

export type {
	AvatarModelType,
	NewAvatarReturnType,
	NewAvatarType,
	RemoveAvatarReturnType,
	RemoveAvatarType,
};
