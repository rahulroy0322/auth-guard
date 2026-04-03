import type { FC } from "react";
import {
	InputOTP,
	InputOTPGroup,
	InputOTPSlot,
} from "ui/components/ui/input-otp";
import { useFieldContext } from "../main";
import { FormBase, type FormControllPropsType } from "./base";

type FormInputOTPPropsType = FormControllPropsType &
	Omit<Parameters<typeof InputOTP>[0], "render" | "maxLength">;

const FormInputOTP: FC<FormInputOTPPropsType> = ({
	label,
	description,
	addon,
	...props
}) => {
	const field = useFieldContext<string>();
	const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

	return (
		<FormBase description={description} label={label} addon={addon}>
			<InputOTP
				{...props}
				aria-invalid={isInvalid}
				id={field.name}
				name={field.name}
				onBlur={field.handleBlur}
				onChange={field.handleChange}
				value={field.state.value}
				maxLength={6}
			>
				<InputOTPGroup className="mx-auto">
					<InputOTPSlot index={0} aria-invalid={isInvalid} />
					<InputOTPSlot index={1} aria-invalid={isInvalid} />
					<InputOTPSlot index={2} aria-invalid={isInvalid} />
					<InputOTPSlot index={3} aria-invalid={isInvalid} />
					<InputOTPSlot index={4} aria-invalid={isInvalid} />
					<InputOTPSlot index={5} aria-invalid={isInvalid} />
				</InputOTPGroup>
			</InputOTP>
		</FormBase>
	);
};

export { FormInputOTP };
