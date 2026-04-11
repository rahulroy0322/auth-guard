import type {
	AvatarType,
	ProfileType,
	ReturnUserType,
	SafeUserType,
} from "../types";
import { UserSanitizer } from "./user-sanitizer";

type FetchRelationsReturnType = {
	avatar: AvatarType | null;
	profiles: ProfileType[];
};

type FetchRelationsType = (userId: string) => Promise<FetchRelationsReturnType>;

// biome-ignore lint/complexity/noStaticOnlyClass: TS error
class AuthResponseBuilder {
	static buildAuthResponse = async (
		user: SafeUserType,
		token: { access: string; refresh: string },
		fetchRelations: FetchRelationsType,
	): Promise<{ token: typeof token; user: ReturnUserType }> => ({
		token,
		user: (await AuthResponseBuilder.buildUserResponse(user, fetchRelations))
			.user,
	});

	static buildUserResponse = async (
		user: SafeUserType,
		fetchRelations: FetchRelationsType,
	): Promise<{ user: ReturnUserType }> => {
		const sanitizedUser = UserSanitizer.removePassword(user);
		const { avatar, profiles } = await fetchRelations(sanitizedUser.id);

		return {
			user: {
				...sanitizedUser,
				avatar,
				profiles,
			},
		};
	};
}

export { AuthResponseBuilder };
