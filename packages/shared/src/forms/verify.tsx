import { type FC, type SubmitEvent, useMemo, useState } from "react";
import { verifieSchema } from "schema";
import { Button } from "ui/components/ui/button";
import {
	Field,
	FieldDescription,
	FieldError,
	FieldLabel,
} from "ui/components/ui/field";
import {
	InputOTP,
	InputOTPGroup,
	InputOTPSlot,
} from "ui/components/ui/input-otp";
import { Base } from "./base";

type VerifyFormPropsType = {
	email: string;
	pending: boolean;
	handleSubmit: (code: string) => void | Promise<void>;
	handleResend: () => void | Promise<void>;
	handleBack?: () => void;
};

const VerifyForm: FC<VerifyFormPropsType> = ({
	email,
	pending,
	handleSubmit,
	handleResend,
	handleBack,
}) => {
	const [code, setCode] = useState("");
	const [error, setError] = useState<string | null>(null);

	const isValidCode = useMemo(
		() => verifieSchema.shape.code.safeParse(code).success,
		[code],
	);

	const onSubmit = async (event: SubmitEvent<HTMLFormElement>) => {
		event.preventDefault();

		const parsed = verifieSchema.shape.code.safeParse(code);
		if (!parsed.success) {
			setError(parsed.error.issues[0]?.message ?? "Invalid code");
			return;
		}

		setError(null);
		await handleSubmit(parsed.data);
	};

	return (
		<Base
			src="/favicon.svg"
			alt="Verify account"
			title="Verify your account"
			description={`Enter the 6-digit code sent to ${email}`}
		>
			<form className="space-y-4" onSubmit={onSubmit} aria-disabled={pending}>
				<Field data-invalid={!!error}>
					<FieldLabel>Verification Code</FieldLabel>
					<FieldDescription>
						Use the one-time password from your email to finish signing in.
					</FieldDescription>
					<InputOTP
						value={code}
						onChange={(value) => {
							setCode(value);
							if (error) {
								setError(null);
							}
						}}
						maxLength={6}
						disabled={pending}
					>
						<InputOTPGroup className="mx-auto">
							<InputOTPSlot index={0} aria-invalid={!!error} />
							<InputOTPSlot index={1} aria-invalid={!!error} />
							<InputOTPSlot index={2} aria-invalid={!!error} />
							<InputOTPSlot index={3} aria-invalid={!!error} />
							<InputOTPSlot index={4} aria-invalid={!!error} />
							<InputOTPSlot index={5} aria-invalid={!!error} />
						</InputOTPGroup>
					</InputOTP>
					{error ? <FieldError>{error}</FieldError> : null}
				</Field>

				<Field>
					<Button type="submit" disabled={pending || !isValidCode}>
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
