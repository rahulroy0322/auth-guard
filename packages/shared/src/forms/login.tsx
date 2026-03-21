import { useAppForm } from "form";
import type { FC } from "react";
import { Button } from "ui/components/ui/button";
import { Field, FieldDescription } from "ui/components/ui/field";
import { Base } from "./base";

type LoginFormPropsType = Parameters<typeof Button>[0];

const LoginForm: FC<LoginFormPropsType> = (props) => {
	const { AppField } = useAppForm({
		defaultValues: {
			email: "",
			password: "",
		},
	});

	return (
		<Base
			src="/favicon.svg"
			alt="Login"
			title="Welcome back"
			// TODO!
			description="Login to your Auth Guard account"
		>
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
								<Button variant="link" type="button" className="ml-auto">
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
					<Button variant="link" type="button" className="p-0" {...props}>
						Register Here
					</Button>
				</FieldDescription>
			</form>
		</Base>
	);
};

export { LoginForm };
