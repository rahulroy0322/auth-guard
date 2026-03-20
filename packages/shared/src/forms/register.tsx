import { useAppForm } from "form";
import type { FC } from "react";
import { Button } from "ui/components/ui/button";
import { Field, FieldDescription } from "ui/components/ui/field";
import { Base } from "./base";

type RegisterFormPropsType = Parameters<typeof Button>[0];

const RegisterForm: FC<RegisterFormPropsType> = (props) => {
	const { AppField } = useAppForm({
		defaultValues: {
			name: "",
			email: "",
			password: "",
			confirm: "",
		},
	});

	return (
		<Base
			src="/favicon.svg"
			alt="Login"
			title="Create your account"
			description="Enter your details below to create your account"
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
							label="Confirm Password"
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
					<Button variant="link" className="p-0" {...props}>
						Login Here
					</Button>
				</FieldDescription>
			</form>
		</Base>
	);
};

export { RegisterForm };
