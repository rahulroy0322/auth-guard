import type { FC } from "react";
import { DialogTrigger } from "ui/components/ui/dialog";
import { AuthBaseButton } from "./base.button";

type RegisterButtonPropsType = Parameters<typeof DialogTrigger>[0];

const RegisterButton: FC<RegisterButtonPropsType> = ({
	children = "Register",
	...props
}) => (
	<AuthBaseButton defaultState={"register"}>
		<DialogTrigger {...props}>{children}</DialogTrigger>
	</AuthBaseButton>
);

export { RegisterButton };
