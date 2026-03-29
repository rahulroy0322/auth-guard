import { useMemo, type FC } from "react";
import type { GuardUserType } from "../provider";
import { config } from "../config";
import { Avatar } from "ui/components/avatar";

type ProfileAvatarPropsType = {
    user: GuardUserType
}

const ProfileAvatar: FC<ProfileAvatarPropsType> = ({
    user
}) => {
    const avatarUrl = useMemo(() => {
        if (!user || !user.avatar) {
            return
        }
        const { src } = user.avatar ?? {}

        if (src.startsWith('http')) {
            return src
        }

        return `${config.base}${src}`
    }, [user])

    return <Avatar src={avatarUrl} name={user.name} />
}

export {
    ProfileAvatar
}