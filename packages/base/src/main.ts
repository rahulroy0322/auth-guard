type RoleType = 'super' | 'admin' | 'moderator' | 'editor' | 'user' | 'geast'

type UserType = {
	id: string
	name: string
	email: string
	password: string | null
	roles: RoleType[]
}

export type { RoleType, UserType }
