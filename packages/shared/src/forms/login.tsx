import { RiAppleLine, RiGithubLine, RiGoogleLine } from "@remixicon/react";
import { useAppForm } from "form";
import type { FC } from "react";
import { Button } from "ui/components/ui/button";
import { Card, CardContent } from "ui/components/ui/card";
import {
	Field,
	FieldDescription,
	FieldGroup,
	FieldSeparator,
} from "ui/components/ui/field";

// biome-ignore lint/complexity/noBannedTypes: temp
type LoginFormPropsType = {};

const LoginForm: FC<LoginFormPropsType> = () => {
	const { AppField } = useAppForm({
		defaultValues: {
			email: "",
			password: "",
		},
	});

	return (
		<Card className="overflow-hidden p-0">
			<CardContent className="grid p-0 md:grid-cols-2 overflow-hidden items-center">
				<FieldGroup className="p-6 md:p-8">
					<Field className="text-center">
						<h1 className="text-2xl font-bold">Welcome back</h1>
						{/* // ! TODO
                    / */}
						<p className="text-balance text-muted-foreground">
							Login to your Auth Guard account
						</p>
					</Field>

					<form
						className="space-y-2"
						onSubmit={(e) => {
							e.preventDefault();
						}}
					>
						<AppField name="email">
							{({ Input }) => (
								<Input
									label="Email"
									type="email"
									placeholder="jhondoe@example.com"
									required
								/>
							)}
						</AppField>
						<AppField name="password">
							{({ Password }) => (
								<Password
									addon={
										<Button variant="link" className="ml-auto">
											Forgot your password?
										</Button>
									}
									className="cursor-pointer!"
									label="Password"
									placeholder={"*".repeat(8)}
									required
								/>
							)}
						</AppField>

						<Field>
							<Button type="submit">Login</Button>
						</Field>
						<FieldDescription>
							Don&apos;t have an account?{" "}
							<Button variant="link">Sign up</Button>
						</FieldDescription>
					</form>

					<FieldSeparator>Or continue with</FieldSeparator>

					<Field>
						<Button disabled>
							<RiAppleLine />
							<span>Login with Apple</span>
						</Button>
					</Field>
					<Field>
						<Button>
							<RiGoogleLine />
							<span>Login with Google</span>
						</Button>
					</Field>
					<Field>
						<Button>
							<RiGithubLine />
							<span>Login with Github</span>
						</Button>
					</Field>
				</FieldGroup>

				<figure className="hidden bg-muted md:block">
					<img src="/favicon.svg" alt="Login" />
				</figure>
			</CardContent>
		</Card>
	);
};

export { LoginForm };
