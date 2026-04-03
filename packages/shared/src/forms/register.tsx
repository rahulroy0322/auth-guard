import type { UserType } from "base";
import { useAppForm } from "form";
import { type FC, type SubmitEvent, useCallback } from "react";
import { passwordSchema, registerSchema } from "schema";
import { Button } from "ui/components/ui/button";
import { Field, FieldDescription } from "ui/components/ui/field";
import { Base } from "./base";
import type { OAuthProviderOptionType } from "./oauth";
import type { BrandingType } from "./types";

const registerFrontendSchema = registerSchema
	.extend({
		confirm: passwordSchema,
	} satisfies {
		confirm: unknown;
	})
	.refine(({ password, confirm }) => password === confirm, {
		message: "Passwords don't match",
		path: ["confirm"],
	});

type RegisterSchemaType = Pick<UserType, "email" | "password" | "name"> & {
	confirm: string;
	password: string;
};

type RegisterFormPropsType = Parameters<typeof Button>[0] & {
	handleSubmit: (value: RegisterSchemaType) => void;
	pending: boolean;
	oauthProviders?: OAuthProviderOptionType[];
} & BrandingType;

const RegisterForm: FC<RegisterFormPropsType> = ({
	handleSubmit: parentSubmit,
	pending,
	oauthProviders,
	src,
	appName = "Auth Guard",
	...props
}) => {
	const { AppField, handleSubmit: submit } = useAppForm({
		defaultValues: {
			name: "",
			email: "",
			password: "",
			confirm: "",
		} satisfies RegisterSchemaType as RegisterSchemaType,
		validators: {
			onSubmit: registerFrontendSchema,
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
			alt="Register"
			title={`Create your account on ${appName}`}
			description="Enter your details below to create your account"
			oauthProviders={oauthProviders}
		>
			<form
				className="space-y-2"
				onSubmit={handleSubmit}
				aria-disabled={pending}
			>
				<AppField name="name">
					{({ Input }) => <Input label="Name" placeholder="Jhon Doe" />}
				</AppField>
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
					<Button type="submit" disabled={pending}>
						Register
					</Button>
				</Field>

				<FieldDescription>
					Already have an account?{" "}
					<Button type="button" variant="link" className="p-0" {...props}>
						Login Here
					</Button>
				</FieldDescription>
			</form>
		</Base>
	);
};

export { RegisterForm };
