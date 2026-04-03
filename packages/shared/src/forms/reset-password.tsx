import { useAppForm } from "form";
import { type FC, type SubmitEvent, useCallback } from "react";
import { updatePasswordSchema, verifySchema } from "schema";
import { Button } from "ui/components/ui/button";
import { Field, FieldDescription } from "ui/components/ui/field";
import { Base } from "./base";
import type { BrandingOnlySrcType } from "./types";

const resetPasswordFormSchema = updatePasswordSchema.extend({
	code: verifySchema.shape.code,
});

type ResetPasswordSchemaType = {
	code: string;
	password: string;
	confirm: string;
};

type ResetPasswordFormPropsType = Parameters<typeof Button>[0] & {
	email?: string;
	handleSubmit: (value: ResetPasswordSchemaType) => void | Promise<void>;
	pending: boolean;
} & BrandingOnlySrcType;

const ResetPasswordForm: FC<ResetPasswordFormPropsType> = ({
	email,
	handleSubmit: parentSubmit,
	pending,
	src,
	...props
}) => {
	const { AppField, handleSubmit: submit } = useAppForm({
		defaultValues: {
			code: "",
			password: "",
			confirm: "",
		} satisfies ResetPasswordSchemaType as ResetPasswordSchemaType,
		validators: {
			onSubmit: resetPasswordFormSchema,
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
			alt="Reset password"
			title="Reset your password"
			description={
				email
					? `Enter the code sent to ${email} and choose a new password`
					: "Enter the reset code and choose a new password"
			}
		>
			<form
				className="space-y-2"
				onSubmit={handleSubmit}
				aria-disabled={pending}
			>
				<AppField name="code">
					{({ InputOTP }) => (
						<InputOTP label="Reset Code" placeholder={"*".repeat(6)} required />
					)}
				</AppField>
				<AppField name="password">
					{({ Password }) => (
						<Password
							className="cursor-pointer!"
							label="New Password"
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
					<Button type="submit" disabled={pending} aria-disabled={pending}>
						Reset password
					</Button>
				</Field>

				<FieldDescription>
					Back to sign in?{" "}
					<Button variant="link" type="button" className="p-0" {...props}>
						Login Here
					</Button>
				</FieldDescription>
			</form>
		</Base>
	);
};

export { ResetPasswordForm };
