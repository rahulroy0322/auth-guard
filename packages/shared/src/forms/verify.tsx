import { useAppForm } from "form";
import { type FC, type SubmitEvent, useCallback } from "react";
import { verifySchema } from "schema";
import { Button } from "ui/components/ui/button";
import { Field, FieldDescription } from "ui/components/ui/field";
import { Base } from "./base";

type VerifyFormPropsType = {
	email: string;
	pending: boolean;
	handleSubmit: (code: string) => void | Promise<void>;
	handleResend: () => void | Promise<void>;
	handleBack?: () => void;
};

type VerifySchemaType = {
	code: string;
};

const VerifyForm: FC<VerifyFormPropsType> = ({
	email,
	pending,
	handleSubmit,
	handleResend,
	handleBack,
}) => {
	const { AppField, handleSubmit: submit } = useAppForm({
		defaultValues: {
			code: "",
		} satisfies VerifySchemaType as VerifySchemaType,
		validators: {
			onSubmit: verifySchema.pick({
				code: true,
			}),
		},
		onSubmit: async ({ value }) => {
			await handleSubmit(value.code);
		},
	});

	const onSubmit = useCallback(
		(event: SubmitEvent<HTMLFormElement>) => {
			event.preventDefault();
			submit();
		},
		[submit],
	);

	return (
		<Base
			src="/favicon.svg"
			alt="Verify account"
			title="Verify your account"
			description={`Enter the 6-digit code sent to ${email}`}
		>
			<form className="space-y-4" onSubmit={onSubmit} aria-disabled={pending}>
				<AppField name="code">
					{({ InputOTP }) => (
						<InputOTP
							label="Verification Code"
							description="Use the one-time password from your email to finish signing in."
							placeholder={"*".repeat(6)}
							disabled={pending}
							required
						/>
					)}
				</AppField>

				<Field>
					<Button type="submit" disabled={pending}>
						Verify Account
					</Button>
				</Field>

				<FieldDescription className="flex items-center gap-2">
					<Button
						type="button"
						variant="link"
						className="p-0"
						disabled={pending}
						onClick={handleResend}
					>
						Resend code
					</Button>
					{handleBack ? (
						<Button
							type="button"
							variant="link"
							className="p-0"
							disabled={pending}
							onClick={handleBack}
						>
							Use another account
						</Button>
					) : null}
				</FieldDescription>
			</form>
		</Base>
	);
};

export { VerifyForm };
