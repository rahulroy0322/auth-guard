import type { FC } from "react";
import { Avatar } from "ui/components/avatar";
import type { GuardUserType } from "../../provider";

type ProfileAvatarPropsType = {
	baseUrl: string;
	user: GuardUserType;
};

const ProfileAvatar: FC<ProfileAvatarPropsType> = ({ baseUrl, user }) => {
	if (!user.avatar?.src) {
		return <Avatar src={undefined} name={user.name} />;
	}

	const avatarUrl = user.avatar.src.startsWith("http")
		? user.avatar.src
		: `${baseUrl}${user.avatar.src}`;

	return <Avatar src={avatarUrl} name={user.name} />;
};

export { ProfileAvatar };
