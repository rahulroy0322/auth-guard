import { type FC, useMemo } from "react";
import { Avatar } from "ui/components/avatar";
import { config } from "../config";
import type { GuardUserType } from "../provider";

type ProfileAvatarPropsType = {
	user: GuardUserType;
};

const ProfileAvatar: FC<ProfileAvatarPropsType> = ({ user }) => {
	const avatarUrl = useMemo(() => {
		if (!user || !user.avatar) {
			return;
		}
		const { src } = user.avatar ?? {};

		if (src.startsWith("http")) {
			return src;
		}

		return `${config.base}${src}`;
	}, [user]);

	return <Avatar src={avatarUrl} name={user.name} />;
};

export { ProfileAvatar };
