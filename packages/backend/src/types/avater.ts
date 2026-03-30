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

type NewAvatarPropsType = {
	url: string;
	reqId: string;
	user: SafeUserType;
};
type NewAvatarReturnType = Omit<{ user: SafeUserType }, "token">;
type NewAvatarType = (data: NewAvatarPropsType) => Promise<NewAvatarReturnType>;

type RemoveAvatarReturnType = NewAvatarReturnType;
type RemoveAvatarType = (
	req: IncomingMessage,
) => Promise<RemoveAvatarReturnType>;

export type {
	AvatarModelType,
	NewAvatarPropsType,
	NewAvatarReturnType,
	NewAvatarType,
	RemoveAvatarReturnType,
	RemoveAvatarType,
};
