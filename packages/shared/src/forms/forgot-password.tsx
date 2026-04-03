import { useAppForm } from "form";
import { type FC, type SubmitEvent, useCallback } from "react";
import { loginSchema } from "schema";
import { Button } from "ui/components/ui/button";
import { Field, FieldDescription } from "ui/components/ui/field";
import { Base } from "./base";
import type { BrandingOnlySrcType } from "./types";

type ForgotPasswordSchemaType = {
	email: string;
};

type ForgotPasswordFormPropsType = Parameters<typeof Button>[0] & {
	handleSubmit: (value: ForgotPasswordSchemaType) => void | Promise<void>;
	pending: boolean;
} & BrandingOnlySrcType;

const ForgotPasswordForm: FC<ForgotPasswordFormPropsType> = ({
	handleSubmit: parentSubmit,
	pending,
	src,
	...props
}) => {
	const { AppField, handleSubmit: submit } = useAppForm({
		defaultValues: {
			email: "",
		} satisfies ForgotPasswordSchemaType as ForgotPasswordSchemaType,
		validators: {
			onSubmit: loginSchema.pick({
				email: true,
			}),
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
			alt="Forgot password"
			title="Forgot your password?"
			description="Enter your email and we will send you a reset code"
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

				<Field>
					<Button type="submit" disabled={pending} aria-disabled={pending}>
						Send reset code
					</Button>
				</Field>

				<FieldDescription>
					Remembered your password?{" "}
					<Button variant="link" type="button" className="p-0" {...props}>
						Back to login
					</Button>
				</FieldDescription>
			</form>
		</Base>
	);
};

export { ForgotPasswordForm };
