import { z } from "zod";
import { OAuth } from "./base";

const userSchema = z.object({
	name: z.string().nullable(),
	login: z.string(),
	email: z.string().email(),
});

class Github extends OAuth<z.infer<typeof userSchema>> {
	constructor({
		clientId,
		clientSecret,
		callbackUri,
		scopes = ["user:email", "read:user"],
	}: {
		clientId: string;
		clientSecret: string;
		callbackUri: string;
		scopes?: string[];
	}) {
		super(
			"github",
			clientId,
			clientSecret,
			callbackUri,
			scopes,
			{
				auth: "https://github.com/login/oauth/authorize",
				token: "https://github.com/login/oauth/access_token",
				user: "https://api.github.com/user",
			},
			{
				schema: userSchema,
				parser: (user) => ({
					name: user.name ?? user.login,
					email: user.email,
				}),
			},
		);
	}
}

export { Github };
