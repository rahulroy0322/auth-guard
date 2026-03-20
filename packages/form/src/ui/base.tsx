import type { FC, ReactNode } from "react";
import {
	Field,
	FieldContent,
	FieldDescription,
	FieldError,
	FieldLabel,
} from "ui/components/ui/field";
import { useFieldContext } from "../main";

type FormControllPropsType = {
	label: string;
	description?: string;
	addon?: ReactNode;
};

type FormBasePropsType = FormControllPropsType & {
	children: ReactNode;
};

const FormBase: FC<FormBasePropsType> = ({
	children,
	label,
	description,
	addon,
}) => {
	const field = useFieldContext();
	const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

	return (
		<Field data-invalid={isInvalid}>
			<FieldContent>
				<div className="flex items-center">
					<FieldLabel htmlFor={field.name}>{label}</FieldLabel>
					{addon}
				</div>
				{description && <FieldDescription>{description}</FieldDescription>}
			</FieldContent>
			{children}
			{isInvalid && !!field.state.meta.errors.length && (
				<FieldError errors={field.state.meta.errors} />
			)}
		</Field>
	);
};

export type { FormControllPropsType };
export { FormBase };
