import type { IncomingMessage } from "node:http";
import type { AvatarType } from "base";
import type { SafeUserType } from "./auth";

type AvaterModelType = {
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

// Loged-in
// Model
export type {
	AvaterModelType,
	NewAvatarReturnType,
	NewAvatarType,
	RemoveAvatarReturnType,
	RemoveAvatarType,
};
