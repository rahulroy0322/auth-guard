import type { UserType } from "base";
import { useAppForm } from "form";
import { type FC, type SubmitEvent, useCallback } from "react";
import { loginSchema } from "schema";
import { Button } from "ui/components/ui/button";
import { Field, FieldDescription } from "ui/components/ui/field";
import { Base } from "./base";
import type { OAuthProviderOptionType } from "./oauth";
import type { BrandingType } from "./types";

type LoginSchemaType = Pick<UserType, "email" | "password"> & {
	password: string;
};

type LoginFormPropsType = Parameters<typeof Button>[0] & {
	handleSubmit: (value: LoginSchemaType) => void;
	pending: boolean;
	oauthProviders?: OAuthProviderOptionType[];
	forgotPasswordProps?: Parameters<typeof Button>[0];
} & BrandingType;

const LoginForm: FC<LoginFormPropsType> = ({
	handleSubmit: parentSubmit,
	pending,
	oauthProviders,
	forgotPasswordProps,
	src,
	appName = "Auth Guard",
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
			src={src}
			alt="Login"
			title="Welcome back"
			description={`Login to your ${appName} account`}
			oauthProviders={oauthProviders}
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
								<Button
									variant="link"
									type="button"
									className="ml-auto"
									{...forgotPasswordProps}
								>
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
