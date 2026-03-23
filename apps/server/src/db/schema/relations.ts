import { relations } from "drizzle-orm";

import { User } from "./user";
import { Avatar } from "./avatar";
import { Profile } from "./profile";

const UsersRelations = relations(User, ({ many }) => ({
    profiles: many(Profile),
    avatars: many(Avatar),
    // TODO! add way to a add avatar where active is true
}))

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

export {
    AvatarsRelations,
    ProfilesRelations,
    UsersRelations
};
