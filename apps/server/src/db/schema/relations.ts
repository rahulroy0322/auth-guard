import { relations } from "drizzle-orm";
import { Avatar } from "./avatar";
import { Profile } from "./profile";
import { Session } from "./session";
import { User } from "./user";

const UsersRelations = relations(User, ({ many }) => ({
	profiles: many(Profile),
	avatars: many(Avatar),
	sessions: many(Session),
	// TODO! add way to a add avatar where active is true
}));

const ProfilesRelations = relations(Profile, ({ one }) => ({
	user: one(User, {
		fields: [Profile.userId],
		references: [User.id],
	}),
}));

const AvatarsRelations = relations(Avatar, ({ one }) => ({
	user: one(User, {
		fields: [Avatar.userId],
		references: [User.id],
	}),
}));

const SessionsRelations = relations(Session, ({ one }) => ({
	user: one(User, {
		fields: [Session.userId],
		references: [User.id],
	}),
}));

export {
	AvatarsRelations,
	ProfilesRelations,
	SessionsRelations,
	UsersRelations,
};
