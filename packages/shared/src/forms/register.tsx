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
type RegisterFormPropsType = {};

const RegisterForm: FC<RegisterFormPropsType> = () => {
	const { AppField } = useAppForm({
		defaultValues: {
			name: "",
			email: "",
			password: "",
			confirm: "",
		},
	});

	return (
		<Card className="overflow-hidden p-0 ring-0">
			<CardContent className="grid p-0 md:grid-cols-2 overflow-hidden items-center">
				<FieldGroup className="p-6 md:p-8">
					<Field className="text-center">
						<h1 className="text-2xl font-bold">Create your account</h1>
						<p className="text-balance text-muted-foreground">
							Enter your details below to create your account
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
									className="cursor-pointer!"
									label="Password"
									placeholder={"*".repeat(8)}
									required
								/>
							)}
						</AppField>
						<AppField name="confirm">
							{({ Password }) => (
								<Password
									className="cursor-pointer!"
									label="Password"
									placeholder={"*".repeat(8)}
									required
								/>
							)}
						</AppField>
						<Field>
							<Button type="submit">Register</Button>
						</Field>
						<FieldDescription>
							Already have an account?{" "}
							<Button variant="link">Login Here</Button>
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

export { RegisterForm };
