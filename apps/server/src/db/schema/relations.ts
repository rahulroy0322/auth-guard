// import { relations } from "drizzle-orm";

// import { User } from "./user";

// const UsersRelations = relations(User, ({ many }) => ({
// 	posts: many(Post),
// 	avatars: many(Avatar),
// }));

// const PostsRelations = relations(Post, ({ one }) => ({
// 	author: one(User, {
// 		fields: [Post.userId],
// 		references: [User.id],
// 	}),
// }));

// const AvatarsRelations = relations(Avatar, ({ one }) => ({
// 	user: one(User, {
// 		fields: [Avatar.userId],
// 		references: [User.id],
// 	}),
// }));

export {};
