import { z } from "zod";
import { OAuth } from "./base";

const userSchema = z.object({
	name: z.string().nullable().optional(),
	email: z.email(),
	picture: z.url().nullable().optional(),
});

class Google extends OAuth<z.infer<typeof userSchema>> {
	constructor({
		clientId,
		clientSecret,
		callbackUri,
		scopes = ["openid", "email", "profile"],
	}: {
		clientId: string;
		clientSecret: string;
		callbackUri: string;
		scopes?: string[];
	}) {
		super(
			"google",
			clientId,
			clientSecret,
			callbackUri,
			scopes,
			{
				auth: "https://accounts.google.com/o/oauth2/v2/auth",
				token: "https://oauth2.googleapis.com/token",
				user: "https://openidconnect.googleapis.com/v1/userinfo",
			},
			{
				schema: userSchema,
				parser: (user) => ({
					name: user.name ?? user.email,
					email: user.email,
					avatarUrl: user.picture || null,
				}),
			},
		);
	}
}

export { Google };
