type RoleType = 'super' | 'admin' | 'moderator' | 'editor' | 'user' | 'geast'
type ProviderType = 'google' | 'github' // TODO! add more


type UserType = {
	id: string
	name: string
	email: string
	password: string | null
	roles: RoleType[]
	isVerified: boolean
	isBaned: boolean

	avatar: Pick<AvatarType, 'src'> | null
	profiles: Pick<ProfileType, 'email' | 'provider'>[]
}

type ProfileType = {
	email: string
	userId: UserType['id']
	provider: ProviderType
}

type AvatarType = {
	id: string
	src: string
	active: boolean
	userId: UserType['id']
}

export type {
	AvatarType, RoleType, UserType,
	ProfileType,
	ProviderType
}
