import type { UserType } from "base";
import { useAppForm } from "form";
import { type FC, type SubmitEvent, useCallback } from "react";
import { loginSchema } from "schema";
import { Button } from "ui/components/ui/button";
import { Field, FieldDescription } from "ui/components/ui/field";
import { Base } from "./base";

type LoginSchemaType = Omit<UserType, "id" | "roles" | "name"> & {
	password: string;
};

type LoginFormPropsType = Parameters<typeof Button>[0] & {
	handleSubmit: (value: LoginSchemaType) => void;
	pending: boolean;
};

const LoginForm: FC<LoginFormPropsType> = ({
	handleSubmit: parentSubmit,
	pending,
	...props
}) => {
	const { AppField, handleSubmit: submit } = useAppForm({
		defaultValues: {
			email: "",
			password: "",
		} satisfies LoginSchemaType as LoginSchemaType,
		validators: {
			onSubmit: loginSchema,
		},
		onSubmit: ({ value }) => {
			parentSubmit(value);
		},
	});

	const handleSubmit = useCallback(
		(e: SubmitEvent<HTMLFormElement>) => {
			e.preventDefault();
			submit();
		},
		[submit],
	);

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
				onSubmit={handleSubmit}
				aria-disabled={pending}
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
					<Button type="submit" disabled={pending} aria-disabled={pending}>
						Login
					</Button>
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
