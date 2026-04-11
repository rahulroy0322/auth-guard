import type { IncomingMessage } from "node:http";
import type { AvatarType } from "../types";
import type { ReturnUserType, SafeUserType } from "./auth";

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
type NewAvatarReturnType = {
	user: ReturnUserType;
};
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
