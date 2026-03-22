type RoleType = 'super' | 'admin' | 'moderator' | 'editor' | 'user' | 'geast'
type UserType = {
	id: string
	name: string
	email: string
	password: string | null
	roles: RoleType[]
	avatar?: AvatarType
}
type AvatarType = {
	src: string
}
export type { RoleType, UserType, AvatarType }
//# sourceMappingURL=main.d.ts.map
